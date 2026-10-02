BEGIN;

ALTER TABLE public.historias_clinicas
  ADD COLUMN IF NOT EXISTS datos_completos JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS odontograma JSONB NOT NULL DEFAULT '{"dientes": {}}'::jsonb,
  ADD COLUMN IF NOT EXISTS notas_medico TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS plan_tratamiento JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();

UPDATE public.historias_clinicas AS h
SET datos_completos = CASE
  WHEN h.datos_completos ? 'historiaClinica' THEN h.datos_completos
  WHEN h.datos_completos <> '{}'::jsonb THEN jsonb_build_object(
    'version', 1,
    'historiaClinica', h.datos_completos
  )
  ELSE jsonb_build_object(
    'version', 1,
    'historiaClinica', jsonb_strip_nulls(
      to_jsonb(h) - ARRAY[
        'id',
        'created_at',
        'updated_at',
        'datos_completos',
        'odontograma',
        'notas_medico',
        'plan_tratamiento'
      ]::TEXT[]
    )
  )
END,
updated_at = NOW();

CREATE INDEX IF NOT EXISTS idx_historias_datos_completos
  ON public.historias_clinicas USING GIN (datos_completos jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_historias_folio_json
  ON public.historias_clinicas ((datos_completos #>> '{historiaClinica,folio}'));

CREATE INDEX IF NOT EXISTS idx_historias_consultorio_json
  ON public.historias_clinicas ((datos_completos #>> '{historiaClinica,consultorioAtencion}'));

CREATE OR REPLACE FUNCTION public.guardar_seccion_expediente(
  p_historia_id UUID,
  p_seccion TEXT,
  p_datos JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  expediente_actualizado JSONB;
BEGIN
  IF p_seccion NOT IN (
    'autorizacionConsentimiento',
    'contrato',
    'contratoBancario',
    'consentimiento',
    'pagoParticular',
    'financiamientoBancario'
  ) THEN
    RAISE EXCEPTION 'Sección de expediente no permitida: %', p_seccion;
  END IF;

  UPDATE public.historias_clinicas
  SET
    datos_completos = jsonb_set(
      COALESCE(datos_completos, '{}'::jsonb),
      ARRAY[p_seccion],
      COALESCE(p_datos, '{}'::jsonb),
      TRUE
    ),
    updated_at = NOW()
  WHERE id = p_historia_id
  RETURNING datos_completos INTO expediente_actualizado;

  IF expediente_actualizado IS NULL THEN
    RAISE EXCEPTION 'Historia clínica no encontrada: %', p_historia_id;
  END IF;

  RETURN expediente_actualizado;
END;
$$;

REVOKE ALL ON FUNCTION public.guardar_seccion_expediente(UUID, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guardar_seccion_expediente(UUID, TEXT, JSONB) TO anon, authenticated;

COMMENT ON COLUMN public.historias_clinicas.datos_completos IS 'Expediente JSON completo y versionado con todas las etapas del flujo';
COMMENT ON COLUMN public.historias_clinicas.odontograma IS 'Estados completos del odontograma inicial y del odontograma posterior a estudios auxiliares';
COMMENT ON COLUMN public.historias_clinicas.notas_medico IS 'Notas médicas capturadas junto con el odontograma';
COMMENT ON COLUMN public.historias_clinicas.plan_tratamiento IS 'Plan, costos, subsidio y semanas del tratamiento';
COMMENT ON FUNCTION public.guardar_seccion_expediente(UUID, TEXT, JSONB) IS 'Agrega o reemplaza atómicamente una sección permitida del expediente completo';

COMMIT;
