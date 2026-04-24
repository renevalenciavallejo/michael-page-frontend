# Michael Page — Task Manager (Frontend Angular)

Frontend en Angular 19 para el sistema de gestión de tareas de la prueba técnica. Consume la Web API .NET expuesta por defecto en `http://localhost:5161/api/v1`.

> **CORS**: la Web API tiene habilitado únicamente el origen `http://localhost:4200`. El frontend debe servirse en ese puerto (valor por defecto de `ng serve`) para que las peticiones no sean bloqueadas por el navegador.

## Requisitos

- Node.js 20+
- Angular CLI 19 (`npm i -g @angular/cli@19`, opcional)
- Backend .NET corriendo en `http://localhost:5161` (Swagger en `/swagger`)

## Cómo ejecutar

```bash
npm install
npm start           # http://localhost:4200
```

Build de producción:

```bash
npm run build       # dist/michael-page-app/
```

Con Docker (sirve el build de producción detrás de Nginx en el puerto 80):

```bash
docker build -t michael-page-app .
docker run -p 4200:80 michael-page-app
```

> Si se sirve con Docker, mapea el puerto host a `4200` (como en el ejemplo) para respetar la política CORS del backend.

## Configurar la URL del API (`apiUrl`)

La URL del backend se lee desde los archivos de entorno en [`src/environments/`](src/environments/) y se inyecta en los servicios `TasksService` y `UsersService`.

| Archivo                                       | Uso                                                    | Valor por defecto              |
| --------------------------------------------- | ------------------------------------------------------ | ------------------------------ |
| `src/environments/environment.development.ts` | `ng serve` / `npm start` (configuración `development`) | `http://localhost:5161/api/v1` |
| `src/environments/environment.ts`             | Build de producción (`ng build`)                       | `http://127.0.0.1:8080/api/v1` |

Angular CLI hace _file replacement_ del archivo de producción por el de desarrollo cuando se compila en modo `development` (ver `angular.json` → `configurations.development.fileReplacements`).

Para cambiar el API, edita el campo `apiUrl` en el archivo que corresponda:

```ts
// src/environments/environment.development.ts
export const environment = {
  apiUrl: 'http://localhost:5161/api/v1',
};
```

No hay que tocar nada más: los servicios HTTP leen `environment.apiUrl` directamente.

## Arquitectura

Angular 19 con **standalone components**, **signals** y el nuevo control flow (`@if` / `@for`). Sin NgModules, sin librerías de estado externas.

```
src/
  environments/
    environment.ts              # apiUrl (producción)
    environment.development.ts  # apiUrl (desarrollo, reemplaza al anterior en ng serve)
  app/
    core/
      interceptors/
        http-error.interceptor.ts   # captura errores HTTP y los manda al ToastService
    shared/
      enums/
        task-status.enum.ts         # Pending | InProgress | Done
      models/
        task/                       # task.dto, create-task.dto, task-additional-info.dto, assigned-user.dto
        user/                       # user.dto, create-user.dto
        api-result.dto.ts
      services/
        tasks.service.ts            # signals: tasks(), filter(), loading(); load(), create(), updateStatus()
        users.service.ts            # signals: users(), loading(); load(), create()
        toast.service.ts            # signals: messages(); show/error/success/dismiss
      components/
        toast.component.ts
        status-badge.component.ts
    features/
      tasks/
        task-list/                  # lista + filtro + tarjetas
        task-create/                # formulario reactivo con additionalInfo anidado
      users/
        user-create/                # formulario reactivo
    app.component.ts                # layout + nav
    app.routes.ts                   # lazy loadComponent por feature
    app.config.ts                   # provideHttpClient + interceptor de errores
```

### Decisiones técnicas

- **Signals como store**: cada servicio mantiene el estado con `signal()` y lo expone como `computed()` de sólo lectura. Los componentes consumen los signals directamente en las plantillas; sin `async` pipe ni `BehaviorSubject`. Setters públicos (`setFilter`) disparan refetch al servidor.
- **Filtro server-side**: el `status` se envía como query param al backend en vez de filtrar en memoria, respetando el contrato del endpoint y funcionando igual con muchas tareas.
- **Reactive Forms** para todos los formularios, con validadores de Angular. `additionalInfo` va como `FormGroup` anidado; los `tags` se capturan como string separado por comas y se normalizan a `string[]` antes de enviarse.
- **Regla "no Pending → Done" vive en el backend**: el frontend no la duplica; si se intenta, el toast muestra el error HTTP. Así se evita _drift_ entre capas.
- **Interceptor único de errores** en [`core/interceptors/http-error.interceptor.ts`](src/app/core/interceptors/http-error.interceptor.ts): evita `catchError` repetido en cada servicio. Los servicios sólo manejan el camino feliz y devuelven el observable para que el componente reaccione (ej. apagar `submitting`).
- **Lazy loading** con `loadComponent` por ruta para reducir el bundle inicial.
- **Tailwind CSS** para estilos; sin librería de componentes pesada, manteniendo el bundle ligero.
- **Change detection `OnPush`** en todos los componentes; va de la mano con signals.

## Rutas

| Ruta         | Componente            | Acción                            |
| ------------ | --------------------- | --------------------------------- |
| `/tasks`     | `TaskListComponent`   | Listar + filtrar + cambiar estado |
| `/tasks/new` | `TaskCreateComponent` | Crear tarea                       |
| `/users/new` | `UserCreateComponent` | Crear usuario                     |

## Reglas de negocio

Las reglas se validan en el backend. El frontend las respeta en la UX y surface los errores vía toast cuando el API las rechaza.

1. **Creación de tarea**
   - `title` es obligatorio.
   - `assignedUserId` es obligatorio y debe referenciar a un usuario existente (`GET /users`).
   - `additionalInfo` es opcional; si se envía, puede incluir `priority`, `estimatedDate` y `tags` (lista de strings — se normaliza desde CSV en el formulario).
2. **Creación de usuario**
   - `name` obligatorio.
   - `email` obligatorio y con formato válido (validador `Validators.email`).
3. **Transiciones de estado de una tarea** (`PATCH /tasks/{id}/status`)
   - Estados permitidos: `Pending`, `InProgress`, `Done`.
   - **No se permite pasar directo de `Pending` a `Done`**: una tarea debe pasar antes por `InProgress`. El backend devuelve error y el frontend lo muestra como toast.
   - El resto de transiciones (`Pending → InProgress`, `InProgress → Done`, etc.) están permitidas.
4. **Filtrado de tareas**
   - `GET /tasks?status=<estado>` filtra en servidor. Sin el query param, se devuelven todas.
5. **Manejo de errores**
   - Errores HTTP (incluyendo error de red por backend caído) se capturan en un interceptor y se muestran como toast; la UI no se rompe.

## Verificación funcional

Con el backend arriba en `http://localhost:5161` y el frontend en `http://localhost:4200`:

1. `/users/new` → crear un usuario.
2. `/tasks/new` → el usuario aparece en el selector; crear tarea con título, prioridad y tags.
3. `/tasks` → se lista la tarea; cambiar filtro a `Pending` dispara refetch.
4. Cambiar estado de `Pending` → `Done` directamente: el backend rechaza y se muestra toast de error (regla de negocio validada).
5. Cambiar estado `Pending` → `InProgress` → `Done`: OK.
6. Detener el backend y refrescar: toast de error de red, la UI sigue respondiendo.
