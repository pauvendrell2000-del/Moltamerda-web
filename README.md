# 🧹 Sistema de Reservas - Empresa de Limpieza Industrial

Portal de reservas B2B/B2C para servicios de limpieza industrial profesional. Sistema completo con portal público, panel de administración y notificaciones automáticas.

---

## 🚀 Características

### Portal Público
- ✅ Landing page profesional con diseño industrial refinado
- ✅ Formulario de reserva multi-paso con validación en tiempo real
- ✅ Selección de fecha con calendario (sin fines de semana)
- ✅ Confirmación inmediata con código de reserva único
- ✅ Email automático de confirmación al cliente

### Panel de Administración
- ✅ Autenticación segura con Supabase Auth
- ✅ Dashboard con KPIs en tiempo real
- ✅ Tabla de reservas con filtros y búsqueda
- ✅ Vista de detalle de cada reserva
- ✅ Gestión de estados (Pendiente → Confirmada → Completada)
- ✅ Email automático de confirmación oficial al aprobar

### Sistema de Notificaciones
- ✅ Email al cliente al crear reserva
- ✅ Email al negocio al crear reserva
- ✅ Email de confirmación oficial al aprobar reserva
- ✅ Templates profesionales con React Email

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Validación | Zod + React Hook Form |
| Email | Resend + React Email |
| Despliegue | Vercel |

---

## 📋 Prerequisitos

- Node.js 18+ y npm
- Cuenta de [Supabase](https://supabase.com)
- Cuenta de [Resend](https://resend.com)
- (Opcional) Cuenta de [Vercel](https://vercel.com)

---

## ⚙️ Instalación y Configuración

### 1. Clonar e instalar dependencias

```bash
cd limpieza-reservas
npm install
```

### 2. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com/dashboard)

2. Ejecuta el schema SQL en el editor SQL de Supabase:
   - Abre el archivo `supabase-schema.sql`
   - Copia y pega el contenido en el editor SQL de Supabase
   - Ejecuta el script

3. Crea un usuario admin en Supabase Auth:
   - Ve a `Authentication` → `Users`
   - Click en `Add User` → `Create new user`
   - Ingresa email y contraseña
   - Confirma el usuario

4. Obtén las credenciales del proyecto:
   - Ve a `Settings` → `API`
   - Copia `Project URL` y `anon public key`

### 3. Configurar Resend

1. Crea una cuenta en [Resend](https://resend.com)
2. Ve a `API Keys` y crea una nueva API key
3. Configura tu dominio (opcional pero recomendado):
   - Ve a `Domains` y agrega tu dominio
   - Sigue las instrucciones para verificar el dominio

### 4. Variables de Entorno

Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Completa las variables en `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Resend
RESEND_API_KEY=re_tu_api_key
RESEND_FROM_EMAIL=reservas@tu-dominio.com
RESEND_NOTIFY_EMAIL=admin@tu-dominio.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 🌐 Rutas de la Aplicación

### Portal Público
- `/` - Página de inicio
- `/reservar` - Formulario de reserva
- `/confirmacion/[id]` - Confirmación de reserva

### Panel de Administración
- `/admin/login` - Login de administrador
- `/admin/dashboard` - Dashboard principal
- `/admin/reservas/[id]` - Detalle de reserva

---

## 📧 Sistema de Emails

El sistema envía 3 tipos de emails automáticos:

### 1. Email de Confirmación al Cliente
**Cuándo:** Al crear una reserva nueva
**A quién:** Cliente que hizo la reserva
**Contenido:** Código de reserva + resumen de detalles

### 2. Email de Aviso al Negocio
**Cuándo:** Al crear una reserva nueva
**A quién:** Email configurado en `RESEND_NOTIFY_EMAIL`
**Contenido:** Notificación de nueva reserva + enlace al panel admin

### 3. Email de Confirmación Oficial
**Cuándo:** Cuando el admin confirma la reserva
**A quién:** Cliente que hizo la reserva
**Contenido:** Confirmación definitiva + instrucciones de acceso

---

## 🚢 Despliegue en Vercel

### 1. Preparar el repositorio

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/limpieza-reservas.git
git push -u origin main
```

### 2. Desplegar en Vercel

1. Ve a [Vercel](https://vercel.com/new)
2. Importa tu repositorio de GitHub
3. Configura las variables de entorno (todas las del `.env.local`)
4. Click en `Deploy`

### 3. Configurar dominio personalizado

1. En Vercel, ve a `Settings` → `Domains`
2. Agrega tu dominio personalizado
3. Sigue las instrucciones de DNS

### 4. Actualizar variables de entorno

Una vez desplegado, actualiza:

```env
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

---

## 📊 Flujo de Trabajo

### Usuario Final (Cliente)

1. Entra al portal público
2. Completa el formulario de reserva en 3 pasos:
   - Paso 1: Datos personales
   - Paso 2: Detalles del servicio
   - Paso 3: Fecha y observaciones
3. Recibe confirmación con código de reserva
4. Recibe email de confirmación automático
5. Espera confirmación oficial del negocio

### Administrador (Negocio)

1. Recibe email de nueva reserva
2. Inicia sesión en `/admin/login`
3. Ve el dashboard con:
   - Reservas esta semana
   - Reservas pendientes
   - Próxima reserva
4. Revisa detalles de cada reserva
5. Confirma, cancela o completa reservas
6. Al confirmar → cliente recibe email oficial

---

## 🎨 Diseño

### Paleta de Colores

```css
--primary: #1A2332        /* Azul marino oscuro */
--accent: #00A878         /* Verde limpieza */
--text-primary: #0F1923   /* Negro azulado */
--text-secondary: #6B7280 /* Gris */
--surface: #FFFFFF        /* Blanco */
--success: #10B981        /* Verde */
--warning: #F59E0B        /* Amarillo */
--danger: #EF4444         /* Rojo */
```

### Tipografías

- **Display/Títulos:** Plus Jakarta Sans
- **Cuerpo:** Inter
- **Monospace:** JetBrains Mono

---

## 🔒 Seguridad

- ✅ Row Level Security (RLS) en Supabase
- ✅ Middleware de autenticación en rutas `/admin/*`
- ✅ Validación de formularios con Zod
- ✅ Variables de entorno protegidas
- ✅ Usuarios anónimos solo pueden crear reservas (no leer)
- ✅ Solo usuarios autenticados pueden acceder al admin

---

## ✅ Checklist de Calidad

Antes de poner en producción, verifica:

- [ ] Schema SQL ejecutado en Supabase
- [ ] Usuario admin creado en Supabase Auth
- [ ] Variables de entorno configuradas correctamente
- [ ] Dominio de Resend verificado
- [ ] Emails de prueba enviados correctamente
- [ ] Login en panel admin funciona
- [ ] Crear reserva desde portal público funciona
- [ ] Emails se envían al cliente y al negocio
- [ ] Confirmar reserva envía email oficial
- [ ] Dashboard muestra estadísticas correctas
- [ ] Filtros y búsqueda funcionan
- [ ] Diseño responsive en móvil

---

## 📝 Notas Importantes

### Límites y Validaciones

- **Superficie:** Entre 10 y 10,000 m²
- **Fechas:** No pasadas, no fines de semana, máximo 60 días de antelación
- **Teléfono:** Formato español (+34 o 6/7/8/9 + 8 dígitos)
- **Código Postal:** 5 dígitos
- **Observaciones:** Máximo 500 caracteres

### Franjas Horarias

- **Mañana:** 8:00 - 14:00
- **Tarde:** 14:00 - 20:00

### Estados de Reserva

1. **Pendiente:** Reserva recién creada, esperando revisión
2. **Confirmada:** Reserva aprobada por el admin
3. **Cancelada:** Reserva cancelada
4. **Completada:** Servicio ya realizado

---

## 🐛 Troubleshooting

### Error: "Error al crear reserva"
- Verifica que las credenciales de Supabase sean correctas
- Verifica que el schema SQL esté ejecutado
- Revisa las políticas RLS en Supabase

### Error: "Error al enviar email"
- Verifica que tu API key de Resend sea válida
- Verifica que el dominio esté verificado en Resend
- Revisa los logs en el dashboard de Resend

### Error: "Credenciales incorrectas" en login
- Verifica que el usuario exista en Supabase Auth
- Verifica que el email y contraseña sean correctos
- Confirma que el usuario esté verificado

---

## 📞 Soporte

Para preguntas o soporte técnico, contacta a:
- **Email:** soporte@ejemplo.com
- **GitHub Issues:** [Repositorio del proyecto]

---

## 📄 Licencia

Este proyecto fue desarrollado por **Scratch Studio - Pablo** para uso privado del cliente.

---

**Stack:** Next.js 14 + Supabase + Resend + Vercel
**Versión:** 1.0.0
**Fecha:** 2025
