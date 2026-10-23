import type { TranslationKeys } from '../types';

export const en: TranslationKeys = {
  common: {
    arrowUp: '↑',
    arrowRight: '→',

    yes: 'Yes',
    no: 'No',

    on: 'On',
    off: 'Off',

    none: 'None',
    default: 'Default',

    add: 'Add',
    remove: 'Remove',
    cancel: 'Cancel',
    apply: 'Apply',
    reset: 'Reset',
    close: 'Close',

    enabled: 'Enabled',
    disabled: 'Disabled',

    upload: 'Upload',
    language: 'Language',

    replace: 'Replace',
  },

  dashboard: {
    title: 'Projects',
    subtitle: 'Create and manage your vertical video projects.',
    newProject: 'New Project',
    newProjectDefault: 'Untitled Project',
    emptyTitle: 'No projects yet',
    emptyText: 'Create your first project and start building a vertical video.',
    createFirst: 'Create First Project',
    open: 'Open',
    rename: 'Rename',
    duplicate: 'Duplicate',
    delete: 'Delete',
    deleteConfirm: 'Delete this project?',
    updated: 'Updated',
    templateTitle: 'Choose a project template',
    templateSubtitle: 'Start from a blank canvas or the current example.',
    blankTemplate: 'Blank Project',
    blankTemplateDescription: 'An empty vertical video project.',
    starterTemplate: 'Starter Example',
    starterTemplateDescription: 'The current WallCut example with ready-made scenes.',
    createFromTemplate: 'Create Project',
    cancel: 'Cancel',
  },

  editor: {
    title: 'WallCut Editor',

    save: 'Save',
    saved: 'Saved',
    unsaved: 'Unsaved',

    undo: 'Undo',
    redo: 'Redo',

    inspector: 'Inspector',
    timeline: 'Timeline',

    selectObject: 'Select an object',
    selectObjectHint: 'on the video.',

    position: 'Position',
    size: 'Size',
    export: 'Export',
    exportTitle: 'Export project',
    exportDescription: 'Choose a format for the current project version.',
    exportProject: 'Project JSON',
    exportProjectDescription: 'Project, timeline and audio tracks for backup or transfer.',
    exportMp4: 'MP4 video',
    exportMp4Description: 'H.264 video for vertical video platforms.',
    exportWebm: 'WebM video',
    exportWebmDescription: 'Video in the open WebM format.',
    exportGif: 'Animated GIF',
    exportGifDescription: 'Animation without audio; file size may be large.',
    exportPng: 'PNG frames (ZIP)',
    exportPngDescription: 'Image sequence for further editing.',
    exportCancel: 'Cancel',
    exporting: 'Exporting…',
    exportError: 'Export failed. Check browser support for local rendering and try again.',
    exportServerMissing:
      'Video export is not configured on the server. Project JSON can be downloaded without a server.',
  },

  inspector: {
    content: 'Content',
    animation: 'Animation',
    layer: 'Layer',
    appearance: 'Appearance',
    transform: 'Transform',
    timing: 'Timing',

    positionX: 'Position X',
    positionY: 'Position Y',

    scale: 'Scale',
    scaleX: 'Scale X',
    scaleY: 'Scale Y',

    rotation: 'Rotation',
    opacity: 'Opacity',

    startFrame: 'Start Frame',
    duration: 'Duration',
    frameInfo: 'Timing is measured in frames at 30 FPS.',

    zIndex: 'Z-Index',

    fontSize: 'Font Size',
    fontFamily: 'Font Family',
    fontWeight: 'Font Weight',
    color: 'Color',
    backgroundColor: 'Background',

    moveForward: 'Forward',
    moveBackward: 'Backward',
    bringToFront: 'To Front',
    sendToBack: 'To Back',
    width: 'Width',
    height: 'Height',
  },

  layer: {
    background: 'Background',
    images: 'Images',
    characters: 'Characters',
    text: 'Text',
    shapes: 'Shapes',
    other: 'Other',
  },

  animation: {
    preset: 'Preset',
    custom: 'Custom',

    enter: 'Enter',
    exit: 'Exit',

    duration: 'Duration',
    exitDuration: 'Exit Duration',
    enterDuration: 'Enter Duration',

    delay: 'Delay',
    exitDelay: 'Exit Delay',

    intensity: 'Intensity',

    none: 'None',
    fade: 'Fade',
    slide: 'Slide',
    slideUp: 'Slide Up',
    slideDown: 'Slide Down',
    slideLeft: 'Slide Left',
    slideRight: 'Slide Right',

    scale: 'Scale',
    pop: 'Pop',
    bounce: 'Bounce',
    shake: 'Shake',
    rotate: 'Rotate',

    presetMinimal: 'Minimal',
    presetSmooth: 'Smooth',
    presetPop: 'Pop',
    presetSlide: 'Slide',
    presetDramatic: 'Dramatic',
    presetAttention: 'Attention',
  },

  timeline: {
    video: 'Video',
    text: 'Text',
    shape: 'Shapes',
    other: 'Other',

    collapse: 'Collapse',
    expand: 'Expand',

    frame: 'Frame',
    frames: 'Frames',

    start: 'Start',
    end: 'End',

    move: 'Move',
    resize: 'Resize',
    scenes: 'Scenes',
    scene: 'Scene',
    collapseScenes: 'Collapse scenes',
    expandScenes: 'Expand scenes',
    addScene: 'Add scene',
    duplicateScene: 'Duplicate selected scene',
    deleteScene: 'Delete selected scene',
    increaseDuration: 'Increase duration',
    decreaseDuration: 'Decrease duration',
  },

  library: {
    title: 'Elements',

    text: 'Text',
    number: 'Number',
    money: 'Money',
    metric: 'Metric',
    stat: 'Stat',

    chart: 'Chart',
    barChart: 'Bar Chart',
    comparison: 'Comparison',

    group: 'Group',
    stack: 'Stack',
    sequence: 'Sequence',

    rectangle: 'Rectangle',
    circle: 'Circle',
    line: 'Line',
    arrow: 'Arrow',
    bar: 'Bar',
    progress: 'Progress',
    badge: 'Badge',
    image: 'Image',
    overlay: 'Overlay',
  },

  content: {
    text: 'Text',

    numberFrom: 'From',
    numberTo: 'To',
    numberSuffix: 'Suffix',

    moneyAmount: 'Amount',
    moneyCurrency: 'Currency',
    moneyCustom: 'Custom',
    moneyCustomSuffix: 'Custom suffix',

    value: 'Value',
    label: 'Label',
    detail: 'Detail',
    icon: 'Image',
    image: 'Image',
    direction: 'Direction',

    values: 'Values',
    xLabels: 'X Labels',
    yLabels: 'Y Labels',

    xAxisTitle: 'X Axis Title',
    yAxisTitle: 'Y Axis Title',

    labels: 'Labels',

    left: 'Left',
    right: 'Right',
    title: 'Title',
    arrow: 'Arrow',

    max: 'Max',
    fillDuration: 'Fill duration (sec.)',
  },

  direction: {
    up: 'Up',
    down: 'Down',
    neutral: 'Neutral',
  },

  placeholders: {
    chartLabels: 'Jan, Feb, Mar, Apr',
    chartXAxisTitle: 'Month',
    chartYAxisTitle: 'Income, $',
    chartValues: '100, 120, 140, 160',
  },

  blocks: {
    text: {
      example: 'Example text',
    },

    metric: {
      income: 'Income',
      incomeGrowth: 'Income growth',
      perMonth: 'Per month',
    },

    stat: {
      incomeGrowth: 'Income growth',
      perMonth: 'Per month',
    },

    comparison: {
      before: 'Before',
      after: 'After',
    },

    badge: {
      important: 'Important',
    },
  },

  chart: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },

  validation: {
    invalidValue: 'Invalid value',
    required: 'Required field',
    minValue: 'Minimum value',
    maxValue: 'Maximum value',
  },

  errors: {
    saveFailed: 'Failed to save changes.',
    projectOpenFailed: 'Unable to open project',
    projectsLoadPartial: 'Some projects could not be loaded:',
    projectDataRenderFailed: 'The project data could not be rendered.',
    reloadEditor: 'Reload editor',
    backToDashboard: 'Back to dashboard',
  },

  contextMenu: {
    copy: 'Copy',
    duplicate: 'Duplicate',
    delete: 'Delete',
    moveForward: 'Move forward',
    moveBackward: 'Move backward',
    bringToFront: 'Bring to front',
    sendToBack: 'Send to back',
    paste: 'Paste',
  },

  audio: {
    title: 'Audio',
    notLoaded: 'Audio not loaded',
    addRecording: 'Add audio recording',
    upload: 'Upload',
    volume: 'Volume',
    enableSound: 'Enable sound',
    disableSound: 'Disable sound',
    invalidFile: 'Select an audio file: WAV, MP3, M4A, AAC, OGG or WebM.',
    metadataDecodeFailed: 'Failed to read audio metadata.',
  },

  sceneInspector: {
    scene: 'SCENE',
    name: 'Name',
    namePlaceholder: 'Scene name',
    durationSeconds: 'Duration, sec',
    position: 'Position',
    start: 'Start',
    end: 'End',
    blocks: 'Blocks',
    addContent: 'Add content',
    secondsShort: 'sec',
  },
};
