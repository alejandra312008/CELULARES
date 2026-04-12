import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user, pass },
  });
  return transporter;
}

export async function sendResetEmail(to, token) {
  const t = getTransporter();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const body = `Recuperacion de clave. Usa este codigo en la app: ${token}\n\nCaduca en 1 hora.`;
  if (!t) {
    console.warn("[mail] SMTP no configurado. Codigo:", token, "para", to);
    return { ok: false, skipped: true, token };
  }
  await t.sendMail({
    from,
    to,
    subject: "Recuperacion de clave - Celulares",
    text: body,
  });
  return { ok: true };
}
