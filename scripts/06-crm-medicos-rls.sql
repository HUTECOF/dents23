BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.crm_medicos (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  nip_hash TEXT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.historias_clinicas
  ADD COLUMN IF NOT EXISTS ingreso_mensual NUMERIC,
  ADD COLUMN IF NOT EXISTS estado_prospecto TEXT NOT NULL DEFAULT 'prospecto',
  ADD COLUMN IF NOT EXISTS convertido_paciente BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS fecha_conversion TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES public.crm_medicos(id),
  ADD COLUMN IF NOT EXISTS workflow_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS workflow_expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.pacientes
  ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES public.crm_medicos(id);

CREATE INDEX IF NOT EXISTS idx_historias_doctor_id ON public.historias_clinicas(doctor_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_doctor_id ON public.pacientes(doctor_id);

CREATE OR REPLACE FUNCTION public.configurar_medico_crm(
  p_email TEXT,
  p_nombre TEXT,
  p_slug TEXT,
  p_nip TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  usuario_id UUID;
BEGIN
  IF p_nip !~ '^[0-9]{6,8}$' THEN
    RAISE EXCEPTION 'El NIP debe contener entre 6 y 8 dígitos';
  END IF;

  SELECT id INTO usuario_id
  FROM auth.users
  WHERE LOWER(email) = LOWER(p_email)
  LIMIT 1;

  IF usuario_id IS NULL THEN
    RAISE EXCEPTION 'Primero cree el usuario Auth con email %', p_email;
  END IF;

  INSERT INTO public.crm_medicos (id, nombre, slug, email, nip_hash, activo, updated_at)
  VALUES (usuario_id, p_nombre, p_slug, LOWER(p_email), crypt(p_nip, gen_salt('bf', 12)), TRUE, NOW())
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    slug = EXCLUDED.slug,
    email = EXCLUDED.email,
    nip_hash = EXCLUDED.nip_hash,
    activo = TRUE,
    updated_at = NOW();

  RETURN usuario_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.asignar_expedientes_sin_medico_a_erick()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  medico_id UUID;
  historias_actualizadas INTEGER;
BEGIN
  SELECT id INTO medico_id
  FROM public.crm_medicos
  WHERE slug = 'erick-mancilla' AND activo = TRUE;

  IF medico_id IS NULL THEN
    RAISE EXCEPTION 'La cuenta de Dr. Erick Mancilla aún no está configurada';
  END IF;

  UPDATE public.historias_clinicas
  SET doctor_id = medico_id, updated_at = NOW()
  WHERE doctor_id IS NULL;

  GET DIAGNOSTICS historias_actualizadas = ROW_COUNT;

  UPDATE public.pacientes AS p
  SET doctor_id = COALESCE(h.doctor_id, medico_id), updated_at = NOW()
  FROM public.historias_clinicas AS h
  WHERE p.historia_clinica_id = h.id
    AND p.doctor_id IS NULL;

  UPDATE public.pacientes
  SET doctor_id = medico_id, updated_at = NOW()
  WHERE doctor_id IS NULL;

  RETURN historias_actualizadas;
END;
$$;

CREATE OR REPLACE FUNCTION public.identificar_medico_por_nip(p_nip TEXT)
RETURNS TABLE (id UUID, nombre TEXT, slug TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.nombre, m.slug
  FROM public.crm_medicos AS m
  WHERE m.activo = TRUE
    AND m.nip_hash = crypt(p_nip, m.nip_hash)
  LIMIT 1;

  IF NOT FOUND THEN
    PERFORM pg_sleep(0.35);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.token_flujo_valido(p_historia_id UUID, p_token TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.historias_clinicas AS h
    WHERE h.id = p_historia_id
      AND h.workflow_token_hash IS NOT NULL
      AND h.workflow_expires_at > NOW()
      AND h.workflow_token_hash = crypt(p_token, h.workflow_token_hash)
  );
$$;

CREATE OR REPLACE FUNCTION public.guardar_historia_clinica_con_nip(
  p_historia JSONB,
  p_nip TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  medico public.crm_medicos%ROWTYPE;
  token_flujo TEXT;
  nueva_historia public.historias_clinicas%ROWTYPE;
BEGIN
  SELECT * INTO medico
  FROM public.crm_medicos
  WHERE activo = TRUE
    AND nip_hash = crypt(p_nip, nip_hash)
  LIMIT 1;

  IF medico.id IS NULL THEN
    PERFORM pg_sleep(0.35);
    RAISE EXCEPTION 'NIP médico inválido';
  END IF;

  token_flujo := encode(gen_random_bytes(32), 'hex');

  INSERT INTO public.historias_clinicas (
    empresa, antiguedad, fecha, nombre, ocupacion, direccion, edad, sexo, email, celular, telefono,
    recomendado_por, alergico, alergico_cual, salud_buena, medico_ultimo_anio,
    enfermedad_ultimos_6_meses, enfermedad_cuales, hipertension, hipertension_valor,
    tomando_medicamento, medicamento_cual, diabetes, diabetes_resultado, enfermedad_infecciosa,
    alteraciones_renales, cancer, sangrado_excesivo, embarazada, embarazada_meses, epilepsia,
    medicamentos_anticoagulantes, aspirinas, aspirinas_frec, notas_antecedentes, firma_antecedentes,
    ultima_visita_dentista, dolor_dental, dolor_frec, anestesia, reaccion_alergica_anestesia,
    complicacion_visita_dental, impedimento_anestesia, otra_enfermedad, firma_paciente_url,
    foto_paciente_url, tipo_paciente, datos_completos, odontograma, notas_medico, plan_tratamiento,
    doctor_id, workflow_token_hash, workflow_expires_at, updated_at
  ) VALUES (
    p_historia->>'empresa', p_historia->>'antiguedad', p_historia->>'fecha', p_historia->>'nombre',
    p_historia->>'ocupacion', p_historia->>'direccion', p_historia->>'edad', p_historia->>'sexo',
    p_historia->>'email', p_historia->>'celular', p_historia->>'telefono', p_historia->>'recomendado_por',
    p_historia->>'alergico', p_historia->>'alergico_cual', p_historia->>'salud_buena',
    p_historia->>'medico_ultimo_anio', p_historia->>'enfermedad_ultimos_6_meses',
    p_historia->>'enfermedad_cuales', p_historia->>'hipertension', p_historia->>'hipertension_valor',
    p_historia->>'tomando_medicamento', p_historia->>'medicamento_cual', p_historia->>'diabetes',
    p_historia->>'diabetes_resultado', p_historia->>'enfermedad_infecciosa',
    p_historia->>'alteraciones_renales', p_historia->>'cancer', p_historia->>'sangrado_excesivo',
    p_historia->>'embarazada', p_historia->>'embarazada_meses', p_historia->>'epilepsia',
    p_historia->>'medicamentos_anticoagulantes', p_historia->>'aspirinas', p_historia->>'aspirinas_frec',
    p_historia->>'notas_antecedentes', p_historia->>'firma_antecedentes',
    p_historia->>'ultima_visita_dentista', p_historia->>'dolor_dental', p_historia->>'dolor_frec',
    p_historia->>'anestesia', p_historia->>'reaccion_alergica_anestesia',
    p_historia->>'complicacion_visita_dental', p_historia->>'impedimento_anestesia',
    p_historia->>'otra_enfermedad', p_historia->>'firma_paciente_url', p_historia->>'foto_paciente_url',
    p_historia->>'tipo_paciente', COALESCE(p_historia->'datos_completos', '{}'::jsonb),
    COALESCE(p_historia->'odontograma', '{"inicial":{"dientes":{}},"final":{"dientes":{}}}'::jsonb),
    COALESCE(p_historia->>'notas_medico', ''), COALESCE(p_historia->'plan_tratamiento', '{}'::jsonb),
    medico.id, crypt(token_flujo, gen_salt('bf', 12)), NOW() + INTERVAL '30 days', NOW()
  ) RETURNING * INTO nueva_historia;

  RETURN jsonb_build_object(
    'historia', to_jsonb(nueva_historia) - ARRAY['workflow_token_hash']::TEXT[],
    'workflow_token', token_flujo
  );
END;
$$;

DROP FUNCTION IF EXISTS public.guardar_seccion_expediente(UUID, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.guardar_seccion_expediente(UUID, TEXT, JSONB, TEXT);

CREATE FUNCTION public.guardar_seccion_expediente(
  p_historia_id UUID,
  p_seccion TEXT,
  p_datos JSONB,
  p_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expediente_actualizado JSONB;
BEGIN
  IF p_seccion NOT IN (
    'autorizacionConsentimiento', 'contrato', 'contratoBancario',
    'consentimiento', 'pagoParticular', 'financiamientoBancario'
  ) THEN
    RAISE EXCEPTION 'Sección de expediente no permitida';
  END IF;

  IF NOT public.token_flujo_valido(p_historia_id, p_token) THEN
    RAISE EXCEPTION 'Sesión del expediente inválida o expirada';
  END IF;

  UPDATE public.historias_clinicas
  SET datos_completos = jsonb_set(
        COALESCE(datos_completos, '{}'::jsonb),
        ARRAY[p_seccion],
        COALESCE(p_datos, '{}'::jsonb),
        TRUE
      ),
      updated_at = NOW()
  WHERE id = p_historia_id
  RETURNING datos_completos INTO expediente_actualizado;

  RETURN expediente_actualizado;
END;
$$;

CREATE OR REPLACE FUNCTION public.guardar_contrato_flujo(
  p_historia_id UUID,
  p_token TEXT,
  p_contrato JSONB,
  p_datos JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  contrato_id UUID;
  contrato_guardado public.contratos%ROWTYPE;
BEGIN
  IF NOT public.token_flujo_valido(p_historia_id, p_token) THEN
    RAISE EXCEPTION 'Sesión del expediente inválida o expirada';
  END IF;

  SELECT id INTO contrato_id
  FROM public.contratos
  WHERE historia_clinica_id = p_historia_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF contrato_id IS NULL THEN
    INSERT INTO public.contratos (
      historia_clinica_id, colaborador_nombre, fecha_autorizacion, paciente_edad,
      celular_paciente, telefono_contacto, empresa, numero_nomina, antiguedad,
      area, departamento, diagnostico, tratamiento, costo_total, pago_semanal,
      numero_semanas, pago_efectivo, persona_designada, autoriza_deducciones,
      acepta_no_cancelacion, penalizacion_monto, firma_paciente, fecha_firma, ciudad_firma
    ) VALUES (
      p_historia_id, p_contrato->>'colaborador_nombre', p_contrato->>'fecha_autorizacion',
      p_contrato->>'paciente_edad', p_contrato->>'celular_paciente', p_contrato->>'telefono_contacto',
      p_contrato->>'empresa', p_contrato->>'numero_nomina', p_contrato->>'antiguedad',
      p_contrato->>'area', p_contrato->>'departamento', p_contrato->>'diagnostico',
      p_contrato->>'tratamiento', p_contrato->>'costo_total', p_contrato->>'pago_semanal',
      p_contrato->>'numero_semanas', COALESCE((p_contrato->>'pago_efectivo')::BOOLEAN, FALSE),
      p_contrato->>'persona_designada', COALESCE((p_contrato->>'autoriza_deducciones')::BOOLEAN, FALSE),
      COALESCE((p_contrato->>'acepta_no_cancelacion')::BOOLEAN, FALSE),
      p_contrato->>'penalizacion_monto', p_contrato->>'firma_paciente',
      p_contrato->>'fecha_firma', p_contrato->>'ciudad_firma'
    ) RETURNING * INTO contrato_guardado;
  ELSE
    UPDATE public.contratos SET
      colaborador_nombre = p_contrato->>'colaborador_nombre',
      fecha_autorizacion = p_contrato->>'fecha_autorizacion',
      paciente_edad = p_contrato->>'paciente_edad',
      celular_paciente = p_contrato->>'celular_paciente',
      telefono_contacto = p_contrato->>'telefono_contacto',
      empresa = p_contrato->>'empresa', numero_nomina = p_contrato->>'numero_nomina',
      antiguedad = p_contrato->>'antiguedad', area = p_contrato->>'area',
      departamento = p_contrato->>'departamento', diagnostico = p_contrato->>'diagnostico',
      tratamiento = p_contrato->>'tratamiento', costo_total = p_contrato->>'costo_total',
      pago_semanal = p_contrato->>'pago_semanal', numero_semanas = p_contrato->>'numero_semanas',
      pago_efectivo = COALESCE((p_contrato->>'pago_efectivo')::BOOLEAN, FALSE),
      persona_designada = p_contrato->>'persona_designada',
      autoriza_deducciones = COALESCE((p_contrato->>'autoriza_deducciones')::BOOLEAN, FALSE),
      acepta_no_cancelacion = COALESCE((p_contrato->>'acepta_no_cancelacion')::BOOLEAN, FALSE),
      penalizacion_monto = p_contrato->>'penalizacion_monto',
      firma_paciente = p_contrato->>'firma_paciente', fecha_firma = p_contrato->>'fecha_firma',
      ciudad_firma = p_contrato->>'ciudad_firma'
    WHERE id = contrato_id
    RETURNING * INTO contrato_guardado;
  END IF;

  UPDATE public.historias_clinicas
  SET datos_completos = jsonb_set(COALESCE(datos_completos, '{}'::jsonb), '{contrato}', COALESCE(p_datos, '{}'::jsonb), TRUE),
      updated_at = NOW()
  WHERE id = p_historia_id;

  RETURN to_jsonb(contrato_guardado);
END;
$$;

CREATE OR REPLACE FUNCTION public.guardar_consentimiento_flujo(
  p_historia_id UUID,
  p_token TEXT,
  p_consentimiento JSONB,
  p_datos JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  consentimiento_id UUID;
  consentimiento_guardado public.consentimientos%ROWTYPE;
BEGIN
  IF NOT public.token_flujo_valido(p_historia_id, p_token) THEN
    RAISE EXCEPTION 'Sesión del expediente inválida o expirada';
  END IF;

  SELECT id INTO consentimiento_id
  FROM public.consentimientos
  WHERE historia_clinica_id = p_historia_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF consentimiento_id IS NULL THEN
    INSERT INTO public.consentimientos (
      historia_clinica_id, nombre_paciente, representante_tutor, doctor_asignado,
      procedimiento, firma_paciente, nombre_paciente_firma, fecha_autorizacion, ciudad_autorizacion
    ) VALUES (
      p_historia_id, p_consentimiento->>'nombre_paciente', p_consentimiento->>'representante_tutor',
      p_consentimiento->>'doctor_asignado', p_consentimiento->>'procedimiento',
      p_consentimiento->>'firma_paciente', p_consentimiento->>'nombre_paciente_firma',
      p_consentimiento->>'fecha_autorizacion', p_consentimiento->>'ciudad_autorizacion'
    ) RETURNING * INTO consentimiento_guardado;
  ELSE
    UPDATE public.consentimientos SET
      nombre_paciente = p_consentimiento->>'nombre_paciente',
      representante_tutor = p_consentimiento->>'representante_tutor',
      doctor_asignado = p_consentimiento->>'doctor_asignado',
      procedimiento = p_consentimiento->>'procedimiento',
      firma_paciente = p_consentimiento->>'firma_paciente',
      nombre_paciente_firma = p_consentimiento->>'nombre_paciente_firma',
      fecha_autorizacion = p_consentimiento->>'fecha_autorizacion',
      ciudad_autorizacion = p_consentimiento->>'ciudad_autorizacion'
    WHERE id = consentimiento_id
    RETURNING * INTO consentimiento_guardado;
  END IF;

  UPDATE public.historias_clinicas
  SET datos_completos = jsonb_set(COALESCE(datos_completos, '{}'::jsonb), '{consentimiento}', COALESCE(p_datos, '{}'::jsonb), TRUE),
      updated_at = NOW()
  WHERE id = p_historia_id;

  RETURN to_jsonb(consentimiento_guardado);
END;
$$;

CREATE OR REPLACE FUNCTION public.asignar_doctor_paciente()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.doctor_id IS NULL AND NEW.historia_clinica_id IS NOT NULL THEN
    SELECT doctor_id INTO NEW.doctor_id
    FROM public.historias_clinicas
    WHERE id = NEW.historia_clinica_id;
  END IF;

  IF NEW.doctor_id IS NULL THEN
    NEW.doctor_id := auth.uid();
  END IF;

  IF NEW.doctor_id IS NULL THEN
    RAISE EXCEPTION 'No se pudo determinar el médico responsable';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_doctor_paciente ON public.pacientes;
CREATE TRIGGER set_doctor_paciente
BEFORE INSERT ON public.pacientes
FOR EACH ROW EXECUTE FUNCTION public.asignar_doctor_paciente();

CREATE OR REPLACE FUNCTION public.convertir_prospecto_a_paciente(historia_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nuevo_paciente_id UUID;
  historia public.historias_clinicas%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Autenticación requerida';
  END IF;

  SELECT * INTO historia
  FROM public.historias_clinicas
  WHERE id = historia_id
    AND doctor_id = auth.uid();

  IF historia.id IS NULL THEN
    RAISE EXCEPTION 'Historia clínica no encontrada o no autorizada';
  END IF;

  IF historia.convertido_paciente THEN
    RAISE EXCEPTION 'Este prospecto ya fue convertido a paciente';
  END IF;

  INSERT INTO public.pacientes (
    historia_clinica_id, doctor_id, nombre_completo, telefono, email, edad, sexo,
    direccion, empresa, ocupacion, antiguedad, ingreso_mensual, estado, prioridad
  ) VALUES (
    historia.id, historia.doctor_id, historia.nombre, COALESCE(historia.celular, historia.telefono),
    historia.email,
    CASE WHEN historia.edad::TEXT ~ '^[0-9]+$' THEN historia.edad::INTEGER ELSE NULL END,
    historia.sexo, historia.direccion, historia.empresa, historia.ocupacion, historia.antiguedad,
    CASE WHEN historia.ingreso_mensual::TEXT ~ '^[0-9.]+$' THEN historia.ingreso_mensual::NUMERIC ELSE NULL END,
    'activo', 'media'
  ) RETURNING id INTO nuevo_paciente_id;

  UPDATE public.historias_clinicas
  SET estado_prospecto = 'paciente', convertido_paciente = TRUE, fecha_conversion = NOW(), updated_at = NOW()
  WHERE id = historia_id;

  RETURN nuevo_paciente_id;
END;
$$;

DO $$
DECLARE
  politica RECORD;
BEGIN
  FOR politica IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'crm_medicos', 'historias_clinicas', 'pacientes', 'contratos', 'consentimientos',
        'citas', 'seguimientos', 'planes_pago', 'pagos', 'tratamientos', 'documentos'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', politica.policyname, politica.schemaname, politica.tablename);
  END LOOP;
END;
$$;

ALTER TABLE public.crm_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historias_clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consentimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planes_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tratamientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.crm_medicos FROM anon;
REVOKE ALL ON TABLE public.historias_clinicas FROM anon;
REVOKE ALL ON TABLE public.pacientes FROM anon;
REVOKE ALL ON TABLE public.contratos FROM anon;
REVOKE ALL ON TABLE public.consentimientos FROM anon;
REVOKE ALL ON TABLE public.citas FROM anon;
REVOKE ALL ON TABLE public.seguimientos FROM anon;
REVOKE ALL ON TABLE public.planes_pago FROM anon;
REVOKE ALL ON TABLE public.pagos FROM anon;
REVOKE ALL ON TABLE public.tratamientos FROM anon;
REVOKE ALL ON TABLE public.documentos FROM anon;

GRANT SELECT ON public.crm_medicos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.historias_clinicas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pacientes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contratos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consentimientos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.citas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seguimientos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planes_pago TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pagos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tratamientos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos TO authenticated;

CREATE POLICY crm_medicos_select_own ON public.crm_medicos
FOR SELECT TO authenticated
USING (id = auth.uid() AND activo = TRUE);

CREATE POLICY historias_medico_own ON public.historias_clinicas
FOR ALL TO authenticated
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY pacientes_medico_own ON public.pacientes
FOR ALL TO authenticated
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY contratos_medico_own ON public.contratos
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.historias_clinicas h
  WHERE h.id = contratos.historia_clinica_id AND h.doctor_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.historias_clinicas h
  WHERE h.id = contratos.historia_clinica_id AND h.doctor_id = auth.uid()
));

CREATE POLICY consentimientos_medico_own ON public.consentimientos
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.historias_clinicas h
  WHERE h.id = consentimientos.historia_clinica_id AND h.doctor_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.historias_clinicas h
  WHERE h.id = consentimientos.historia_clinica_id AND h.doctor_id = auth.uid()
));

CREATE POLICY citas_medico_own ON public.citas
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.pacientes p
  WHERE p.id = citas.paciente_id AND p.doctor_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.pacientes p
  WHERE p.id = citas.paciente_id AND p.doctor_id = auth.uid()
));

CREATE POLICY seguimientos_medico_own ON public.seguimientos
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.pacientes p
  WHERE p.id = seguimientos.paciente_id AND p.doctor_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.pacientes p
  WHERE p.id = seguimientos.paciente_id AND p.doctor_id = auth.uid()
));

CREATE POLICY planes_pago_medico_own ON public.planes_pago
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.pacientes p
  WHERE p.id = planes_pago.paciente_id AND p.doctor_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.pacientes p
  WHERE p.id = planes_pago.paciente_id AND p.doctor_id = auth.uid()
));

CREATE POLICY pagos_medico_own ON public.pagos
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.pacientes p
  WHERE p.id = pagos.paciente_id AND p.doctor_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.pacientes p
  WHERE p.id = pagos.paciente_id AND p.doctor_id = auth.uid()
));

CREATE POLICY tratamientos_medico_own ON public.tratamientos
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.pacientes p
  WHERE p.id = tratamientos.paciente_id AND p.doctor_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.pacientes p
  WHERE p.id = tratamientos.paciente_id AND p.doctor_id = auth.uid()
));

CREATE POLICY documentos_medico_own ON public.documentos
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.pacientes p
  WHERE p.id = documentos.paciente_id AND p.doctor_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.pacientes p
  WHERE p.id = documentos.paciente_id AND p.doctor_id = auth.uid()
));

REVOKE ALL ON FUNCTION public.configurar_medico_crm(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.asignar_expedientes_sin_medico_a_erick() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.token_flujo_valido(UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.convertir_prospecto_a_paciente(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.convertir_prospecto_a_paciente(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.identificar_medico_por_nip(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.identificar_medico_por_nip(TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.guardar_historia_clinica_con_nip(JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guardar_historia_clinica_con_nip(JSONB, TEXT) TO anon;

REVOKE ALL ON FUNCTION public.guardar_seccion_expediente(UUID, TEXT, JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guardar_seccion_expediente(UUID, TEXT, JSONB, TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.guardar_contrato_flujo(UUID, TEXT, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guardar_contrato_flujo(UUID, TEXT, JSONB, JSONB) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.guardar_consentimiento_flujo(UUID, TEXT, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guardar_consentimiento_flujo(UUID, TEXT, JSONB, JSONB) TO anon, authenticated;

COMMIT;
