# Dashboard Familiar

React app con plan semanal de comidas, lista de compras compartida en tiempo real, y generación de planes con Claude.

## Stack

- **Vite + React** — build y dev server
- **Firebase Realtime Database** — sync en tiempo real entre dispositivos
- **Anthropic API** — generación de planes semanales
- **Netlify** — hosting con deploy automático desde GitHub

---

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de variables de entorno
cp .env.example .env.local

# 3. Completar las variables en .env.local (ver sección Firebase abajo)

# 4. Correr en desarrollo
npm run dev
```

---

## Firebase (sync en tiempo real)

1. Ir a [console.firebase.google.com](https://console.firebase.google.com)
2. Crear proyecto nuevo (ej: `dashboard-familia`)
3. **Build → Realtime Database → Crear base de datos** → elegir "Modo de prueba"
4. **Configuración del proyecto** (⚙️) → **Agregar app web** → copiar el objeto `firebaseConfig`
5. Pegar los valores en `.env.local`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=dashboard-familia.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://dashboard-familia-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=dashboard-familia
VITE_FIREBASE_STORAGE_BUCKET=dashboard-familia.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc...
```

### Reglas de Firebase (después de los 30 días de modo test)

En Firebase Console → Realtime Database → Reglas:

```json
{
  "rules": {
    "dashboard": {
      ".read": true,
      ".write": true
    }
  }
}
```

---

## Deploy en Netlify

### Opción A — desde GitHub (recomendado)

1. Crear repositorio en GitHub y hacer push del proyecto
2. Ir a [netlify.com](https://netlify.com) → **Add new site → Import from Git**
3. Seleccionar el repo
4. Netlify detecta automáticamente el `netlify.toml` — no hace falta configurar nada
5. **Site settings → Environment variables** → agregar todas las variables de `.env.example` con sus valores reales

A partir de ahí, cada `git push` a `main` dispara un deploy automático.

### Opción B — drag and drop (sin GitHub)

```bash
npm run build
```

Arrastrar la carpeta `dist/` a [netlify.com/drop](https://app.netlify.com/drop).

---

## PIN de acceso

El PIN se configura como variable de entorno:

```env
VITE_APP_PIN=PIERA
```

Para cambiarlo: actualizar la variable en Netlify dashboard → redesplegar.

---

## Flujo del sábado

1. Abrir el dashboard → pestaña **✨ Nueva**
2. Describir los cambios de la semana (opcional)
3. Tap **"Generar plan con Claude"**
4. Revisar el preview y **publicar**
5. Sofía ve el plan actualizado al instante

---

## Estructura del proyecto

```
src/
  skills/
    meal-planner/     ← plan semanal, lista de compras, batch cooking
      data.js         ← datos estáticos (WEEK, SHOPS, BATCH)
      index.jsx       ← componentes (PlanView, ListaView, etc.)
    food-costs/       ← próximamente: tracker de precios y gastos
  shell/
    PinScreen.jsx     ← pantalla de autenticación
  lib/
    firebase.js       ← init Firebase con env vars
    storage.js        ← helpers de localStorage
  App.jsx             ← routing principal y Firebase subscriptions
  main.jsx            ← entry point
```

## Agregar una nueva skill

1. Crear `src/skills/nueva-skill/index.jsx`
2. Exportar un componente default
3. Importarlo en `App.jsx`
4. Agregar un botón en el nav

---

## Agregar Neon + Netlify Functions (para finanzas, futuro)

Cuando llegue el momento de construir el módulo de finanzas:

```bash
npm install @neondatabase/serverless
```

Agregar en `.env.local`:
```env
VITE_NEON_DATABASE_URL=postgresql://...
```

Crear funciones en `netlify/functions/`:
```
netlify/functions/
  get-expenses.js
  save-expense.js
```

Cada función es un Lambda serverless. Netlify las despliega automáticamente.
