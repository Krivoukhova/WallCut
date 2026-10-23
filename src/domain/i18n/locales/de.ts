import type { TranslationKeys } from '../types';

export const de: TranslationKeys = {
  common: {
    arrowUp: '↑',
    arrowRight: '→',

    yes: 'Ja',
    no: 'Nein',

    on: 'Ein',
    off: 'Aus',

    none: 'Keine',
    default: 'Standard',

    add: 'Hinzufügen',
    remove: 'Entfernen',
    cancel: 'Abbrechen',
    apply: 'Anwenden',
    reset: 'Zurücksetzen',
    close: 'Schließen',

    enabled: 'Aktiviert',
    disabled: 'Deaktiviert',

    upload: 'Hochladen',
    language: 'Sprache',

    replace: 'Ersetzen',
  },

  dashboard: {
    title: 'Projekte',
    subtitle: 'Erstelle und verwalte deine Hochkantvideo-Projekte.',
    newProject: 'Neues Projekt',
    newProjectDefault: 'Unbenanntes Projekt',
    emptyTitle: 'Noch keine Projekte',
    emptyText: 'Erstelle dein erstes Projekt und beginne mit einem Hochkantvideo.',
    createFirst: 'Erstes Projekt erstellen',
    open: 'Öffnen',
    rename: 'Umbenennen',
    duplicate: 'Duplizieren',
    delete: 'Löschen',
    deleteConfirm: 'Dieses Projekt löschen?',
    updated: 'Aktualisiert',
    templateTitle: 'Projektvorlage auswählen',
    templateSubtitle: 'Beginne mit einer leeren Arbeitsfläche oder dem aktuellen Beispiel.',
    blankTemplate: 'Leeres Projekt',
    blankTemplateDescription: 'Ein leeres Projekt für Hochkantvideos.',
    starterTemplate: 'Startbeispiel',
    starterTemplateDescription: 'Das aktuelle WallCut-Beispielprojekt mit vorbereiteten Szenen.',
    createFromTemplate: 'Projekt erstellen',
    cancel: 'Abbrechen',
  },

  editor: {
    title: 'WallCut-Editor',

    save: 'Speichern',
    saved: 'Gespeichert',
    unsaved: 'Nicht gespeichert',

    undo: 'Rückgängig',
    redo: 'Wiederholen',

    inspector: 'Eigenschaften',
    timeline: 'Zeitleiste',

    selectObject: 'Objekt auswählen',
    selectObjectHint: 'im Video.',

    position: 'Position',
    size: 'Größe',
    export: 'Exportieren',
    exportTitle: 'Projekt exportieren',
    exportDescription: 'Wähle ein Format für die aktuelle Projektversion.',
    exportProject: 'Projekt-JSON',
    exportProjectDescription: 'Projekt, Zeitleiste und Audiospuren zur Sicherung oder Übertragung.',
    exportMp4: 'MP4-Video',
    exportMp4Description: 'H.264-Video für Plattformen für Hochkantvideos.',
    exportWebm: 'WebM-Video',
    exportWebmDescription: 'Video im offenen WebM-Format.',
    exportGif: 'Animiertes GIF',
    exportGifDescription: 'Animation ohne Ton; die Datei kann groß werden.',
    exportPng: 'PNG-Einzelbilder (ZIP)',
    exportPngDescription: 'Bildsequenz zur weiteren Bearbeitung.',
    exportCancel: 'Abbrechen',
    exporting: 'Export wird ausgeführt …',
    exportError: 'Export fehlgeschlagen. Prüfe die Browser-Unterstützung für lokales Rendering und versuche es erneut.',
    exportServerMissing:
      'Der Videoexport ist auf dem Server nicht eingerichtet. Die Projektdatei im JSON-Format kann auch ohne Server heruntergeladen werden.',
  },

  inspector: {
    content: 'Inhalt',
    animation: 'Animation',
    layer: 'Ebene',
    appearance: 'Darstellung',
    transform: 'Transformation',
    timing: 'Zeitsteuerung',

    positionX: 'Position X',
    positionY: 'Position Y',

    scale: 'Skalierung',
    scaleX: 'Skalierung X',
    scaleY: 'Skalierung Y',

    rotation: 'Drehung',
    opacity: 'Deckkraft',

    startFrame: 'Startbild',
    duration: 'Dauer',
    frameInfo: 'Die Zeitangaben werden in Einzelbildern bei 30 FPS gemessen.',

    zIndex: 'Z-Index',

    fontSize: 'Schriftgröße',
    fontFamily: 'Schriftart',
    fontWeight: 'Schriftschnitt',
    color: 'Farbe',
    backgroundColor: 'Hintergrund',

    moveForward: 'Nach vorne',
    moveBackward: 'Nach hinten',
    bringToFront: 'Ganz nach vorne',
    sendToBack: 'Ganz nach hinten',
    width: 'Breite',
    height: 'Höhe',
  },

  layer: {
    background: 'Hintergrund',
    images: 'Bilder',
    characters: 'Figuren',
    text: 'Text',
    shapes: 'Formen',
    other: 'Sonstiges',
  },

  animation: {
    preset: 'Voreinstellung',
    custom: 'Benutzerdefiniert',

    enter: 'Eingang',
    exit: 'Ausgang',

    duration: 'Dauer',
    exitDuration: 'Ausgangsdauer',
    enterDuration: 'Eingangsdauer',

    delay: 'Verzögerung',
    exitDelay: 'Verzögerung beim Ausblenden',

    intensity: 'Intensität',

    none: 'Keine',
    fade: 'Einblenden',
    slide: 'Gleiten',
    slideUp: 'Nach oben gleiten',
    slideDown: 'Nach unten gleiten',
    slideLeft: 'Nach links gleiten',
    slideRight: 'Nach rechts gleiten',

    scale: 'Skalierung',
    pop: 'Aufploppen',
    bounce: 'Abprallen',
    shake: 'Schütteln',
    rotate: 'Drehen',

    presetMinimal: 'Minimal',
    presetSmooth: 'Sanft',
    presetPop: 'Aufploppen',
    presetSlide: 'Gleiten',
    presetDramatic: 'Dramatisch',
    presetAttention: 'Aufmerksamkeit',
  },

  timeline: {
    video: 'Video',
    text: 'Text',
    shape: 'Formen',
    other: 'Sonstiges',

    collapse: 'Einklappen',
    expand: 'Ausklappen',

    frame: 'Einzelbild',
    frames: 'Einzelbilder',

    start: 'Start',
    end: 'Ende',

    move: 'Verschieben',
    resize: 'Größe ändern',
    scenes: 'Szenen',
    scene: 'Szene',
    collapseScenes: 'Szenen einklappen',
    expandScenes: 'Szenen ausklappen',
    addScene: 'Szene hinzufügen',
    duplicateScene: 'Ausgewählte Szene duplizieren',
    deleteScene: 'Ausgewählte Szene löschen',
    increaseDuration: 'Dauer verlängern',
    decreaseDuration: 'Dauer verkürzen',
  },

  library: {
    title: 'Elemente',

    text: 'Text',
    number: 'Zahl',
    money: 'Geldbetrag',
    metric: 'Kennzahl',
    stat: 'Statistik',

    chart: 'Diagramm',
    barChart: 'Balkendiagramm',
    comparison: 'Vergleich',

    group: 'Gruppe',
    stack: 'Stapel',
    sequence: 'Sequenz',

    rectangle: 'Rechteck',
    circle: 'Kreis',
    line: 'Linie',
    arrow: 'Pfeil',
    bar: 'Balken',
    progress: 'Fortschritt',
    badge: 'Abzeichen',
    image: 'Bild',
    overlay: 'Überlagerung',
  },

  content: {
    text: 'Text',

    numberFrom: 'Von',
    numberTo: 'Bis',
    numberSuffix: 'Suffix',

    moneyAmount: 'Betrag',
    moneyCurrency: 'Währung',
    moneyCustom: 'Benutzerdefiniert',
    moneyCustomSuffix: 'Benutzerdefinierter Suffix',

    value: 'Wert',
    label: 'Beschriftung',
    detail: 'Detail',
    icon: 'Bild',
    image: 'Bild',
    direction: 'Richtung',

    values: 'Werte',
    xLabels: 'X-Achsen-Beschriftungen',
    yLabels: 'Y-Achsen-Beschriftungen',

    xAxisTitle: 'Titel der X-Achse',
    yAxisTitle: 'Titel der Y-Achse',

    labels: 'Beschriftungen',

    left: 'Links',
    right: 'Rechts',
    title: 'Titel',
    arrow: 'Pfeil',

    max: 'Maximum',
    fillDuration: 'Fülldauer (Sek.)',
  },

  direction: {
    up: 'Oben',
    down: 'Unten',
    neutral: 'Neutral',
  },

  placeholders: {
    chartLabels: 'Jan, Feb, Mär, Apr',
    chartXAxisTitle: 'Monat',
    chartYAxisTitle: 'Einnahmen, €',
    chartValues: '100, 120, 140, 160',
  },

  blocks: {
    text: {
      example: 'Beispieltext',
    },

    metric: {
      income: 'Einnahmen',
      incomeGrowth: 'Einnahmenwachstum',
      perMonth: 'Pro Monat',
    },

    stat: {
      incomeGrowth: 'Einnahmenwachstum',
      perMonth: 'Pro Monat',
    },

    comparison: {
      before: 'Vorher',
      after: 'Nachher',
    },

    badge: {
      important: 'Wichtig',
    },
  },

  chart: {
    months: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  },

  validation: {
    invalidValue: 'Ungültiger Wert',
    required: 'Pflichtfeld',
    minValue: 'Mindestwert',
    maxValue: 'Höchstwert',
  },

  errors: {
    saveFailed: 'Änderungen konnten nicht gespeichert werden.',
    projectOpenFailed: 'Projekt kann nicht geöffnet werden.',
    projectsLoadPartial: 'Einige Projekte konnten nicht geladen werden:',
    projectDataRenderFailed: 'Die Projektdaten konnten nicht dargestellt werden.',
    reloadEditor: 'Editor neu laden',
    backToDashboard: 'Zurück zur Projektübersicht',
  },

  contextMenu: {
    copy: 'Kopieren',
    duplicate: 'Duplizieren',
    delete: 'Löschen',
    moveForward: 'Nach vorne verschieben',
    moveBackward: 'Nach hinten verschieben',
    bringToFront: 'In den Vordergrund',
    sendToBack: 'In den Hintergrund',
    paste: 'Einfügen',
  },

  audio: {
    title: 'Audio',
    notLoaded: 'Audio nicht geladen',
    addRecording: 'Audioaufnahme hinzufügen',
    upload: 'Hochladen',
    volume: 'Lautstärke',
    enableSound: 'Ton einschalten',
    disableSound: 'Ton ausschalten',
    invalidFile: 'Wähle eine Audiodatei aus: WAV, MP3, M4A, AAC, OGG oder WebM.',
    metadataDecodeFailed: 'Audiodaten konnten nicht gelesen werden.',
  },

  sceneInspector: {
    scene: 'SZENE',
    name: 'Name',
    namePlaceholder: 'Szenenname',
    durationSeconds: 'Dauer, Sek.',
    position: 'Position',
    start: 'Start',
    end: 'Ende',
    blocks: 'Blocks',
    addContent: 'Add content',
    secondsShort: 'Sek.',
  },
};
