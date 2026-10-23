import type { TranslationKeys } from '../types';

export const it: TranslationKeys = {
  common: {
    arrowUp: '↑',
    arrowRight: '→',

    yes: 'Sì',
    no: 'No',

    on: 'Attivo',
    off: 'Disattivo',

    none: 'Nessuno',
    default: 'Predefinito',

    add: 'Aggiungi',
    remove: 'Rimuovi',
    cancel: 'Annulla',
    apply: 'Applica',
    reset: 'Reimposta',
    close: 'Chiudi',

    enabled: 'Abilitato',
    disabled: 'Disabilitato',

    upload: 'Carica',
    language: 'Lingua',

    replace: 'Sostituisci',
  },

  dashboard: {
    title: 'Progetti',
    subtitle: 'Crea e gestisci i tuoi progetti di video verticali.',
    newProject: 'Nuovo progetto',
    newProjectDefault: 'Progetto senza titolo',
    emptyTitle: 'Nessun progetto',
    emptyText: 'Crea il tuo primo progetto e inizia a creare un video verticale.',
    createFirst: 'Crea il primo progetto',
    open: 'Apri',
    rename: 'Rinomina',
    duplicate: 'Duplica',
    delete: 'Elimina',
    deleteConfirm: 'Eliminare questo progetto?',
    updated: 'Aggiornato',
    templateTitle: 'Scegli un modello di progetto',
    templateSubtitle: 'Inizia da una tela vuota o dall’esempio attuale.',
    blankTemplate: 'Progetto vuoto',
    blankTemplateDescription: 'Un progetto vuoto per video verticali.',
    starterTemplate: 'Esempio iniziale',
    starterTemplateDescription: 'L’esempio attuale di WallCut con scene già pronte.',
    createFromTemplate: 'Crea progetto',
    cancel: 'Annulla',
  },

  editor: {
    title: 'Editor di WallCut',

    save: 'Salva',
    saved: 'Salvato',
    unsaved: 'Non salvato',

    undo: 'Annulla',
    redo: 'Ripeti',

    inspector: 'Ispettore',
    timeline: 'Timeline',

    selectObject: 'Seleziona un oggetto',
    selectObjectHint: 'nel video.',

    position: 'Posizione',
    size: 'Dimensione',
    export: 'Esporta',
    exportTitle: 'Esporta progetto',
    exportDescription: 'Scegli un formato per la versione corrente del progetto.',
    exportProject: 'Progetto JSON',
    exportProjectDescription: 'Progetto, timeline e tracce audio per backup o trasferimento.',
    exportMp4: 'Video MP4',
    exportMp4Description: 'Video H.264 per piattaforme di video verticali.',
    exportWebm: 'Video WebM',
    exportWebmDescription: 'Video nel formato WebM aperto.',
    exportGif: 'GIF animata',
    exportGifDescription: 'Animazione senza audio; il file può essere grande.',
    exportPng: 'Fotogrammi PNG (ZIP)',
    exportPngDescription: 'Sequenza di immagini per ulteriori modifiche.',
    exportCancel: 'Annulla',
    exporting: 'Esportazione…',
    exportError: 'Esportazione non riuscita. Verifica il supporto del browser e riprova.',
    exportServerMissing:
      "L'esportazione video server non è configurata. Il JSON può essere scaricato senza server.",
  },

  inspector: {
    content: 'Contenuto',
    animation: 'Animazione',
    layer: 'Livello',
    appearance: 'Aspetto',
    transform: 'Trasformazione',
    timing: 'Temporizzazione',

    positionX: 'Posizione X',
    positionY: 'Posizione Y',

    scale: 'Scala',
    scaleX: 'Scala X',
    scaleY: 'Scala Y',

    rotation: 'Rotazione',
    opacity: 'Opacità',

    startFrame: 'Fotogramma iniziale',
    duration: 'Durata',
    frameInfo: 'La temporizzazione è misurata in fotogrammi a 30 FPS.',

    zIndex: 'Indice Z',

    fontSize: 'Dimensione carattere',
    fontFamily: 'Famiglia carattere',
    fontWeight: 'Spessore carattere',
    color: 'Colore',
    backgroundColor: 'Sfondo',

    moveForward: 'Avanti',
    moveBackward: 'Indietro',
    bringToFront: 'Porta in primo piano',
    sendToBack: 'Porta indietro',
    width: 'Larghezza',
    height: 'Altezza',
  },

  layer: {
    background: 'Sfondo',
    images: 'Immagini',
    characters: 'Personaggi',
    text: 'Testo',
    shapes: 'Forme',
    other: 'Altro',
  },

  animation: {
    preset: 'Preimpostazione',
    custom: 'Personalizzata',

    enter: 'Entrata',
    exit: 'Uscita',

    duration: 'Durata',
    exitDuration: 'Durata uscita',
    enterDuration: 'Durata entrata',

    delay: 'Ritardo',
    exitDelay: 'Ritardo uscita',

    intensity: 'Intensità',

    none: 'Nessuno',
    fade: 'Dissolvenza',
    slide: 'Scorrimento',
    slideUp: 'Scorri in alto',
    slideDown: 'Scorri in basso',
    slideLeft: 'Scorri a sinistra',
    slideRight: 'Scorri a destra',

    scale: 'Scala',
    pop: 'Pop',
    bounce: 'Rimbalzo',
    shake: 'Scuotimento',
    rotate: 'Rotazione',

    presetMinimal: 'Minimale',
    presetSmooth: 'Morbido',
    presetPop: 'Pop',
    presetSlide: 'Scorrimento',
    presetDramatic: 'Drammatico',
    presetAttention: 'Attenzione',
  },

  timeline: {
    video: 'Video',
    text: 'Testo',
    shape: 'Forme',
    other: 'Altro',

    collapse: 'Comprimi',
    expand: 'Espandi',

    frame: 'Fotogramma',
    frames: 'Fotogrammi',

    start: 'Inizio',
    end: 'Fine',

    move: 'Sposta',
    resize: 'Ridimensiona',
    scenes: 'Scena',
    scene: 'Scena',
    collapseScenes: 'Comprimi scene',
    expandScenes: 'Espandi scene',
    addScene: 'Aggiungi scena',
    duplicateScene: 'Duplica la scena selezionata',
    deleteScene: 'Elimina la scena selezionata',
    increaseDuration: 'Aumenta durata',
    decreaseDuration: 'Riduci durata',
  },

  library: {
    title: 'Elementi',

    text: 'Testo',
    number: 'Numero',
    money: 'Denaro',
    metric: 'Metrica',
    stat: 'Statistica',

    chart: 'Grafico',
    barChart: 'Grafico a barre',
    comparison: 'Confronto',

    group: 'Gruppo',
    stack: 'Pila',
    sequence: 'Sequenza',

    rectangle: 'Rettangolo',
    circle: 'Cerchio',
    line: 'Linea',
    arrow: 'Freccia',
    bar: 'Barra',
    progress: 'Progresso',
    badge: 'Badge',
    image: 'Immagine',
    overlay: 'Sovrapposizione',
  },

  content: {
    text: 'Testo',

    numberFrom: 'Da',
    numberTo: 'A',
    numberSuffix: 'Suffisso numero',

    moneyAmount: 'Importo',
    moneyCurrency: 'Valuta',
    moneyCustom: 'Personalizzata',
    moneyCustomSuffix: 'Suffisso personalizzato',

    value: 'Valore',
    label: 'Etichetta',
    detail: 'Dettaglio',
    icon: 'Immagine',
    image: 'Immagine',
    direction: 'Direzione',

    values: 'Valori',
    xLabels: 'Etichette X',
    yLabels: 'Etichette Y',

    xAxisTitle: 'Titolo asse X',
    yAxisTitle: 'Titolo asse Y',

    labels: 'Etichette',

    left: 'Sinistra',
    right: 'Destra',
    title: 'Titolo',
    arrow: 'Freccia',

    max: 'Massimo',
    fillDuration: 'Durata riempimento (sec.)',
  },

  direction: {
    up: 'Su',
    down: 'Giù',
    neutral: 'Neutrale',
  },

  placeholders: {
    chartLabels: 'Gen, Feb, Mar, Apr',
    chartXAxisTitle: 'Mese',
    chartYAxisTitle: 'Entrate, €',
    chartValues: '100, 120, 140, 160',
  },

  blocks: {
    text: {
      example: 'Testo di esempio',
    },

    metric: {
      income: 'Entrate',
      incomeGrowth: 'Crescita delle entrate',
      perMonth: 'Al mese',
    },

    stat: {
      incomeGrowth: 'Crescita delle entrate',
      perMonth: 'Al mese',
    },

    comparison: {
      before: 'Prima',
      after: 'Dopo',
    },

    badge: {
      important: 'Importante',
    },
  },

  chart: {
    months: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
  },

  validation: {
    invalidValue: 'Valore non valido',
    required: 'Campo obbligatorio',
    minValue: 'Valore minimo',
    maxValue: 'Valore massimo',
  },

  errors: {
    saveFailed: 'Impossibile salvare le modifiche.',
    projectOpenFailed: 'Impossibile aprire il progetto',
    projectsLoadPartial: 'Alcuni progetti non hanno potuto essere caricati:',
    projectDataRenderFailed: 'I dati del progetto non possono essere visualizzati.',
    reloadEditor: 'Ricarica editor',
    backToDashboard: 'Torna ai progetti',
  },

  contextMenu: {
    copy: 'Copia',
    duplicate: 'Duplica',
    delete: 'Elimina',
    moveForward: 'Sposta avanti',
    moveBackward: 'Sposta indietro',
    bringToFront: 'Porta in primo piano',
    sendToBack: 'Porta indietro',
    paste: 'Incolla',
  },

  audio: {
    title: 'Audio',
    notLoaded: 'Audio non caricato',
    addRecording: 'Aggiungi registrazione audio',
    upload: 'Carica',
    volume: 'Volume',
    enableSound: 'Attiva audio',
    disableSound: 'Disattiva audio',
    invalidFile: 'Seleziona un file audio: WAV, MP3, M4A, AAC, OGG o WebM.',
    metadataDecodeFailed: 'Impossibile leggere i metadati audio.',
  },

  sceneInspector: {
    scene: 'SCENA',
    name: 'Nome',
    namePlaceholder: 'Nome scena',
    durationSeconds: 'Durata, sec',
    position: 'Posizione',
    start: 'Inizio',
    end: 'Fine',
    blocks: 'Blocchi',
    addContent: 'Aggiungi contenuto',
    secondsShort: 'sec',
  },
};
