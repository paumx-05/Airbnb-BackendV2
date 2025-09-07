## Milestone 1 · Autenticación (Mock)

### Alcance (mock-only)
- **Objetivo**: Implementar registro, inicio de sesión y recuperación de contraseña usando servicios mock (sin llamadas de red ni base de datos).
- **Sin backend**: No se crearán endpoints ni se usará NextAuth/Prisma por ahora.
- **Dónde guardar datos**: Estado en memoria + `localStorage` (persistencia de dev).
- **Entrega**: Páginas `register`, `login`, `forgot-password`, `reset-password`; servicios mock; validaciones; sesión mock.

---

## 0) Estructura de archivos
- [x] Crear/ajustar rutas:
  ```
  app/(auth)/login/page.tsx
  app/(auth)/register/page.tsx
  app/(auth)/forgot-password/page.tsx
  app/(auth)/reset-password/[token]/page.tsx
  ```
- [x] Eliminar o mover `app/Registers/Forgotpassword.tsx` a `app/(auth)/forgot-password/page.tsx` (unificar naming `kebab-case`).
- [x] Servicios y utilidades mock:
  ```
  lib/services/auth.ts        # interfaz del servicio (para futura migración a backend)
  lib/mocks/auth.ts          # implementación mock (registro, login, forgot, reset)
  lib/session.ts             # get/set/clear sesión en localStorage
  lib/validators/auth.ts     # zod schemas compartidos
  ```
- [ ] UI compartida (opcional):
  ```
  components/auth/AuthCard.tsx
  ```

---

## 1) Servicios mock (sin red)
- [x] Definir interfaz de servicio (para futura migración a backend)
  - Cómo: `lib/services/auth.ts`
    ```ts
    export type RegisterInput = { name?: string; email: string; password: string };
    export type LoginInput = { email: string; password: string };
    export type ResetRequestInput = { email: string };
    export type ResetConfirmInput = { token: string; newPassword: string };

    export interface IAuthService {
      register(input: RegisterInput): Promise<{ id: string; email: string }>;
      login(input: LoginInput): Promise<{ token: string; user: { id: string; email: string; name?: string | null } }>;
      requestPasswordReset(input: ResetRequestInput): Promise<{ ok: true; token: string }>;
      confirmPasswordReset(input: ResetConfirmInput): Promise<{ ok: true }>;
      me(): Promise<{ id: string; email: string; name?: string | null } | null>;
      logout(): Promise<void>;
    }
    ```
- [x] Implementación mock con latencia simulada
  - Cómo: `lib/mocks/auth.ts`
    - Usar `localStorage` clave `mock_users` para usuarios y `mock_reset_tokens` para tokens.
    - Simular latencia: `await new Promise(r => setTimeout(r, 400))`.
    - Generar ids/tokens: `crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)`.
    - Guardar token de reset con expiración (+1h).
    - No filtrar si el email existe al pedir reset (respuesta genérica).
- [x] Manejo de errores
  - Cómo:
    - Registro: error si email ya existe.
    - Login: error si credenciales no coinciden.
    - Reset: error si token inválido/expirado al confirmar.

---

## 2) Sesión mock
- [x] Utilidad de sesión
  - Cómo: `lib/session.ts`
    - `getSession()`, `setSession({ token, user })`, `clearSession()`.
    - Persistir en `localStorage` como `mock_session`.
- [ ] Hook cliente (opcional)
  - Cómo: `useSessionMock()` que lea/escuche `storage` y exponga `user`, `login`, `logout`.

---

## 3) Validaciones
- [x] Esquemas con `zod`
  - Cómo: `lib/validators/auth.ts`
    ```ts
    import { z } from "zod";

    export const emailSchema = z.string().email("Email inválido");
    export const passwordSchema = z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Al menos 1 mayúscula")
      .regex(/[a-z]/, "Al menos 1 minúscula")
      .regex(/[0-9]/, "Al menos 1 número")
      .regex(/[^A-Za-z0-9]/, "Al menos 1 símbolo");

    export const registerSchema = z.object({
      name: z.string().min(2).optional(),
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: z.string()
    }).refine(d => d.password === d.confirmPassword, {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"]
    });

    export const loginSchema = z.object({
      email: emailSchema,
      password: z.string().min(1, "Requerido"),
    });

    export const forgotSchema = z.object({ email: emailSchema });

    export const resetSchema = z.object({
      newPassword: passwordSchema,
      confirmPassword: z.string()
    }).refine(d => d.newPassword === d.confirmPassword, {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"]
    });
    ```

---

## 4) Páginas (App Router) con RHF + zod
- [x] `register/page.tsx`
  - Cómo:
    - Form con `name`, `email`, `password`, `confirmPassword`.
    - `react-hook-form` + `zodResolver(registerSchema)`.
    - Llamar `auth.register`, toast de éxito, botón disabled en `isSubmitting`.
- [x] `login/page.tsx`
  - Cómo:
    - Form `email`, `password` con `zodResolver(loginSchema)`.
    - Llamar `auth.login`, guardar sesión con `setSession`, redirigir a `/`.
- [x] `forgot-password/page.tsx`
  - Cómo:
    - Form `email` (`zodResolver(forgotSchema)`).
    - Llamar `auth.requestPasswordReset`.
    - Mostrar toast con link temporal `/reset-password/<token>` y opción de copiar.
- [x] `reset-password/[token]/page.tsx`
  - Cómo:
    - Capturar `params.token`.
    - Form `newPassword`, `confirmPassword` (`zodResolver(resetSchema)`).
    - Llamar `auth.confirmPasswordReset`, toast y redirección a `/login`.

---

## 5) UX/Accesibilidad
- [x] Cargar/disabled + estados vacíos
  - Cómo: `Button` deshabilitado en `isSubmitting`, `aria-busy`.
- [x] Toasts uniformes
  - Cómo: `hooks/use-toast` para éxito/errores.
- [x] Mensajes genéricos en forgot
  - Cómo: nunca confirmar si el email existe.
- [x] Foco y a11y
  - Cómo: labels, `aria-invalid`, `role="alert"` en errores.

---

## 6) Protección de rutas (mock)
- [ ] Redirección si autenticado/no autenticado
  - Cómo:
    - En páginas privadas, leer `getSession()` en `useEffect` y redirigir si no hay sesión.
    - En login/register, redirigir si ya hay sesión.
- [ ] Mostrar nombre/email del usuario en la UI
  - Cómo: leer de `mock_session`.

---

## 7) Datos de prueba y herramientas dev
- [x] Seed de usuario demo (opcional)
  - Cómo: en `lib/mocks/auth.ts`, al iniciar, si `mock_users` vacío, insertar `demo@docnet.com` / `Demo123!`.
- [ ] Panel dev (opcional)
  - Cómo: botón en UI para “Limpiar mocks” (borra `localStorage` relacionado).

---

## 8) Criterios de aceptación
- [x] Registro crea usuario y persiste en `localStorage`.
- [x] Login genera sesión y redirige a home.
- [x] Forgot genera token y muestra un enlace válido.
- [x] Reset con token válido actualiza contraseña y permite login con la nueva.
- [x] Validaciones zod muestran mensajes claros.
- [x] No hay llamadas de red; todo es mock.
- [x] UX accesible y botones con estados de carga.

---

## 9) Hoja de ruta para integrar backend (posterior)
- [ ] Mantener `IAuthService` y crear `lib/services/auth.http.ts` con fetch a `/api/*`.
- [ ] Inversión de dependencias: un factory `getAuthService(env)` que devuelva mock o http.
- [ ] Reemplazar llamadas en páginas sin cambiar la UI.

---

## 10) Tareas ordenadas (checklist corta)
- [x] Crear `lib/services/auth.ts` (interfaz).
- [x] Implementar `lib/mocks/auth.ts` + `lib/session.ts`.
- [x] Crear `lib/validators/auth.ts`.
- [x] Crear páginas `(auth)` con formularios y toasts.
- [x] Añadir redirecciones según sesión mock.
- [x] Añadir seed demo y botón “Limpiar mocks”.
- [ ] QA manual de todos los flujos.

---

## 11) Enlaces de autenticación en header
- [x] Añadir enlaces visibles en header (desktop y móvil)
  - Cómo: en `app/page.tsx`
    - Importar `Link` de `next/link` y añadir `Login`/`Registro` en la `nav` desktop y bloque móvil.
- [x] Actualizar CTA "REGISTRARSE" para navegar a `/register`
  - Cómo: en `app/page.tsx`
    - Importar `useRouter` y en `handleRegisterClick` hacer `router.push('/register')`.

---

## 12) Área de usuario (Mock)

### Objetivo
- **Mostrar y gestionar** información básica del usuario tras login: perfil, logout, cambio de contraseña y (opcional) eliminación de cuenta.
- **Mock-only**: todo en `localStorage`, sin llamadas de red.

---

## 12.1) Rutas y navegación
- [ ] Crear página de perfil:
  ```
  app/(user)/account/page.tsx
  ```
- [ ] Header: mostrar enlaces según sesión
  - Si NO autenticado: `Login`, `Registro`.
  - Si autenticado: `Mi cuenta` (/account), `Salir`.

## 12.2) Hook de sesión (cliente)
- [ ] Crear `hooks/use-session-mock.ts`
  - Leer sesión con `getSession()` al montar.
  - Suscribirse a cambios de `localStorage` (evento `storage`) o evento personalizado.
  - Exponer: `user`, `isAuthenticated`, `refresh()`, `logout()`.

## 12.3) Extender servicio mock
- [ ] Ampliar interfaz `lib/services/auth.ts`
  ```ts
  export type UpdateProfileInput = { name?: string | null; email?: string };
  export type ChangePasswordInput = { currentPassword: string; newPassword: string };

  export interface IAuthService {
    updateProfile(input: UpdateProfileInput): Promise<{ id: string; email: string; name?: string | null }>;
    changePassword(input: ChangePasswordInput): Promise<{ ok: true }>;
    deleteAccount(): Promise<{ ok: true }>; // opcional
  }
  ```
- [ ] Implementar en `lib/mocks/auth.ts`
  - `updateProfile`: actualizar `mock_users` (validar email único), refrescar `mock_session.user`.
  - `changePassword`: verificar `currentPassword`, guardar nuevo hash mock.
  - `deleteAccount` (opcional): borrar usuario y limpiar sesión.

## 12.4) Validaciones adicionales (zod)
- [ ] `lib/validators/auth.ts`
  - `profileSchema`: `name?: string.min(2).optional()`, `email: emailSchema`.
  - `changePasswordSchema`: `currentPassword`, `newPassword: passwordSchema`, `confirmNewPassword` con `refine` de coincidencia.

## 12.5) Página de perfil `/account`
- [ ] UI básica con datos del usuario (email, nombre) y avatar placeholder.
- [ ] Form Editar perfil con RHF + zod.
- [ ] Form Cambio de contraseña con RHF + zod.
- [ ] Botón Logout (redirigir a `/login`).
- [ ] (Opcional) Eliminar cuenta con `AlertDialog`.

## 12.6) Protección de rutas
- [ ] Redirigir a `/login` si no autenticado en `/account` (client-side).

## 12.7) Header con estado de sesión
- [ ] Mostrar nombre/email cuando hay sesión.
- [ ] Dropdown “Mi cuenta” y `Salir`.

## 12.8) QA (mock)
- [ ] Login con demo y acceso a `/account`.
- [ ] Editar nombre/email y ver reflejado en header.
- [ ] Error si email duplicado.
- [ ] Cambio de contraseña con validaciones.
- [ ] Logout limpia sesión y oculta opciones.
- [ ] (Opcional) Eliminar cuenta.

---

## 13) UI/Responsive (móvil)
- [x] Offer bar responsive (móvil)
  - Cómo: en `app/page.tsx` usar `flex flex-col` en móvil y `sm:flex-row` en desktop; colocar CTA a la derecha del texto; posicionar botón cerrar en esquina (absolute en móvil); ocultar contador en xs (`hidden sm:flex`).
- [x] Header responsive (móvil)
  - Cómo: en `app/page.tsx` permitir `flex-wrap` en acciones móviles, reducir tipografías de enlaces a `text-xs`, mantener accesos “Login/Registro” o “Mi cuenta/Salir” sin desbordes.
- [ ] QA visual en dispositivos (opcional)
  - iPhone SE/8, iPhone 14 Pro, Pixel 5 con Chrome DevTools.

---

## 14) Header - Reestructuración iconos (Mock)
- [x] Icono de usuario abre opciones de usuario
  - Cómo: en `app/page.tsx`, el click del icono `User` navega a `/account` si hay sesión o a `/login` si no la hay.
- [x] Mover “Salir” a la derecha con icono de puerta
  - Cómo: en `app/page.tsx`, añadir botón con `LogOut` en las acciones derechas (móvil y desktop) y eliminar el enlace textual “Salir”.
- [x] Limpiar enlaces de navegación
  - Cómo: en desktop, ocultar “Mi cuenta/Salir” en la `nav`; mantener `Login/Registro` cuando no hay sesión.
- [ ] QA visual rápido
  - Verificar en móvil y desktop que los iconos no desbordan y son accesibles (aria-labels).

---

## 15) Fondo/estilos consistentes en páginas de auth (Mock)
- [x] Unificar fondo y card en `login`, `register`, `forgot-password`, `reset-password`
  - Cómo: envolver cada página con `div.min-h-screen.bg-gray-900` y contenedor `container mx-auto px-4 py-12` + card `bg-gray-800 border border-gray-700 rounded-lg p-6`.
- [ ] Revisión visual rápida
  - Verificar contrastes y legibilidad en modo oscuro en móvil/desktop.

## 16) Detalles rojos y componentes reutilizables (Mock)
- [ ] Crear componente `AuthLayout` en `components/ui/AuthLayout.tsx` que envuelva el fondo y el card con los acentos rojos de la página principal.
- [ ] Refactorizar páginas `login`, `register`, `forgot-password`, `reset-password` y `account` para usar `AuthLayout` y así evitar duplicación de código del layout.
- [ ] Añadir clases rojas (`bg-red-600`, `hover:bg-red-700`, `text-red-600`, bordes `border-red-200`, etc.) en botones y acentos de los formularios y secciones de perfil.
- [ ] Probar visualmente en móvil y desktop para verificar consistencia y legibilidad.

## 17) Avatar en perfil (Mock)
- [ ] Mostrar avatar mock con inicial en círculo en la sección de perfil.
- [ ] Agregar botón "Cambiar avatar" que dispare un toast mock.
- [ ] Mostrar nombre de usuario en grande debajo del avatar.
