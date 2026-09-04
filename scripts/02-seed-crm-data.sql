-- Datos de ejemplo para el CRM
INSERT INTO pacientes (nombre_completo, telefono, email, fecha_nacimiento, direccion, motivo_consulta, estado, notas) VALUES
('María González López', '+52 555 123 4567', 'maria.gonzalez@email.com', '1985-03-15', 'Av. Reforma 123, CDMX', 'consulta-general', 'nuevo', 'Primera consulta, sin antecedentes relevantes'),
('Carlos Rodríguez Pérez', '+52 555 234 5678', 'carlos.rodriguez@email.com', '1978-07-22', 'Calle Juárez 456, Guadalajara', 'dolor-sintomas', 'en-tratamiento', 'Dolor de espalda crónico, requiere seguimiento'),
('Ana Martínez Silva', '+52 555 345 6789', 'ana.martinez@email.com', '1992-11-08', 'Blvd. Insurgentes 789, Monterrey', 'revision-rutinaria', 'activo', 'Paciente regular, chequeo anual'),
('Luis Hernández Torres', '+52 555 456 7890', 'luis.hernandez@email.com', '1965-05-30', 'Av. Universidad 321, Puebla', 'seguimiento', 'recuperacion', 'Post-operatorio, evolución favorable'),
('Carmen Jiménez Ruiz', '+52 555 567 8901', 'carmen.jimenez@email.com', '1988-09-12', 'Calle Morelos 654, Tijuana', 'examenes', 'pendiente', 'Esperando resultados de laboratorio');

INSERT INTO citas (paciente_id, fecha_cita, tipo_cita, estado, doctor, notas) VALUES
(1, '2024-01-15 10:00:00', 'Consulta General', 'programada', 'Dr. Ramírez', 'Primera cita del paciente'),
(2, '2024-01-16 14:30:00', 'Seguimiento', 'completada', 'Dr. López', 'Revisión de tratamiento para dolor de espalda'),
(3, '2024-01-17 09:15:00', 'Chequeo Anual', 'programada', 'Dra. García', 'Examen médico completo'),
(4, '2024-01-18 11:45:00', 'Post-operatorio', 'completada', 'Dr. Martín', 'Control post-quirúrgico satisfactorio'),
(5, '2024-01-19 16:00:00', 'Entrega Resultados', 'programada', 'Dr. Ramírez', 'Revisión de estudios de laboratorio');

INSERT INTO pagos (paciente_id, cita_id, monto, estado, metodo_pago, fecha_pago) VALUES
(2, 2, 1500.00, 'pagado', 'tarjeta', '2024-01-16 15:00:00'),
(4, 4, 2500.00, 'pagado', 'efectivo', '2024-01-18 12:00:00'),
(1, 1, 1200.00, 'pendiente', NULL, NULL),
(3, 3, 1800.00, 'pendiente', NULL, NULL),
(5, 5, 800.00, 'pendiente', NULL, NULL);

INSERT INTO seguimientos (paciente_id, tipo, descripcion, usuario, prioridad) VALUES
(1, 'Llamada', 'Confirmar cita programada para mañana', 'Recepcionista Ana', 'alta'),
(2, 'Recordatorio', 'Enviar recordatorio de medicamentos', 'Enfermera María', 'media'),
(3, 'Laboratorio', 'Programar estudios de sangre', 'Dr. García', 'media'),
(4, 'Control', 'Agendar cita de control en 2 semanas', 'Dr. Martín', 'baja'),
(5, 'Resultados', 'Contactar cuando lleguen resultados', 'Recepcionista Ana', 'alta');
