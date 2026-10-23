export type LanguageCode = 'ru' | 'en' | 'es' | 'zh' | 'hi' | 'it' | 'de';

export type LocaleCode = 'ru-RU' | 'en-US' | 'es-ES' | 'zh-CN' | 'hi-IN' | 'it-IT' | 'de-DE';

export type TranslationKeys = {
  common: {
    arrowUp: string;
    arrowRight: string;

    yes: string;
    no: string;

    on: string;
    off: string;

    none: string;
    default: string;

    add: string;
    remove: string;
    cancel: string;
    apply: string;
    reset: string;
    close: string;

    enabled: string;
    disabled: string;

    upload: string;
    replace: string;
    language: string;
  };

  dashboard: {
    title: string;
    subtitle: string;
    newProject: string;
    newProjectDefault: string;
    emptyTitle: string;
    emptyText: string;
    createFirst: string;
    open: string;
    rename: string;
    duplicate: string;
    delete: string;
    deleteConfirm: string;
    updated: string;
    templateTitle: string;
    templateSubtitle: string;
    blankTemplate: string;
    blankTemplateDescription: string;
    starterTemplate: string;
    starterTemplateDescription: string;
    createFromTemplate: string;
    cancel: string;
  };

  editor: {
    title: string;

    save: string;
    saved: string;
    unsaved: string;

    undo: string;
    redo: string;

    inspector: string;
    timeline: string;

    selectObject: string;
    selectObjectHint: string;

    position: string;
    size: string;
    export: string;
    exportTitle: string;
    exportDescription: string;
    exportProject: string;
    exportProjectDescription: string;
    exportMp4: string;
    exportMp4Description: string;
    exportWebm: string;
    exportWebmDescription: string;
    exportGif: string;
    exportGifDescription: string;
    exportPng: string;
    exportPngDescription: string;
    exportCancel: string;
    exporting: string;
    exportError: string;
    exportServerMissing: string;
  };

  inspector: {
    content: string;
    animation: string;
    layer: string;
    appearance: string;
    transform: string;
    timing: string;

    positionX: string;
    positionY: string;

    scale: string;
    scaleX: string;
    scaleY: string;

    rotation: string;
    opacity: string;

    startFrame: string;
    duration: string;
    frameInfo: string;

    zIndex: string;

    fontSize: string;
    fontFamily: string;
    fontWeight: string;
    color: string;
    backgroundColor: string;

    moveForward: string;
    moveBackward: string;
    bringToFront: string;
    sendToBack: string;
    width: string;
    height: string;
  };

  layer: {
    background: string;
    images: string;
    characters: string;
    text: string;
    shapes: string;
    other: string;
  };

  animation: {
    preset: string;
    custom: string;

    enter: string;
    exit: string;

    duration: string;
    exitDuration: string;

    enterDuration: string;

    delay: string;
    exitDelay: string;

    intensity: string;

    none: string;
    fade: string;
    slide: string;
    slideUp: string;
    slideDown: string;
    slideLeft: string;
    slideRight: string;

    scale: string;
    pop: string;
    bounce: string;
    shake: string;
    rotate: string;

    presetMinimal: string;
    presetSmooth: string;
    presetPop: string;
    presetSlide: string;
    presetDramatic: string;
    presetAttention: string;
  };

  timeline: {
    video: string;
    text: string;
    shape: string;
    other: string;

    collapse: string;
    expand: string;

    frame: string;
    frames: string;

    start: string;
    end: string;

    move: string;
    resize: string;

    scenes: string;
    scene: string;
    collapseScenes: string;
    expandScenes: string;
    addScene: string;
    duplicateScene: string;
    deleteScene: string;
    increaseDuration: string;
    decreaseDuration: string;
  };

  library: {
    title: string;
    overlay: string;

    text: string;
    number: string;
    money: string;
    metric: string;
    stat: string;

    chart: string;
    barChart: string;
    comparison: string;

    group: string;
    stack: string;
    sequence: string;

    rectangle: string;
    circle: string;
    line: string;
    arrow: string;
    bar: string;
    progress: string;
    badge: string;
    image: string;
  };

  content: {
    text: string;

    numberFrom: string;
    numberTo: string;
    numberSuffix: string;

    moneyAmount: string;
    moneyCurrency: string;
    moneyCustom: string;
    moneyCustomSuffix: string;

    value: string;
    label: string;
    detail: string;
    icon: string;
    image: string;
    direction: string;

    values: string;
    xLabels: string;
    yLabels: string;

    xAxisTitle: string;
    yAxisTitle: string;

    labels: string;

    left: string;
    right: string;
    title: string;
    arrow: string;

    max: string;
    fillDuration: string;
  };

  direction: {
    up: string;
    down: string;
    neutral: string;
  };

  placeholders: {
    chartLabels: string;
    chartXAxisTitle: string;
    chartYAxisTitle: string;
    chartValues: string;
  };

  blocks: {
    text: {
      example: string;
    };

    metric: {
      income: string;
      incomeGrowth: string;
      perMonth: string;
    };

    stat: {
      incomeGrowth: string;
      perMonth: string;
    };

    comparison: {
      before: string;
      after: string;
    };

    badge: {
      important: string;
    };
  };

  chart: {
    months: string[];
  };

  validation: {
    invalidValue: string;
    required: string;
    minValue: string;
    maxValue: string;
  };

  errors: {
    saveFailed: string;
    projectOpenFailed: string;
    projectDataRenderFailed: string;
    projectsLoadPartial: string;
    reloadEditor: string;
    backToDashboard: string;
  };

  contextMenu: {
    copy: string;
    duplicate: string;
    delete: string;
    moveForward: string;
    moveBackward: string;
    bringToFront: string;
    sendToBack: string;
    paste: string;
  };

  audio: {
    title: string;
    notLoaded: string;
    addRecording: string;
    upload: string;
    volume: string;
    enableSound: string;
    disableSound: string;
    invalidFile: string;
    metadataDecodeFailed: string;
  };

  sceneInspector: {
    scene: string;
    name: string;
    namePlaceholder: string;
    durationSeconds: string;
    position: string;
    start: string;
    end: string;
    blocks: string;
    addContent: string;
    secondsShort: string;
  };
};
