import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import db from "./db.js";
import { signToken, verifyToken } from "./auth.js";
import { sendResetEmail } from "./mail.js";

const app = express();
app.use(cors());
app.use(express.json());

const port = Number(process.env.PORT || 3000);

/* ---------- auth ---------- */
app.post("/api/auth/registro", (req, res) => {
  const { email, password, nombre } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email y password requeridos" });
  try {
    const hash = bcrypt.hashSync(password, 10);
    const r = db
      .prepare("INSERT INTO usuarios (email, password_hash, nombre) VALUES (?,?,?)")
      .run(email, hash, nombre || null);
    return res.status(201).json({ id: r.lastInsertRowid, email, nombre: nombre || null });
  } catch (e) {
    if (String(e).includes("UNIQUE")) return res.status(409).json({ error: "email ya registrado" });
    throw e;
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email y password requeridos" });
  const u = db.prepare("SELECT * FROM usuarios WHERE email = ?").get(email);
  if (!u || !bcrypt.compareSync(password, u.password_hash)) {
    return res.status(401).json({ error: "credenciales invalidas" });
  }
  const token = signToken({ sub: u.id, email: u.email });
  return res.json({ token, usuario: { id: u.id, email: u.email, nombre: u.nombre } });
});

app.post("/api/auth/recuperar-clave", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "email requerido" });
  const u = db.prepare("SELECT id FROM usuarios WHERE email = ?").get(email);
  if (!u) return res.json({ ok: true, mensaje: "Si el email existe, se envio el codigo" });
  const token = uuidv4().replace(/-/g, "").slice(0, 10);
  const expires = Date.now() + 3600000;
  db.prepare("UPDATE usuarios SET reset_token = ?, reset_expires = ? WHERE id = ?").run(token, expires, u.id);
  await sendResetEmail(email, token);
  return res.json({ ok: true, mensaje: "Si el email existe, se envio el codigo" });
});

app.post("/api/auth/restablecer-clave", (req, res) => {
  const { email, codigo, nuevaPassword } = req.body || {};
  if (!email || !codigo || !nuevaPassword) {
    return res.status(400).json({ error: "email, codigo y nuevaPassword requeridos" });
  }
  const u = db.prepare("SELECT * FROM usuarios WHERE email = ?").get(email);
  if (!u || !u.reset_token || u.reset_token !== codigo) {
    return res.status(400).json({ error: "codigo invalido" });
  }
  if (!u.reset_expires || Date.now() > u.reset_expires) {
    return res.status(400).json({ error: "codigo expirado" });
  }
  const hash = bcrypt.hashSync(nuevaPassword, 10);
  db.prepare("UPDATE usuarios SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?").run(
    hash,
    u.id
  );
  return res.json({ ok: true });
});

/* ---------- usuarios CRUD ---------- */
app.get("/api/usuarios", verifyToken, (req, res) => {
  const rows = db
    .prepare(
      "SELECT id, email, nombre, created_at FROM usuarios ORDER BY id"
    )
    .all();
  res.json(rows);
});

app.get("/api/usuarios/:id", verifyToken, (req, res) => {
  const row = db
    .prepare("SELECT id, email, nombre, created_at FROM usuarios WHERE id = ?")
    .get(req.params.id);
  if (!row) return res.status(404).json({ error: "no encontrado" });
  res.json(row);
});

app.post("/api/usuarios", verifyToken, (req, res) => {
  const { email, password, nombre } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email y password requeridos" });
  try {
    const hash = bcrypt.hashSync(password, 10);
    const r = db.prepare("INSERT INTO usuarios (email, password_hash, nombre) VALUES (?,?,?)").run(
      email,
      hash,
      nombre || null
    );
    res.status(201).json({ id: r.lastInsertRowid, email, nombre: nombre || null });
  } catch (e) {
    if (String(e).includes("UNIQUE")) return res.status(409).json({ error: "email duplicado" });
    throw e;
  }
});

app.put("/api/usuarios/:id", verifyToken, (req, res) => {
  const { email, password, nombre } = req.body || {};
  const id = req.params.id;
  const u = db.prepare("SELECT id FROM usuarios WHERE id = ?").get(id);
  if (!u) return res.status(404).json({ error: "no encontrado" });
  if (email) db.prepare("UPDATE usuarios SET email = ? WHERE id = ?").run(email, id);
  if (nombre !== undefined) db.prepare("UPDATE usuarios SET nombre = ? WHERE id = ?").run(nombre, id);
  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare("UPDATE usuarios SET password_hash = ? WHERE id = ?").run(hash, id);
  }
  res.json({ ok: true });
});

app.delete("/api/usuarios/:id", verifyToken, (req, res) => {
  const r = db.prepare("DELETE FROM usuarios WHERE id = ?").run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: "no encontrado" });
  res.json({ ok: true });
});

/* ---------- celulares CRUD ---------- */
function rowCelular(body) {
  return {
    marca: body.marca ?? null,
    email: body.email ?? null,
    pulgadas: body.pulgadas ?? null,
    megapx: body.megapx ?? null,
    ram: body.ram ?? null,
    almacenamientoPpal: body.almacenamientoPpal ?? null,
    almacenamientoSecun: body.almacenamientoSecun ?? null,
    sistemaOperativo: body.sistemaOperativo ?? null,
    operador: body.operador ?? null,
    tecnologiaDeBanda: body.tecnologiaDeBanda ?? null,
    wifi: body.wifi ? 1 : 0,
    bluetooth: body.bluetooth ? 1 : 0,
    camaras: body.camaras ?? null,
    marcaCpu: body.marcaCpu ?? null,
    velocidadCpu: body.velocidadCpu ?? null,
    nfc: body.nfc ? 1 : 0,
    huella: body.huella ? 1 : 0,
    ir: body.ir ? 1 : 0,
    resteAgua: body.resteAgua ? 1 : 0,
    cantidadSim: body.cantidadSim ?? null,
  };
}

app.get("/api/celulares", verifyToken, (req, res) => {
  const rows = db.prepare("SELECT * FROM celulares ORDER BY id").all();
  res.json(rows);
});

app.get("/api/celulares/:id", verifyToken, (req, res) => {
  const row = db.prepare("SELECT * FROM celulares WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "no encontrado" });
  res.json(row);
});

app.post("/api/celulares", verifyToken, (req, res) => {
  const c = rowCelular(req.body || {});
  const r = db
    .prepare(
      `INSERT INTO celulares (
        marca, email, pulgadas, megapx, ram, almacenamientoPpal, almacenamientoSecun,
        sistemaOperativo, operador, tecnologiaDeBanda, wifi, bluetooth, camaras,
        marcaCpu, velocidadCpu, nfc, huella, ir, resteAgua, cantidadSim
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .run(
      c.marca,
      c.email,
      c.pulgadas,
      c.megapx,
      c.ram,
      c.almacenamientoPpal,
      c.almacenamientoSecun,
      c.sistemaOperativo,
      c.operador,
      c.tecnologiaDeBanda,
      c.wifi,
      c.bluetooth,
      c.camaras,
      c.marcaCpu,
      c.velocidadCpu,
      c.nfc,
      c.huella,
      c.ir,
      c.resteAgua,
      c.cantidadSim
    );
  res.status(201).json({ id: r.lastInsertRowid, ...c });
});

app.put("/api/celulares/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  const ex = db.prepare("SELECT id FROM celulares WHERE id = ?").get(id);
  if (!ex) return res.status(404).json({ error: "no encontrado" });
  const c = rowCelular(req.body || {});
  db.prepare(
    `UPDATE celulares SET
      marca=?, email=?, pulgadas=?, megapx=?, ram=?, almacenamientoPpal=?, almacenamientoSecun=?,
      sistemaOperativo=?, operador=?, tecnologiaDeBanda=?, wifi=?, bluetooth=?, camaras=?,
      marcaCpu=?, velocidadCpu=?, nfc=?, huella=?, ir=?, resteAgua=?, cantidadSim=?
    WHERE id=?`
  ).run(
    c.marca,
    c.email,
    c.pulgadas,
    c.megapx,
    c.ram,
    c.almacenamientoPpal,
    c.almacenamientoSecun,
    c.sistemaOperativo,
    c.operador,
    c.tecnologiaDeBanda,
    c.wifi,
    c.bluetooth,
    c.camaras,
    c.marcaCpu,
    c.velocidadCpu,
    c.nfc,
    c.huella,
    c.ir,
    c.resteAgua,
    c.cantidadSim,
    id
  );
  res.json({ ok: true, id: Number(id), ...c });
});

app.delete("/api/celulares/:id", verifyToken, (req, res) => {
  const r = db.prepare("DELETE FROM celulares WHERE id = ?").run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: "no encontrado" });
  res.json({ ok: true });
});

/* ---------- reportes parametrizados: celulares ---------- */
app.get("/api/reportes/celulares/marca-operador", verifyToken, (req, res) => {
  const marca = req.query.marca || "";
  const operador = req.query.operador || "";
  const rows = db
    .prepare(
      `SELECT * FROM celulares WHERE (? = '' OR marca LIKE '%' || ? || '%')
        AND (? = '' OR operador LIKE '%' || ? || '%') ORDER BY id`
    )
    .all(marca, marca, operador, operador);
  res.json({ parametros: { marca, operador }, filas: rows });
});

app.get("/api/reportes/celulares/ram-so", verifyToken, (req, res) => {
  const ramMin = req.query.ramMin != null && req.query.ramMin !== "" ? Number(req.query.ramMin) : null;
  const sistemaOperativo = req.query.sistemaOperativo || "";
  let sql = `SELECT * FROM celulares WHERE 1=1`;
  const params = [];
  if (ramMin != null && !Number.isNaN(ramMin)) {
    sql += ` AND ram >= ?`;
    params.push(ramMin);
  }
  if (sistemaOperativo) {
    sql += ` AND sistemaOperativo LIKE '%' || ? || '%'`;
    params.push(sistemaOperativo);
  }
  sql += ` ORDER BY id`;
  const rows = db.prepare(sql).all(...params);
  res.json({ parametros: { ramMin, sistemaOperativo }, filas: rows });
});

/* ---------- reportes parametrizados: usuarios ---------- */
app.get("/api/reportes/usuarios/dominio-nombre", verifyToken, (req, res) => {
  const dominio = req.query.dominio || "";
  const nombreLike = req.query.nombreLike || "";
  const rows = db
    .prepare(
      `SELECT id, email, nombre, created_at FROM usuarios
       WHERE (? = '' OR email LIKE '%' || ? || '%')
       AND (? = '' OR nombre LIKE '%' || ? || '%')
       ORDER BY id`
    )
    .all(dominio, dominio, nombreLike, nombreLike);
  res.json({ parametros: { dominio, nombreLike }, filas: rows });
});

app.get("/api/reportes/usuarios/creados-desde", verifyToken, (req, res) => {
  const desde = req.query.desde || "";
  const hasta = req.query.hasta || "";
  let sql = `SELECT id, email, nombre, created_at FROM usuarios WHERE 1=1`;
  const params = [];
  if (desde) {
    sql += ` AND date(created_at) >= date(?)`;
    params.push(desde);
  }
  if (hasta) {
    sql += ` AND date(created_at) <= date(?)`;
    params.push(hasta);
  }
  sql += ` ORDER BY created_at`;
  const rows = db.prepare(sql).all(...params);
  res.json({ parametros: { desde, hasta }, filas: rows });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "error servidor" });
});

app.listen(port, () => {
  console.log(`API http://localhost:${port}`);
});
