# Milestone 3: Implementación de secciones de recambios por categorías

## Tareas y argumentación

### 1. Estructura base y layout principal
1. **Crear componente `PartsSection` como contenedor principal de las secciones de recambios**
   - Argumento: Encapsula toda la lógica de categorías de recambios y facilita su reutilización y mantenimiento.

2. **Implementar layout de dos columnas: sidebar de categorías (280px) y área de contenido principal**
   - Argumento: Replica la estructura visual del ejemplo HTML y proporciona navegación clara entre categorías.

3. **Aplicar gradientes de fondo consistentes con el patrón actual (gray-800 a gray-900)**
   - Argumento: Mantiene la coherencia visual con el header existente y el diseño general de la aplicación.

### 2. Sidebar de categorías de recambios
4. **Crear componente `CategoriesSidebar` con lista de las 9 categorías principales**
   - Argumento: Centraliza la navegación entre categorías y facilita la adición de nuevas categorías en el futuro.

5. **Implementar estilos hover y estado activo para cada categoría (border-left rojo, fondo semitransparente)**
   - Argumento: Proporciona feedback visual claro al usuario sobre la categoría seleccionada y mejora la experiencia de navegación.

6. **Añadir iconos representativos para cada categoría usando iconos de Lucide React**
   - Argumento: Mejora la identificación visual de cada categoría y hace la interfaz más intuitiva.

7. **Implementar estado de categoría activa con gestión de estado React**
   - Argumento: Permite el cambio dinámico de categorías sin recargar la página y mantiene el estado de navegación.

### 3. Área de contenido principal
8. **Crear componente `PartsContentArea` con toolbar superior (título de categoría y controles de vista)**
   - Argumento: Proporciona contexto visual de la categoría actual y controles para personalizar la visualización.

9. **Implementar toggle entre vista de grid y lista con iconos de cambio de estado**
   - Argumento: Permite al usuario elegir su formato preferido de visualización de productos.

10. **Añadir barra de búsqueda específica para recambios dentro de cada categoría**
    - Argumento: Facilita la búsqueda de productos específicos sin cambiar de categoría.

### 4. Componentes de categorías individuales
11. **Crear componente `MaintenanceSection` para "Mantenimientos básicos"**
    - Argumento: Agrupa recambios relacionados con mantenimiento general del vehículo (aceites, filtros básicos, etc.).

12. **Crear componente `BrakingSystemSection` para "Sistema de frenado"**
    - Argumento: Especializa la visualización de pastillas, discos, líquido de frenos y componentes relacionados.

13. **Crear componente `SteeringSection` para "Dirección"**
    - Argumento: Agrupa recambios del sistema de dirección (amortiguadores, rótulas, etc.).

14. **Crear componente `TransmissionSection` para "Transmisión"**
    - Argumento: Organiza componentes de la caja de cambios y sistema de transmisión.

15. **Crear componente `FiltersSection` para "Filtros"**
    - Argumento: Centraliza todos los tipos de filtros (aceite, aire, combustible, habitáculo).

16. **Crear componente `CoolingSection` para "Refrigeración"**
    - Argumento: Agrupa componentes del sistema de refrigeración (radiador, termostato, etc.).

17. **Crear componente `ExhaustSystemSection` para "Sistema de escape"**
    - Argumento: Organiza componentes del escape y sistema de emisiones.

18. **Crear componente `BeltTransmissionSection` para "Transmisión por correas"**
    - Argumento: Especializa la visualización de correas de distribución, accesorios y tensores.

19. **Crear componente `AxleTransmissionSection` para "Transmisión por ejes"**
    - Argumento: Agrupa componentes de ejes, diferenciales y transmisión final.

### 5. Sistema de productos y tarjetas
20. **Crear interfaz `Part` con propiedades: id, name, brand, price, image, description, compatibility**
    - Argumento: Define la estructura de datos consistente para todos los productos del catálogo.

21. **Implementar componente `PartCard` reutilizable con diseño responsive**
    - Argumento: Estandariza la presentación de productos y facilita el mantenimiento del diseño.

22. **Añadir funcionalidad de "Añadir al carrito" en cada tarjeta de producto**
    - Argumento: Integra la funcionalidad de compra directamente en la visualización de productos.

23. **Implementar grid responsive para las tarjetas de productos (1-4 columnas según tamaño de pantalla)**
    - Argumento: Optimiza la visualización en diferentes dispositivos y tamaños de pantalla.

### 6. Datos mock y contenido inicial
24. **Crear archivo `lib/mocks/parts.ts` con datos mock para cada categoría**
    - Argumento: Permite desarrollar y probar la funcionalidad sin depender de una API real.

25. **Implementar 5-8 productos mock por categoría con información realista**
    - Argumento: Proporciona contenido suficiente para probar la funcionalidad y el diseño.

26. **Añadir imágenes placeholder para productos usando servicios como Unsplash o Placeholder.com**
    - Argumento: Mejora la presentación visual y permite probar el comportamiento con imágenes reales.

### 7. Integración con la página de vehículo
27. **Integrar `PartsSection` debajo de `VehicleInfo` en la página de vehículo**
    - Argumento: Mantiene la información del vehículo visible mientras se navega por los recambios.

28. **Implementar scroll suave entre secciones y categorías**
    - Argumento: Mejora la experiencia de navegación y hace la interfaz más fluida.

29. **Añadir indicador de carga mientras se cargan los productos de cada categoría**
    - Argumento: Proporciona feedback visual durante las operaciones asíncronas.

### 8. Responsive design y accesibilidad
30. **Implementar diseño responsive para móviles con sidebar colapsable**
    - Argumento: Asegura una experiencia óptima en todos los dispositivos.

31. **Añadir navegación por teclado para todas las interacciones**
    - Argumento: Mejora la accesibilidad y permite el uso sin mouse.

32. **Implementar estados de focus y hover accesibles con contraste adecuado**
    - Argumento: Cumple con estándares de accesibilidad web y mejora la usabilidad.

### 9. Testing y validación
33. **Probar navegación entre todas las categorías y verificar que el contenido se actualiza correctamente**
    - Argumento: Asegura que la funcionalidad principal funciona sin errores.

34. **Validar que el toggle entre vista grid/lista funciona correctamente en todas las categorías**
    - Argumento: Confirma que la funcionalidad de cambio de vista es consistente.

35. **Probar la funcionalidad de búsqueda dentro de cada categoría**
    - Argumento: Verifica que el filtrado de productos funciona correctamente.

36. **Validar el diseño responsive en diferentes tamaños de pantalla (móvil, tablet, desktop)**
    - Argumento: Asegura que la interfaz se adapta correctamente a todos los dispositivos.

### 10. Documentación y preparación para siguientes fases
37. **Documentar la estructura de componentes creada y sus responsabilidades**
    - Argumento: Facilita el mantenimiento futuro y la colaboración en el desarrollo.

38. **Preparar la base para integración futura con API real de productos**
    - Argumento: Establece la arquitectura necesaria para la transición de datos mock a datos reales.

39. **Crear guía de estilos para mantener consistencia en futuras categorías**
    - Argumento: Asegura que las nuevas categorías sigan el mismo patrón de diseño establecido.

## Categorías de recambios a implementar

- **Mantenimientos básicos**: Aceites, filtros básicos, bujías, correas de accesorios
- **Sistema de frenado**: Pastillas, discos, líquido de frenos, latiguillos
- **Dirección**: Amortiguadores, rótulas, terminales, bieletas
- **Transmisión**: Embrague, discos, bombín, cojinete
- **Filtros**: Filtro de aceite, aire, combustible, habitáculo
- **Refrigeración**: Radiador, termostato, bomba de agua, manguitos
- **Sistema de escape**: Tubo de escape, silenciador, catalizador
- **Transmisión por correas**: Correa de distribución, accesorios, tensores
- **Transmisión por ejes**: Palieres, juntas homocinéticas, guardapolvos

## Patrón de colores a seguir

- **Fondo principal**: Gradiente de `gray-800` a `gray-900`
- **Acentos**: `red-600` para elementos activos y destacados
- **Texto principal**: `text-gray-200` para contraste óptimo
- **Bordes activos**: `border-red-600` con `border-l-4`
- **Fondos semitransparentes**: `bg-gray-800 bg-opacity-70`
- **Hover states**: Transiciones suaves con `hover:` variants

## Subsecciones por categoría

### 11. Implementación de subsecciones para "Mantenimientos básicos"

40. **Crear interfaz `SubCategory` para definir estructura de subsecciones**
    - Argumento: Establece la estructura de datos consistente para las subcategorías dentro de cada categoría principal.

41. **Implementar componente `SubCategoriesNavigation` con navegación horizontal/vertical**
    - Argumento: Permite navegación fluida entre subsecciones manteniendo el contexto de la categoría principal.

42. **Crear componente `MaintenanceSubsections` específico para mantenimientos básicos**
    - Argumento: Encapsula la lógica específica de las 9 subsecciones de mantenimientos básicos.

43. **Implementar subsección "Aceites" con productos específicos (motor, transmisión, diferencial)**
    - Argumento: Agrupa todos los tipos de aceites necesarios para el mantenimiento del vehículo.

44. **Implementar subsección "Filtros" con filtros básicos (aceite, aire, combustible, habitáculo)**
    - Argumento: Centraliza los filtros esenciales para el funcionamiento del motor y sistemas auxiliares.

45. **Implementar subsección "Sistema de Frenos" con componentes básicos (pastillas, discos, líquido)**
    - Argumento: Incluye los elementos más comunes de mantenimiento del sistema de frenado.

46. **Implementar subsección "Sistema de Refrigeración" con componentes básicos (líquido, termostato)**
    - Argumento: Agrupa los elementos esenciales para el mantenimiento del sistema de refrigeración.

47. **Implementar subsección "Correa Poli V" con correas de accesorios y distribución**
    - Argumento: Especializa la visualización de correas de transmisión de accesorios.

48. **Implementar subsección "Rótulas de Dirección" con rótulas y terminales de dirección**
    - Argumento: Agrupa componentes específicos del sistema de dirección para mantenimiento.

49. **Implementar subsección "Rótulas de Suspensión" con rótulas y bieletas de suspensión**
    - Argumento: Especializa componentes de suspensión para mantenimiento preventivo.

50. **Implementar subsección "Batería" con baterías y componentes eléctricos básicos**
    - Argumento: Centraliza productos relacionados con el sistema eléctrico del vehículo.

51. **Implementar subsección "Limpia Parabrisas" con escobillas y líquido limpiaparabrisas**
    - Argumento: Agrupa productos de mantenimiento para la visibilidad y seguridad.

52. **Crear datos mock específicos para cada subsección de mantenimientos básicos**
    - Argumento: Proporciona contenido realista para probar la funcionalidad de subsecciones.

53. **Implementar navegación por pestañas o tabs para las subsecciones**
    - Argumento: Permite cambio rápido entre subsecciones manteniendo el contexto de la categoría principal.

54. **Añadir contador de productos por subsección en la navegación**
    - Argumento: Proporciona información visual sobre la cantidad de productos disponibles en cada subsección.

55. **Implementar filtrado cruzado entre subsecciones y búsqueda general**
    - Argumento: Permite búsqueda global que incluya todas las subsecciones o filtrado específico por subsección.

56. **Crear componente `SubsectionHeader` con breadcrumbs de navegación**
    - Argumento: Mejora la orientación del usuario mostrando la ruta de navegación actual.

57. **Implementar estado de subsección activa con indicadores visuales**
    - Argumento: Proporciona feedback claro sobre la subsección seleccionada actualmente.

58. **Añadir iconos específicos para cada subsección de mantenimientos básicos**
    - Argumento: Mejora la identificación visual rápida de cada tipo de mantenimiento.

59. **Implementar vista responsive para subsecciones en dispositivos móviles**
    - Argumento: Asegura una experiencia óptima de navegación por subsecciones en todos los dispositivos.

60. **Crear sistema de etiquetas para productos que pertenecen a múltiples subsecciones**
    - Argumento: Permite que un producto aparezca en varias subsecciones relacionadas cuando sea apropiado.

### Subsecciones de "Mantenimientos básicos" a implementar:

- **Aceites**: Aceite de motor, transmisión, diferencial, hidráulico
- **Filtros**: Filtro de aceite, aire, combustible, habitáculo
- **Sistema de Frenos**: Pastillas, discos, líquido de frenos, latiguillos
- **Sistema de Refrigeración**: Líquido refrigerante, termostato, manguitos
- **Correa Poli V**: Correa de accesorios, distribución, tensores
- **Rótulas de Dirección**: Rótulas, terminales, bieletas de dirección
- **Rótulas de Suspensión**: Rótulas, bieletas, amortiguadores
- **Batería**: Baterías, bornes, cables, alternadores
- **Limpia Parabrisas**: Escobillas, líquido, bombas, manguitos

## Subsecciones dentro de subsecciones (Nivel 3)

### 12. Implementación de subsecciones de nivel 3 para "Aceites"

61. **Crear interfaz `SubSubCategory` para definir estructura de subsecciones de nivel 3**
    - Argumento: Establece la estructura de datos para las subcategorías más específicas dentro de cada subsección principal.

62. **Implementar componente `SubSubCategoriesNavigation` con navegación de nivel 3**
    - Argumento: Permite navegación fluida entre las subsecciones más específicas manteniendo el contexto de la subsección principal.

63. **Crear componente `OilsSubSubsections` específico para la subsección de aceites**
    - Argumento: Encapsula la lógica específica de las 4 subsecciones de aceites (motor, transmisión, diferencial, dirección).

64. **Implementar subsección "Aceite Motor" con productos específicos (5W-30, 10W-40, sintético, mineral)**
    - Argumento: Agrupa todos los tipos de aceites específicos para el motor del vehículo con diferentes viscosidades y composiciones.

65. **Implementar subsección "Aceite Transmisión" con aceites para caja de cambios (75W-90, 80W-90)**
    - Argumento: Especializa la visualización de aceites específicos para el sistema de transmisión y caja de cambios.

66. **Implementar subsección "Aceite Diferencial" con aceites para diferenciales (80W-90, 85W-140)**
    - Argumento: Agrupa aceites específicos para el mantenimiento del sistema diferencial del vehículo.

67. **Implementar subsección "Aceite Dirección" con aceites hidráulicos para dirección asistida**
    - Argumento: Centraliza aceites específicos para el sistema de dirección hidráulica y asistida.

68. **Crear datos mock específicos para cada subsección de aceites con productos realistas**
    - Argumento: Proporciona contenido detallado para probar la funcionalidad de navegación de nivel 3.

69. **Implementar navegación por pestañas de nivel 3 con indicadores de profundidad**
    - Argumento: Permite cambio rápido entre subsecciones específicas mostrando la jerarquía de navegación.

70. **Añadir contador de productos por subsección de nivel 3 en la navegación**
    - Argumento: Proporciona información visual sobre la cantidad de productos disponibles en cada subsección específica.

71. **Implementar breadcrumbs de nivel 3: Inicio > Categoría > Subsección > SubSubsección**
    - Argumento: Mejora la orientación del usuario mostrando la ruta completa de navegación hasta el nivel más específico.

72. **Crear componente `SubSubsectionHeader` con información específica de nivel 3**
    - Argumento: Muestra información detallada de la subsección específica con estadísticas y contexto.

73. **Implementar filtrado cruzado entre subsecciones de nivel 3 y búsqueda global**
    - Argumento: Permite búsqueda que incluya todas las subsecciones de nivel 3 o filtrado específico por subsección.

74. **Añadir iconos específicos para cada subsección de aceites de nivel 3**
    - Argumento: Mejora la identificación visual rápida de cada tipo específico de aceite.

75. **Implementar vista responsive para subsecciones de nivel 3 en dispositivos móviles**
    - Argumento: Asegura una experiencia óptima de navegación por subsecciones específicas en todos los dispositivos.

76. **Crear sistema de etiquetas para productos que pertenecen a múltiples subsecciones de nivel 3**
    - Argumento: Permite que un producto aparezca en varias subsecciones específicas relacionadas cuando sea apropiado.

77. **Implementar indicadores de compatibilidad específicos por subsección de nivel 3**
    - Argumento: Muestra información de compatibilidad más específica para cada tipo de aceite.

78. **Añadir filtros específicos por viscosidad, tipo (sintético/mineral) y aplicación**
    - Argumento: Permite filtrado avanzado basado en características técnicas específicas de los aceites.

79. **Implementar comparador de productos dentro de cada subsección de nivel 3**
    - Argumento: Permite comparar productos específicos de la misma subsección para facilitar la decisión de compra.

### Subsecciones de nivel 3 para "Aceites" a implementar:

- **Aceite Motor**: 5W-30, 10W-40, 15W-40, sintético, mineral, semi-sintético
- **Aceite Transmisión**: 75W-90, 80W-90, 75W-80, para caja de cambios manual y automática
- **Aceite Diferencial**: 80W-90, 85W-140, 75W-90, para diferenciales delanteros y traseros
- **Aceite Dirección**: ATF, aceite hidráulico, para dirección asistida

---

## Subsecciones de nivel 3 para "Filtros" (Tareas 80-98)

### 80. **Crear datos mock para subsubcategorías de Filtros**
    - Argumento: Generar datos de prueba para las 4 subsubcategorías de filtros con productos específicos.
    - Archivo: `lib/mocks/filtersSubSubsections.ts`
    - Contenido: 4 subsubcategorías con 4-5 productos cada una

### 81. **Implementar subsubcategorías de Filtro de Aceite**
    - Argumento: Crear productos específicos para filtros de aceite con diferentes marcas y especificaciones.
    - Productos: Filtros de aceite sintético, mineral, semi-sintético, diferentes tamaños
    - Marcas: Bosch, Mann-Filter, Mahle, Fram

### 82. **Implementar subsubcategorías de Filtro de Aire**
    - Argumento: Crear productos específicos para filtros de aire con diferentes tipos y compatibilidades.
    - Productos: Filtros de aire estándar, deportivos, con carbón activo, lavables
    - Especificaciones: Flujo de aire, eficiencia de filtración, durabilidad

### 83. **Implementar subsubcategorías de Filtro de Combustible**
    - Argumento: Crear productos específicos para filtros de combustible con diferentes tecnologías.
    - Productos: Filtros de combustible estándar, de alta presión, con válvula de retorno
    - Tecnologías: Filtrado fino, separación de agua, resistencia a presión

### 84. **Implementar subsubcategorías de Filtro de Habitáculo**
    - Argumento: Crear productos específicos para filtros de habitáculo con diferentes funcionalidades.
    - Productos: Filtros de habitáculo estándar, con carbón activo, antialérgicos, antibacterianos
    - Funcionalidades: Filtrado de polen, olores, bacterias, partículas finas

### 85. **Crear componente FiltrosSubSubsections reutilizable**
    - Argumento: Reutilizar la estructura de OilsSubSubsections para crear un componente genérico para filtros.
    - Archivo: `components/FiltrosSubSubsections.tsx`
    - Reutilización: Adaptar OilsSubSubsections para filtros con filtros específicos

### 86. **Implementar filtros específicos para Filtros**
    - Argumento: Crear filtros específicos para productos de filtros (tipo, marca, compatibilidad).
    - Archivo: `components/FiltrosFilters.tsx`
    - Filtros: Por tipo de filtro, marca, compatibilidad de vehículo, precio

### 87. **Integrar subsubcategorías de Filtros en MaintenanceSubsections**
    - Argumento: Agregar navegación y lógica para mostrar subsubcategorías de filtros.
    - Modificación: `components/MaintenanceSubsections.tsx`
    - Funcionalidad: Navegación similar a aceites pero para filtros

### 88. **Implementar navegación de subsubcategorías de Filtros**
    - Argumento: Crear botones de navegación para cada tipo de filtro con contadores de productos.
    - Diseño: Reutilizar el diseño de botones de aceites
    - Responsive: Adaptar para móvil y desktop

### 89. **Crear datos mock para productos de filtros**
    - Argumento: Generar 4-5 productos por cada subsubcategoría de filtros con datos realistas.
    - Especificaciones: Marca, modelo, compatibilidad, precio, descripción técnica
    - Imágenes: URLs de imágenes representativas de filtros

### 90. **Implementar filtrado por tipo de filtro**
    - Argumento: Permitir filtrar productos por el tipo específico de filtro seleccionado.
    - Lógica: Similar a la implementada para aceites
    - Estado: Manejar activeFilterType en MaintenanceSubsections

### 91. **Crear iconos específicos para cada tipo de filtro**
    - Argumento: Asignar iconos representativos para cada subsubcategoría de filtros.
    - Iconos: Filter (aceite), Wind (aire), Fuel (combustible), Shield (habitáculo)
    - Implementación: Usar iconos de Lucide React

### 92. **Implementar vista responsive para subsubcategorías de Filtros**
    - Argumento: Adaptar la interfaz para dispositivos móviles y tablets.
    - Móvil: Lista vertical de tipos de filtros
    - Desktop: Botones horizontales con contadores

### 93. **Integrar contadores de productos en navegación de Filtros**
    - Argumento: Mostrar la cantidad de productos disponibles en cada tipo de filtro.
    - Visualización: Badges con números en cada botón de tipo
    - Actualización: Dinámica según filtros aplicados

### 94. **Implementar búsqueda específica para productos de filtros**
    - Argumento: Permitir buscar productos de filtros por nombre, marca, modelo o especificaciones.
    - Campos: Nombre, marca, descripción, compatibilidad
    - Filtrado: En tiempo real con debounce

### 95. **Crear breadcrumbs para navegación de Filtros**
    - Argumento: Implementar navegación jerárquica clara para subsubcategorías de filtros.
    - Estructura: Mantenimientos > Filtros > [Tipo de Filtro]
    - Componente: Reutilizar SubSubsectionHeader

### 96. **Implementar estado de carga para subsubcategorías de Filtros**
    - Argumento: Mostrar indicadores de carga mientras se cargan los productos de filtros.
    - UX: Skeleton loaders para productos y navegación
    - Performance: Lazy loading de componentes

### 97. **Crear tests para funcionalidad de Filtros**
    - Argumento: Verificar que la navegación y filtrado de subsubcategorías de filtros funcione correctamente.
    - Cobertura: Navegación, filtrado, búsqueda, responsive
    - Archivo: `__tests__/FiltrosSubSubsections.test.tsx`

### 98. **Documentar implementación de subsubcategorías de Filtros**
    - Argumento: Documentar la estructura y uso de las subsubcategorías de filtros.
    - Archivo: `docs/filtros-subsubcategorias.md`
    - Contenido: Estructura de datos, componentes, navegación

### Subsecciones de nivel 3 para "Filtros" a implementar:

- **Filtro de Aceite**: Filtros para aceite sintético, mineral, semi-sintético, diferentes marcas y tamaños
- **Filtro de Aire**: Filtros de aire estándar, deportivos, con carbón activo, lavables
- **Filtro de Combustible**: Filtros de combustible estándar, de alta presión, con válvula de retorno
- **Filtro de Habitáculo**: Filtros de habitáculo estándar, con carbón activo, antialérgicos, antibacterianos
