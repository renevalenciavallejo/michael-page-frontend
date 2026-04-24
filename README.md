# Michael Page — Task Manager (Frontend Angular)

Frontend Angular 19 para el sistema de gestión de tareas de la prueba técnica. Consume la Web API .NET expuesta en `http://localhost:5161/api/v1`.

## Requisitos

- Node.js 20+
- Angular CLI 19 (`npm i -g @angular/cli@19`, opcional)
- Backend .NET corriendo en `http://localhost:5161` (Swagger en `/swagger`)

## Cómo ejecutar

```bash
npm install
npm start           # http://localhost:4200
```

Para build de producción:

```bash
npm run build       # dist/
```

### Configurar la URL del backend

La URL se inyecta mediante el token `API_BASE_URL` en [src/app/app.config.ts](src/app/app.config.ts). Por defecto apunta a `http://localhost:5161/api/v1`. Si necesitas otra URL, cambia `DEFAULT_API_BASE_URL` en [src/app/core/services/api-config.ts](src/app/core/services/api-config.ts).

## Funcionalidades implementadas

- Listar tareas con **filtro por estado** (Pending / InProgress / Done) — el filtro usa el query param `?status=` del backend.
- **Crear tarea** con Reactive Forms, validaciones (título obligatorio, usuario obligatorio) y campos para `additionalInfo` (prioridad, fecha estimada, tags).
- **Selector de usuario** poblado desde `GET /users`; acceso rápido a crear un usuario nuevo si no hay.
- **Crear usuario** con Reactive Forms (nombre + email válido).
- **Cambio de estado** inline desde cada tarjeta con `PATCH /tasks/{id}/status`.
- **Manejo de errores** centralizado via `HttpInterceptor` + `ToastService` (incluye error de red y errores del backend como la regla "no Pending → Done").

## Arquitectura

Angular 19 con **standalone components**, **signals** y nuevo control flow (`@if` / `@for`). Sin NgModules, sin librerías de estado externas.

```
src/app/
  core/
    models/           # Task, User, TaskStatus enum, DTOs
    services/
      api-config.ts             # InjectionToken<string> API_BASE_URL
      users.service.ts          # signals: users(), loading(); load(), create()
      tasks.service.ts          # signals: tasks(), filter(), loading(); load(), create(), updateStatus()
      toast.service.ts          # signals: messages(); show/error/success/dismiss
      http-error.interceptor.ts # captura errores HTTP → toast
  features/
    tasks/
      task-list/                # lista + filtro + tarjetas
      task-create/              # formulario reactivo con additionalInfo anidado
    users/
      user-create/              # formulario reactivo
  shared/ui/
    toast.component.ts
    status-badge.component.ts
  app.component.ts              # layout + nav
  app.routes.ts                 # lazy loadComponent por feature
  app.config.ts                 # provideHttpClient + interceptor + API_BASE_URL
```

### Decisiones técnicas

- **Signals como store**: cada servicio mantiene el estado con `signal()` y expone `computed()` de sólo lectura. Los componentes usan los signals directamente en las plantillas; sin `async` pipe ni `BehaviorSubject`. Setters públicos (`setFilter`) disparan refetch del servidor.
- **Filtro server-side**: el `status` se manda como query param al backend en vez de filtrar en memoria, para respetar el endpoint definido y funcionar igual cuando haya muchas tareas.
- **Reactive Forms** para todos los formularios, con validadores de Angular. `additionalInfo` va como `FormGroup` anidado; los `tags` se capturan como string separado por comas y se normalizan a `string[]` antes de enviarlos.
- **Regla "no Pending → Done" vive en el backend**: el frontend no la duplica; si se intenta, el toast muestra el error HTTP. Esto evita drift entre capas.
- **Interceptor único de errores**: evita boilerplate `catchError` en cada servicio. Los servicios sólo manejan el camino feliz y devuelven observables para que el componente reaccione (ej. apagar `submitting`).
- **Lazy loading** con `loadComponent` por ruta para reducir el bundle inicial.
- **Tailwind CSS** para estilos; sin librería de componentes pesada, manteniendo el bundle ligero y el control sobre la UI.
- **Change detection `OnPush`** en todos los componentes; va de la mano con signals.

## Rutas

| Ruta | Componente | Acción |
|---|---|---|
| `/tasks` | `TaskListComponent` | Listar + filtrar + cambiar estado |
| `/tasks/new` | `TaskCreateComponent` | Crear tarea |
| `/users/new` | `UserCreateComponent` | Crear usuario |

## Verificación funcional

Con el backend arriba:

1. `/users/new` → crear un usuario.
2. `/tasks/new` → el usuario aparece en el selector; crear tarea con título, prioridad y tags.
3. `/tasks` → se lista la tarea; cambiar filtro a `Pending` refetch al backend.
4. Cambiar estado de `Pending` → `Done` directamente: el backend rechaza y se muestra toast de error (regla de negocio validada).
5. Cambiar estado `Pending` → `InProgress` → `Done`: OK.
6. Detener el backend y refrescar: toast de error de red, la UI no se rompe.

## Pendientes / fuera de alcance

- Tests unitarios y E2E más allá del scaffolding por defecto.
- Paginación / búsqueda por texto en la lista de tareas.
- Edición completa de tarea (solo se cambia el estado; el título/usuario se fijan al crear).
- Gestión completa de `metadata` JSON libre dentro de `additionalInfo` (hoy se envía vacío por UI).
- Autenticación / autorización (no pedida por la prueba).
- i18n (UI sólo en español).
