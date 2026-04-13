# Celulares (Kodular + API)

Repositorio público: `https://github.com/alejandra312008/CELULARES`

## Clonar y probar

```bash
git clone https://github.com/alejandra312008/CELULARES.git
cd CELULARES
```

### 1. Backend (API + base de datos SQLite)

Requisitos: [Node.js](https://nodejs.org/) LTS (incluye `npm`).

```bash
cd backend
copy .env.example .env
npm install
npm start
```

En `.env` configurar al menos `JWT_SECRET`. Para recuperación de clave por correo: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`.

Comprobar que el servidor responde: abrir en el navegador `http://localhost:3000/api/health` (debe devolver `{"ok":true}`).

**Teléfono y Kodular:** el teléfono debe estar en la misma red Wi‑Fi que la PC. En el componente Web de la app, usar la IP local de la PC y el puerto del backend, por ejemplo `http://192.168.0.10:3000` (sustituir por tu IP; en Windows: `ipconfig`).

### 2. Aplicación Android (compilado Kodular)

En el repositorio está el **Android App Bundle** generado en Kodular:

| Archivo | Descripción |
|--------|-------------|
| `android/U1.aab` | App Bundle (formato de publicación; es el entregable de compilación desde Kodular). |

**Instalar en el teléfono**

- Un **.aab** no se instala directamente como un APK. Opciones:
  - Volver a exportar desde Kodular un **APK** (Build → Android App Bundle / APK) e instalar el `.apk` con permisos de orígenes desconocidos activados, **o**
  - Usar [bundletool](https://developer.android.com/tools/bundletool) para generar APKs a partir de `U1.aab` (instalación avanzada).

**Código fuente Kodular**

- El código de bloques y pantallas está en el proyecto de **Kodular** (editor en la web). Para incluir el proyecto exportable, en Kodular usar **Export** / guardar proyecto y añadir el archivo **`.aia`** al repositorio con `git add`, `git commit` y `git push` (no usar “Upload” de la web de GitHub).

### 3. Estructura del repositorio

- `backend/` — API Node (CRUD `usuarios` y `celulares`, reportes, login, correo).
- `sql/schema.sql` — esquema para motor SQL en la nube si lo despliegas fuera de SQLite.
- `kodular/endpoints.json` — referencia de URLs y JSON para el componente Web.
- `android/U1.aab` — compilado Android desde Kodular.

## Subir cambios con Git (sin Upload en GitHub)

```bash
cd CELULARES
git add .
git status
git commit -m "Descripción del cambio"
git push origin main
```
