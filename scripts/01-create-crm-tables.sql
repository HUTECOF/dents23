-- Crear tablas para el CRM de la clínica
CREATE TABLE IF NOT EXISTS pacientes (
  id SERIAL PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  direccion TEXT NOT NULL,
  motivo_consulta VARCHAR(100) NOT NULL,
  foto_url TEXT,
  estado VARCHAR(50) DEFAULT 'nuevo',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notas TEXT
);

CREATE TABLE IF NOT EXISTS citas (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES pacientes(id),
  fecha_cita TIMESTAMP NOT NULL,
  tipo_cita VARCHAR(100) NOT NULL,
  estado VARCHAR(50) DEFAULT 'programada',
  doctor VARCHAR(255),
  notas TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pagos (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES pacientes(id),
  cita_id INTEGER REFERENCES citas(id),
  monto DECIMAL(10,2) NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente',
  metodo_pago VARCHAR(50),
  fecha_pago TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seguimientos (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES pacientes(id),
  tipo VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_seguimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario VARCHAR(255),
  prioridad VARCHAR(20) DEFAULT 'media'
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);
CREATE INDEX IF NOT EXISTS idx_pacientes_estado ON pacientes(estado);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_cita);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
