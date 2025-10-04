---
title: "Diseño de internacionalización web"
description: "Arquitectura y plan de migración para llevar i18n al front-end de React."
sidebar:
  label: "Diseño web i18n"
---

# Documento de diseño de internacionalización web

## Resumen
Introduce soporte multilingüe en el front-end React 18 + Vite sin modificar los servicios backend. La solución integrará i18next para la localización de cadenas, propagará las preferencias de idioma del usuario a través del enrutamiento y almacenamiento persistente, y estandarizará el formateo mediante las APIs `Intl` del navegador manteniendo los datos de dominio neutrales al idioma.

## Objetivos y no objetivos
- **Objetivos**
  - Admitir inglés (`en`) y español (`es`) desde el lanzamiento con una estructura fácilmente extensible para locales adicionales.
  - Conducir la selección de idioma desde la URL (`/:lang/...`) con persistencia en `localStorage` como respaldo.
  - Reenviar el idioma activo a las APIs mediante un interceptor de Axios usando el encabezado `Accept-Language`.
  - Externalizar todo el texto de la UI a recursos JSON de i18next divididos en los espacios de nombres necesarios (`common`, `members`, `songs`, `arrangements`, `services`, `songSets`, `validation`).
  - Usar `Intl` para formateo de fechas, números y listas acorde al idioma activo.
  - Proporcionar guía de migración para reemplazar cadenas codificadas y mensajes de validación.
  - Establecer pruebas unitarias y de humo con Playwright para el nuevo flujo de i18n.
- **No objetivos**
  - Cambios en el esquema o en las APIs del backend.
  - Traducir datos de dominio devueltos por la API (se mantienen neutrales al idioma).
  - Manejar diseños de derecha a izquierda (mejora futura).

## Resumen del estado actual
- Enrutamiento: React Router v6 con rutas anidadas bajo `/apps/web/src/routes`.
- Datos: TanStack Query gestiona el estado del servidor; Axios se usa como cliente HTTP.
- Formularios y validación: React Hook Form + Zod con mensajes de validación en inglés incrustados.
- Texto de UI: cadenas en inglés codificadas dentro de los componentes.
- Formateo: utilidades personalizadas o valores predeterminados del navegador.

## Arquitectura propuesta

### Estructura de carpetas
```
apps/web/
  src/
    i18n/
      config.ts             # Inicialización de i18next, registro de recursos, detección de idioma
      index.ts               # Exporta helpers/hooks (useI18n, changeLanguage, supportedLocales)
      constants.ts           # Códigos de locales, claves de almacenamiento
      formatters.ts          # Envoltorios de Intl (fecha, número, tiempo relativo)
      resources/
        en/
          common.json
          members.json
          songs.json
          arrangements.json
          services.json
          songSets.json
          validation.json
        es/
          common.json
          members.json
          songs.json
          arrangements.json
          services.json
          songSets.json
          validation.json
    routes/
      [lang]/                # Segmento de ruta sensible al idioma
        layout.tsx           # Lee el parámetro :lang, sincroniza i18next + localStorage
        index.tsx            # Reexporta rutas hijas (sin cambios de UI)
    providers/
      queryClient.tsx        # Inyecta idioma en el alcance de caché de TanStack Query si es necesario
    hooks/
      useLocaleRouter.ts     # Helper para empujar URLs traducidas y leer :lang
    utils/
      axiosClient.ts         # Instancia Axios con interceptor Accept-Language
```

### Decisiones clave
1. **Idioma como segmento de URL**
   - Usar un segmento dinámico superior `/:lang` que envuelva la configuración de rutas existente con React Router. Ejemplo: `/en/members`, `/es/songs`. Beneficios: enlaces compartibles, rastreables por buscadores y fáciles de guardar.
   - Implementar un componente guardián que valide el parámetro `:lang` contra los locales soportados y redirija al predeterminado (`en`) cuando sea inválido. Almacenar el locale resuelto en `localStorage` (`ebal.lang`).
2. **Persistencia de idioma de respaldo**
   - En la carga inicial detectar el locale en este orden: parámetro `:lang`, `localStorage`, idiomas del navegador, y por último el valor predeterminado `en`.
   - Cuando la persona usuaria cambie el idioma (por ejemplo, con un selector en el encabezado), actualizar la URL mediante `useNavigate`, persistir en `localStorage` y disparar `changeLanguage` de i18next.
3. **Integración con i18next**
   - Usar `i18next`, `react-i18next` e `i18next-browser-languagedetector` (configurado para depender de la lógica de detección descrita arriba). La inicialización ocurre antes de renderizar React en `main.tsx`.
   - Dividir los recursos en espacios de nombres que coincidan con las áreas de dominio. Usar carga diferida mediante empaquetado de `resources` o imports dinámicos para idiomas adicionales.
   - Proveer el helper tipado `useAppTranslation(namespace?: string | string[])` que devuelva los objetos `t` e `i18n` para evitar importar i18next en cada componente.
4. **Interceptor de Axios para Accept-Language**
   - Extender la instancia compartida de Axios para establecer el encabezado `Accept-Language` con el idioma activo de i18next en cada petición. Suscribirse al evento `languageChanged` de i18next para actualizar el estado del interceptor o leer `i18next.language` en el momento de la llamada.
   - No se requiere cambio alguno en el backend; el encabezado viaja con los endpoints existentes.
5. **Integración con TanStack Query**
   - Mantener las claves de caché independientes del idioma a menos que la respuesta de la API sea específica por idioma (no se espera). Evitar que un cambio de locale invalide consultas excluyendo el locale de las claves. Solo el formateo de UI depende de i18n.
6. **Localización de React Hook Form + Zod**
   - Centralizar el mapa de errores de Zod usando `zod-i18n-map` o un mapa personalizado que consulte el espacio de nombres `validation`. Llamar a `z.setErrorMap` durante el arranque de la app tras la inicialización de i18next.
   - Usar el helper `t` en componentes de formulario para etiquetas, placeholders y textos de ayuda.
7. **Formateo mediante Intl**
   - Crear utilidades envoltorio alrededor de `Intl.DateTimeFormat`, `Intl.NumberFormat` e `Intl.ListFormat` dentro de `formatters.ts`. Las funciones aceptan un locale (por defecto el idioma activo de i18next) y opciones de formateo.
   - Reemplazar la lógica de formateo en los componentes con estos helpers sin modificar los datos de dominio.
8. **Extensibilidad**
   - Centralizar los locales soportados y su metadata (`displayName`, `flagIcon?`) en `constants.ts`. Documentar el proceso para agregar un nuevo idioma: añadir la entrada, proveer archivos JSON y actualizar el pipeline de traducción (si aplica).
9. **Consideraciones de build y rendimiento**
   - Usar importaciones dinámicas de Vite para los JSON de locales y habilitar code splitting. Evaluar cargar con antelación `en` y `es` para simplificar el lanzamiento inicial; reconsiderar cuando se agreguen más idiomas.
   - Configurar alias de rutas en TypeScript (`@i18n/*`) si mejora la ergonomía del desarrollo.

## Guía de migración
1. **Auditar cadenas codificadas**
   - Usa `rg "\"[^\"]+\"" apps/web/src` para encontrar posibles cadenas. Prioriza layout compartido, navegación y formularios.
2. **Crear claves de traducción**
   - Agrupa las claves por espacio de nombres que coincida con el dominio del componente (p. ej., `members:list.title`).
   - Añade las claves a los archivos JSON de `en` y `es` con estructura idéntica. Para nuevos locales, copia `en` como fuente de verdad.
3. **Actualizar componentes**
   - Sustituye el texto codificado con `const { t } = useAppTranslation('members');` y usa `t('list.title')`.
   - Para cadenas dinámicas, aprovecha la interpolación (`t('greeting', { name })`).
   - Asegúrate de eliminar texto predeterminado en los componentes para evitar divergencias.
4. **Formularios y validación**
   - Reemplaza mensajes de error en línea de Zod con claves del espacio `validation` (por ejemplo, `z.string().min(1, { message: 'validation:members.name.required' })`).
   - Actualiza el renderizado de errores de React Hook Form para pasar los mensajes por `t`.
5. **Utilidades y notificaciones**
   - Externaliza las cadenas en funciones utilitarias, notificaciones y manejadores de errores de consultas.
6. **Verificación**
   - Cambia el locale manualmente para confirmar que las traducciones se renderizan y no faltan claves (i18next puede registrar claves faltantes en desarrollo).

## Estrategia de pruebas
- **Pruebas unitarias**
  - Agregar tests para `i18n/config.ts` que verifiquen locales soportados, fallback por defecto e integración con almacenamiento (mock de `localStorage`).
  - Probar que el interceptor en `axiosClient.ts` establezca `Accept-Language` con el idioma activo.
  - Validar que las funciones de `formatters.ts` produzcan salidas específicas por locale para fechas y números.
  - Incluir tests de componentes representativos (por ejemplo, la lista de Miembros) para comprobar que `t` renderiza texto localizado y que el parámetro de idioma en la ruta dispara `changeLanguage`.
  - Añadir un test para el mapa de errores de Zod que garantice que los mensajes de validación usan claves de traducción.
- **Pruebas de humo con Playwright**
  - Escenario: navegar a `/en/members`, afirmar etiquetas en inglés; cambiar el idioma mediante la UI, confirmar que la URL se actualiza a `/es/members`, que el encabezado `Accept-Language` se observa con un mock o aserción de red, y que el texto de la UI aparece en español.
  - Escenario: navegación directa a `/es/services` carga los recursos en español desde la primera carga.
  - Escenario: un locale inválido (por ejemplo, `/fr/...`) redirige al idioma predeterminado conservando la ruta.

## Criterios de aceptación
- Las rutas de la aplicación incluyen un segmento de idioma con validación y redirección para locales no soportados.
- La elección de idioma persiste entre recargas y pestañas nuevas (mediante URL o `localStorage`).
- i18next se inicializa antes de renderizar React; todas las cadenas de UI hacen referencia a claves en los espacios de nombres definidos.
- El cliente Axios adjunta el encabezado `Accept-Language` derivado del idioma activo sin cambios en el backend.
- Las utilidades de formateo emplean `Intl` con el idioma activo.
- La lista de verificación de migración está documentada y adoptada para los componentes actualizados.
- Las pruebas unitarias cubren las utilidades de i18n y la suite de humo con Playwright valida el cambio de idioma de extremo a extremo.
- Agregar un nuevo idioma requiere únicamente crear recursos JSON y actualizar las constantes, sin reestructurar el código.
