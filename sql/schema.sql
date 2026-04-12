-- PostgreSQL / MySQL (ajustar tipos si hace falta)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255),
  reset_token VARCHAR(64),
  reset_expires BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS celulares (
  id SERIAL PRIMARY KEY,
  marca VARCHAR(255),
  email VARCHAR(255),
  pulgadas DOUBLE PRECISION,
  megapx INTEGER,
  ram INTEGER,
  almacenamientoPpal INTEGER,
  almacenamientoSecun INTEGER,
  sistemaOperativo VARCHAR(128),
  operador VARCHAR(128),
  tecnologiaDeBanda VARCHAR(128),
  wifi SMALLINT NOT NULL DEFAULT 0,
  bluetooth SMALLINT NOT NULL DEFAULT 0,
  camaras INTEGER,
  marcaCpu VARCHAR(128),
  velocidadCpu DOUBLE PRECISION,
  nfc SMALLINT NOT NULL DEFAULT 0,
  huella SMALLINT NOT NULL DEFAULT 0,
  ir SMALLINT NOT NULL DEFAULT 0,
  resteAgua SMALLINT NOT NULL DEFAULT 0,
  cantidadSim INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_celulares_marca ON celulares(marca);
CREATE INDEX IF NOT EXISTS idx_celulares_so ON celulares(sistemaOperativo);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
