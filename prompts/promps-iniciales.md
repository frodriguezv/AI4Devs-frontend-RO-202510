Actua como FontEnd developer con Master en UI/UX  , Ayudame a generar un promp basandote en estas instrucciones:

Queremos que al hacer clic en el botón "Ver proceso" de cualquiera de las posiciones, nos lleve a la vista de detalle de cada posición, denominada "position".

Tu misión en este ejercicio es crear la interfaz "position", una página en la que poder visualizar y gestionar los diferentes candidatos de una posición específica.

Se ha decidido que la interfaz sea tipo kanban, mostrando los candidatos como tarjetas en diferentes columnas que representan las fases del proceso de contratación, y pudiendo actualizar la fase en la que se encuentra un candidato solo arrastrando su tarjeta.Aquí tienes un ejemplo de interfaz posible:  En la carpeta @ui_sample/ tienes un ejemplo de la UI

Pudes generar varios prompts numerados para implementarlos uno por uno y asi tener un mejor control.

Algunos de los requerimientos del equipo de diseño que se pueden ver en el ejemplo son:

Se debe mostrar el título de la posición en la parte superior, para dar contexto

Añadir una flecha a la izquierda del título que permita volver al listado de posiciones

Deben mostrarse tantas columnas como fases haya en el proceso

La tarjeta de cada candidato/a debe situarse en la fase correspondiente, y debe mostrar su nombre completo y su puntuación media

Si es posible, debe mostrarse adecuadamente en móvil (las fases en vertical ocupando todo el ancho)

Algunas observaciones:

Asume que la página de posiciones la encuentras 

Asume que existe la estructura global de la página, la cual incluye los elementos comunes como menú superior y footer. Lo que estás creando es el contenido interno de la página.

Para implementar la funcionalidad de la página cuentas con diversos endpoints API que ha preparado el equipo de backend:

GET /positions/:id/interviewFlow
Este endpoint devuelve información sobre el proceso de contratación para una determinada posición:

positionName: Título de la posición

interviewSteps: id y nombre de las diferentes fases de las que consta el proceso de contratación

{
      "positionName": "Senior backend engineer",
      "interviewFlow": {
              
              "id": 1,
              "description": "Standard development interview process",
              "interviewSteps": [
                  {
                      "id": 1,
                      "interviewFlowId": 1,
                      "interviewTypeId": 1,
                      "name": "Initial Screening",
                      "orderIndex": 1
                  },
                  {
                      "id": 2,
                      "interviewFlowId": 1,
                      "interviewTypeId": 2,
                      "name": "Technical Interview",
                      "orderIndex": 2
                  },
                  {
                      "id": 3,
                      "interviewFlowId": 1,
                      "interviewTypeId": 3,
                      "name": "Manager Interview",
                      "orderIndex": 2
                  }
              ]
          }
  }
GET /positions/:id/candidates
Este endpoint devuelve todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado positionID. Proporciona la siguiente información:

name: Nombre completo del candidato

current_interview_step: en qué fase del proceso está el candidato.

score: La puntuación media del candidato

[
      {
           "fullName": "Jane Smith",
           "currentInterviewStep": "Technical Interview",
           "averageScore": 4
       },
       {
           "fullName": "Carlos García",
           "currentInterviewStep": "Initial Screening",
           "averageScore": 0            
       },        
       {
           "fullName": "John Doe",
           "currentInterviewStep": "Manager Interview",
           "averageScore": 5            
      }    
 ]

 
PUT /candidates/:id/stage
Este endpoint actualiza la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico, a través del parámetro "new_interview_step" y proporionando el interview_step_id correspondiente a la columna en la cual se encuentra ahora el candidato.

{
     "applicationId": "1",
     "currentInterviewStep": "3"
 }
{    
    "message": "Candidate stage updated successfully",
     "data": {
         "id": 1,
         "positionId": 1,
         "candidateId": 1,
         "applicationDate": "2024-06-04T13:34:58.304Z",
         "currentInterviewStep": 3,
         "notes": null,
         "interviews": []    
     }
 }

---------
Prompt 1: Análisis y Estructura Base

Como Frontend Developer con expertise en React y UI/UX, necesito crear la página de detalle de posición con visualización Kanban de candidatos.

CONTEXTO:
- Proyecto React con TypeScript existente
- Backend API ya disponible con los endpoints necesarios
- Estructura de navegación ya existe

TAREA:
1. Analizar la estructura actual del proyecto en @frontend/src/
2. Crear el componente base `PositionDetail.tsx` en la carpeta components
3. Configurar el routing para la nueva vista en App.tsx (ruta: /position/:id)
4. Crear el servicio `positionService.ts` con las funciones para consumir los endpoints:
   - getInterviewFlow(positionId)
   - getCandidates(positionId)
   - updateCandidateStage(candidateId, newStageId)

NO implementar aún la UI completa, solo la estructura base y servicios.

-----

Prompt 2: Layout Principal y Header

Implementar el layout principal de la vista PositionDetail con el header según los requisitos de diseño.

REQUISITOS:
1. Header sticky con:
   - Icono de flecha (←) a la izquierda que navegue de vuelta a /positions
   - Título de la posición centrado (obtener de API)
   - Altura mínima de 60px con padding adecuado
   - Fondo blanco con sombra sutil

2. Fetch de datos inicial:
   - Llamar a getInterviewFlow al montar el componente
   - Mostrar loading state mientras carga
   - Manejar errores con mensaje apropiado

3. Estilos:
   - Usar diseño limpio y profesional similar a @ui_sample/
   - Paleta de colores corporativa consistente
   - Typography clara y legible

NO implementar aún el Kanban board, solo el header funcional.

------

Prompt 3: Estructura del Kanban Board - Columnas

Implementar la estructura de columnas del Kanban board basándose en los interview steps.

REQUISITOS:
1. Grid de columnas responsivo:
   - Desktop: columnas horizontales con scroll horizontal si es necesario
   - Mobile: columnas verticales apiladas ocupando 100% del ancho
   - Cada columna debe tener el mismo ancho (flex-basis)

2. Header de columna:
   - Mostrar el nombre del interview step
   - Contador de candidatos en esa fase
   - Fondo con color distintivo según el orden del step

3. Área de drop para las tarjetas:
   - Altura mínima para visualización correcta
   - Background sutil que indique área de drop

4. Usar los interviewSteps obtenidos del API para generar las columnas dinámicamente

NO implementar aún las tarjetas de candidatos ni drag & drop.

------

Prompt 4: Tarjetas de Candidatos

Implementar las tarjetas de candidatos dentro de las columnas correspondientes.

REQUISITOS:
1. Fetch de candidatos:
   - Llamar a getCandidates al montar el componente
   - Agrupar candidatos por currentInterviewStep
   - Colocar cada candidato en su columna correspondiente

2. Diseño de tarjeta:
   - Card con shadow y border radius
   - Nombre completo del candidato (font-weight: 600)
   - Puntuación media con icono de estrella (⭐) o similar
   - Si averageScore es 0, mostrar "Sin evaluar"
   - Padding adecuado (12-16px)
   - Hover effect sutil

3. Responsive:
   - Ancho 100% del contenedor de la columna
   - Margin bottom entre tarjetas
   - Touch-friendly en mobile (min-height 60px)

NO implementar aún funcionalidad drag & drop.


-----

Prompt 5: Drag & Drop Funcionalidad


Implementar la funcionalidad drag & drop para mover candidatos entre fases.

REQUISITOS:
1. Usar react-beautiful-dnd o @dnd-kit/core para drag & drop
2. Permitir arrastrar tarjetas entre columnas
3. Visual feedback durante el drag:
   - Card semi-transparente mientras se arrastra
   - Placeholder en la posición de drop
   - Highlight de la columna objetivo

4. Al soltar la tarjeta:
   - Actualizar UI de manera optimista
   - Llamar a updateCandidateStage con el applicationId y nuevo interviewStepId
   - Manejar errores y revertir cambios si falla
   - Mostrar toast/notificación de éxito

5. Accesibilidad:
   - Soporte de teclado para usuarios sin mouse
   - Anuncios ARIA para screen readers


------

Prompt 6: Loading States y Error Handling

Implementar estados de carga, errores y casos edge mejorados.

REQUISITOS:
1. Loading states:
   - Skeleton screens para columnas y tarjetas mientras carga
   - Spinner durante actualización de candidato
   - Deshabilitar drag & drop mientras hay operaciones pendientes

2. Error handling:
   - Mensajes de error específicos y accionables
   - Botón de retry para operaciones fallidas
   - Fallback UI si no hay candidatos o pasos de entrevista

3. Empty states:
   - Mensaje apropiado si una columna no tiene candidatos
   - Mensaje si la posición no tiene candidatos en absoluto
   - Ilustración o icono para mejorar UX

4. Validaciones:
   - Verificar que el positionId existe antes de cargar datos
   - Manejar respuestas inesperadas del API

--------

Prompt 7: Refinamiento UI/UX y Polish

Refinar la interfaz para lograr una experiencia de usuario excepcional.

REQUISITOS:
1. Animaciones y transiciones:
   - Smooth transitions en drag & drop
   - Fade in de tarjetas al cargar
   - Animación sutil en hover de tarjetas

2. Mejoras visuales basadas en @ui_sample/:
   - Ajustar colores y spacing para match perfecto
   - Mejorar contraste para accesibilidad (WCAG AA)
   - Añadir iconografía apropiada

3. Performance:
   - Memoización de componentes que no cambian frecuentemente
   - Optimizar re-renders innecesarios
   - Lazy loading si el número de candidatos es muy grande

4. Responsive final check:
   - Probar en diferentes breakpoints (320px, 768px, 1024px, 1440px)
   - Ajustar spacing y font-sizes para cada breakpoint
   - Asegurar funcionalidad touch en tablets y móviles

5. Testing manual:
   - Verificar todos los flujos de usuario
   - Probar con diferentes cantidades de datos (0, 1, 5, 20+ candidatos)

