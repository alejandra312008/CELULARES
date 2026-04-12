# Celulares (Kodular + API)

## Clonar

```bash
git clone <URL_PUBLICO_GITHUB>
cd CELULARES
```

## Backend (API + SQLite)

```bash
cd backend
copy .env.example .env
npm install
npm start
```

Editar `.env`: `JWT_SECRET`, y para correo de recuperación `SMTP_*` y `MAIL_FROM`.

Probar: `http://localhost:3000/api/health`

Desde el móvil: usar la IP de la PC en la misma red, puerto `3000`, en el componente Web de Kodular (`http://192.168.x.x:3000`).

## APK

Compilar y exportar APK en [Kodular](https://kodular.io) (Build > Android App Bundle / APK). Colocar el `.apk` en la carpeta `apk/` antes de entregar (opcional en repo si pesa mucho: usar Git LFS o adjuntar en release).

## Archivos

- `backend/` — servidor Node (CRUD 2 tablas, reportes, login, email recuperación).
- `sql/schema.sql` — mismo modelo para PostgreSQL/MySQL en la nube (Neon, Supabase, etc.).
- `kodular/endpoints.json` — rutas para el componente Web.

## GitHub (cuenta institucional)

```bash
cd CELULARES
git init
git add .
git commit -m "Proyecto Celulares Corte 1"
git branch -M main
git remote add origin https://github.com/USUARIO/REPO.git
git push -u origin main
```
