import type { TranslationKeys } from '../types';

export const es: TranslationKeys = {
  common: {
    arrowUp: '↑',
    arrowRight: '→',

    yes: 'Sí',
    no: 'No',

    on: 'Activado',
    off: 'Desactivado',

    none: 'Ninguno',
    default: 'Predeterminado',

    add: 'Añadir',
    remove: 'Eliminar',
    cancel: 'Cancelar',
    apply: 'Aplicar',
    reset: 'Restablecer',
    close: 'Cerrar',

    enabled: 'Activado',
    disabled: 'Desactivado',

    upload: 'Subir',
    language: 'Idioma',

    replace: 'Reemplazar',
  },

  dashboard: {
    title: 'Proyectos',
    subtitle: 'Crea y gestiona tus proyectos de vídeo vertical.',
    newProject: 'Nuevo proyecto',
    newProjectDefault: 'Sin título',
    emptyTitle: 'Aún no hay proyectos',
    emptyText: 'Crea tu primer proyecto y empieza a crear un vídeo vertical.',
    createFirst: 'Crear primer proyecto',
    open: 'Abrir',
    rename: 'Renombrar',
    duplicate: 'Duplicar',
    delete: 'Eliminar',
    deleteConfirm: '¿Eliminar este proyecto?',
    updated: 'Actualizado',
    templateTitle: 'Elige una plantilla de proyecto',
    templateSubtitle: 'Empieza con un lienzo vacío o con el ejemplo actual.',
    blankTemplate: 'Proyecto vacío',
    blankTemplateDescription: 'Un proyecto de vídeo vertical vacío.',
    starterTemplate: 'Ejemplo inicial',
    starterTemplateDescription: 'El ejemplo actual de WallCut con escenas listas.',
    createFromTemplate: 'Crear proyecto',
    cancel: 'Cancelar',
  },

  editor: {
    title: 'Editor de WallCut',

    save: 'Guardar',
    saved: 'Guardado',
    unsaved: 'Sin guardar',

    undo: 'Deshacer',
    redo: 'Rehacer',

    inspector: 'Inspector',
    timeline: 'Línea de tiempo',

    selectObject: 'Selecciona un objeto',
    selectObjectHint: 'en el vídeo.',

    position: 'Posición',
    size: 'Tamaño',
    export: 'Exportar',
    exportTitle: 'Exportar proyecto',
    exportDescription: 'Elige un formato para la versión actual del proyecto.',
    exportProject: 'Proyecto JSON',
    exportProjectDescription:
      'Proyecto, línea de tiempo y pistas de audio para copia o transferencia.',
    exportMp4: 'Vídeo MP4',
    exportMp4Description: 'Vídeo H.264 para plataformas de vídeo vertical.',
    exportWebm: 'Vídeo WebM',
    exportWebmDescription: 'Vídeo en el formato abierto WebM.',
    exportGif: 'GIF animado',
    exportGifDescription: 'Animación sin sonido; el archivo puede ser grande.',
    exportPng: 'Fotogramas PNG (ZIP)',
    exportPngDescription: 'Secuencia de imágenes para editar después.',
    exportCancel: 'Cancelar',
    exporting: 'Exportando…',
    exportError:
      'No se pudo exportar. Comprueba la compatibilidad del navegador con el renderizado local e inténtalo de nuevo.',
    exportServerMissing:
      'La exportación de vídeo no está configurada en el servidor. Puedes descargar el proyecto JSON sin servidor.',
  },

  inspector: {
    content: 'Contenido',
    animation: 'Animación',
    layer: 'Capa',
    appearance: 'Apariencia',
    transform: 'Transformación',
    timing: 'Tiempo',

    positionX: 'Posición X',
    positionY: 'Posición Y',

    scale: 'Escala',
    scaleX: 'Escala X',
    scaleY: 'Escala Y',

    rotation: 'Rotación',
    opacity: 'Opacidad',

    startFrame: 'Fotograma inicial',
    duration: 'Duración',
    frameInfo: 'El tiempo se mide en fotogramas a 30 FPS.',

    zIndex: 'Índice Z',

    fontSize: 'Tamaño de fuente',
    fontFamily: 'Familia de fuente',
    fontWeight: 'Peso de fuente',
    color: 'Color',
    backgroundColor: 'Fondo',

    moveForward: 'Adelante',
    moveBackward: 'Atrás',
    bringToFront: 'Traer al frente',
    sendToBack: 'Enviar atrás',
    width: 'Ancho',
    height: 'Alto',
  },

  layer: {
    background: 'Fondo',
    images: 'Imágenes',
    characters: 'Personajes',
    text: 'Texto',
    shapes: 'Formas',
    other: 'Otros',
  },

  animation: {
    preset: 'Preajuste',
    custom: 'Personalizada',

    enter: 'Entrada',
    exit: 'Salida',

    duration: 'Duración',
    exitDuration: 'Duración de salida',
    enterDuration: 'Duración de entrada',

    delay: 'Retraso',
    exitDelay: 'Retraso de salida',

    intensity: 'Intensidad',

    none: 'Ninguna',
    fade: 'Desvanecer',
    slide: 'Deslizar',
    slideUp: 'Deslizar arriba',
    slideDown: 'Deslizar abajo',
    slideLeft: 'Deslizar a la izquierda',
    slideRight: 'Deslizar a la derecha',

    scale: 'Escalar',
    pop: 'Aparición',
    bounce: 'Rebote',
    shake: 'Sacudir',
    rotate: 'Girar',

    presetMinimal: 'Mínimo',
    presetSmooth: 'Suave',
    presetPop: 'Aparición',
    presetSlide: 'Deslizamiento',
    presetDramatic: 'Dramático',
    presetAttention: 'Atención',
  },

  timeline: {
    video: 'Vídeo',
    text: 'Texto',
    shape: 'Formas',
    other: 'Otros',

    collapse: 'Contraer',
    expand: 'Expandir',

    frame: 'Fotograma',
    frames: 'Fotogramas',

    start: 'Inicio',
    end: 'Fin',

    move: 'Mover',
    resize: 'Cambiar tamaño',
    scenes: 'Escenas',
    scene: 'Escena',
    collapseScenes: 'Contraer escenas',
    expandScenes: 'Expandir escenas',
    addScene: 'Añadir escena',
    duplicateScene: 'Duplicar la escena seleccionada',
    deleteScene: 'Eliminar la escena seleccionada',
    increaseDuration: 'Aumentar duración',
    decreaseDuration: 'Disminuir duración',
  },

  library: {
    title: 'Elementos',

    text: 'Texto',
    number: 'Número',
    money: 'Dinero',
    metric: 'Métrica',
    stat: 'Estadística',

    chart: 'Gráfico',
    barChart: 'Gráfico de barras',
    comparison: 'Comparación',

    group: 'Grupo',
    stack: 'Pila',
    sequence: 'Secuencia',

    rectangle: 'Rectángulo',
    circle: 'Círculo',
    line: 'Línea',
    arrow: 'Flecha',
    bar: 'Barra',
    progress: 'Progreso',
    badge: 'Insignia',
    image: 'Imagen',
    overlay: 'Superposición',
  },

  content: {
    text: 'Texto',

    numberFrom: 'Desde',
    numberTo: 'Hasta',
    numberSuffix: 'Sufijo',

    moneyAmount: 'Cantidad',
    moneyCurrency: 'Moneda',
    moneyCustom: 'Personalizada',
    moneyCustomSuffix: 'Sufijo personalizado',

    value: 'Valor',
    label: 'Etiqueta',
    detail: 'Detalle',
    icon: 'Imagen',
    image: 'Imagen',
    direction: 'Dirección',

    values: 'Valores',
    xLabels: 'Etiquetas X',
    yLabels: 'Etiquetas Y',

    xAxisTitle: 'Título del eje X',
    yAxisTitle: 'Título del eje Y',

    labels: 'Etiquetas',

    left: 'Izquierda',
    right: 'Derecha',
    title: 'Título',
    arrow: 'Flecha',

    max: 'Máximo',
    fillDuration: 'Duración de llenado (seg.)',
  },

  direction: {
    up: 'Arriba',
    down: 'Abajo',
    neutral: 'Neutral',
  },

  placeholders: {
    chartLabels: 'Ene, Feb, Mar, Abr',
    chartXAxisTitle: 'Mes',
    chartYAxisTitle: 'Ingresos, €',
    chartValues: '100, 120, 140, 160',
  },

  blocks: {
    text: {
      example: 'Texto de ejemplo',
    },

    metric: {
      income: 'Ingresos',
      incomeGrowth: 'Crecimiento de ingresos',
      perMonth: 'Por mes',
    },

    stat: {
      incomeGrowth: 'Crecimiento de ingresos',
      perMonth: 'Por mes',
    },

    comparison: {
      before: 'Antes',
      after: 'Después',
    },

    badge: {
      important: 'Importante',
    },
  },

  chart: {
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  },

  validation: {
    invalidValue: 'Valor no válido',
    required: 'Campo obligatorio',
    minValue: 'Valor mínimo',
    maxValue: 'Valor máximo',
  },

  errors: {
    saveFailed: 'No se pudieron guardar los cambios.',
    projectOpenFailed: 'No se pudo abrir el proyecto',
    projectsLoadPartial: 'No se pudieron cargar algunos proyectos:',
    projectDataRenderFailed: 'No se pudieron renderizar los datos del proyecto.',
    reloadEditor: 'Recargar editor',
    backToDashboard: 'Volver a proyectos',
  },

  contextMenu: {
    copy: 'Copiar',
    duplicate: 'Duplicar',
    delete: 'Eliminar',
    moveForward: 'Mover adelante',
    moveBackward: 'Mover atrás',
    bringToFront: 'Traer al frente',
    sendToBack: 'Enviar atrás',
    paste: 'Pegar',
  },

  audio: {
    title: 'Audio',
    notLoaded: 'Audio no cargado',
    addRecording: 'Añadir grabación de audio',
    upload: 'Subir',
    volume: 'Volumen',
    enableSound: 'Activar sonido',
    disableSound: 'Desactivar sonido',
    invalidFile: 'Selecciona un archivo de audio: WAV, MP3, M4A, AAC, OGG o WebM.',
    metadataDecodeFailed: 'No se pudieron leer los metadatos de audio.',
  },

  sceneInspector: {
    scene: 'ESCENA',
    name: 'Nombre',
    namePlaceholder: 'Nombre de la escena',
    durationSeconds: 'Duración, seg',
    position: 'Posición',
    start: 'Inicio',
    end: 'Fin',
    blocks: 'Bloques',
    addContent: 'Añadir contenido',
    secondsShort: 's',
  },
};
