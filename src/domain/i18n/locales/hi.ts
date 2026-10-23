import type { TranslationKeys } from '../types';

export const hi: TranslationKeys = {
  common: {
    arrowUp: '↑',
    arrowRight: '→',

    yes: 'हाँ',
    no: 'नहीं',

    on: 'चालू',
    off: 'बंद',

    none: 'कोई नहीं',
    default: 'डिफ़ॉल्ट',

    add: 'जोड़ें',
    remove: 'हटाएँ',
    cancel: 'रद्द करें',
    apply: 'लागू करें',
    reset: 'रीसेट करें',
    close: 'बंद करें',

    enabled: 'सक्षम',
    disabled: 'अक्षम',

    upload: 'अपलोड करें',
    language: 'भाषा',

    replace: 'बदलें',
  },

  dashboard: {
    title: 'प्रोजेक्ट',
    subtitle: 'अपने वर्टिकल वीडियो प्रोजेक्ट बनाएं और प्रबंधित करें।',
    newProject: 'नया प्रोजेक्ट',
    newProjectDefault: 'बिना नाम का प्रोजेक्ट',
    emptyTitle: 'अभी कोई प्रोजेक्ट नहीं',
    emptyText: 'अपना पहला प्रोजेक्ट बनाएं और वर्टिकल वीडियो तैयार करना शुरू करें।',
    createFirst: 'पहला प्रोजेक्ट बनाएं',
    open: 'खोलें',
    rename: 'नाम बदलें',
    duplicate: 'डुप्लिकेट',
    delete: 'हटाएं',
    deleteConfirm: 'क्या यह प्रोजेक्ट हटाना है?',
    updated: 'अपडेट किया गया',
    templateTitle: 'प्रोजेक्ट टेम्पलेट चुनें',
    templateSubtitle: 'खाली Canvas या मौजूदा उदाहरण से शुरू करें।',
    blankTemplate: 'खाली प्रोजेक्ट',
    blankTemplateDescription: 'एक खाली वर्टिकल वीडियो प्रोजेक्ट।',
    starterTemplate: 'स्टार्टर उदाहरण',
    starterTemplateDescription: 'तैयार दृश्यों वाला मौजूदा WallCut उदाहरण।',
    createFromTemplate: 'प्रोजेक्ट बनाएँ',
    cancel: 'रद्द करें',
  },

  editor: {
    title: 'WallCut एडिटर',

    save: 'सहेजें',
    saved: 'सहेजा गया',
    unsaved: 'सहेजा नहीं गया',

    undo: 'पूर्ववत करें',
    redo: 'फिर से करें',

    inspector: 'इंस्पेक्टर',
    timeline: 'टाइमलाइन',

    selectObject: 'ऑब्जेक्ट चुनें',
    selectObjectHint: 'वीडियो पर।',

    position: 'स्थिति',
    size: 'आकार',
    export: 'निर्यात',
    exportTitle: 'प्रोजेक्ट निर्यात करें',
    exportDescription: 'वर्तमान प्रोजेक्ट संस्करण के लिए फ़ॉर्मैट चुनें।',
    exportProject: 'JSON प्रोजेक्ट',
    exportProjectDescription: 'बैकअप या स्थानांतरण के लिए प्रोजेक्ट, टाइमलाइन और ऑडियो ट्रैक।',
    exportMp4: 'MP4 वीडियो',
    exportMp4Description: 'वर्टिकल वीडियो प्लेटफ़ॉर्म के लिए H.264 वीडियो।',
    exportWebm: 'WebM वीडियो',
    exportWebmDescription: 'ओपन WebM फ़ॉर्मैट में वीडियो।',
    exportGif: 'एनिमेटेड GIF',
    exportGifDescription: 'बिना ऑडियो का एनीमेशन; फ़ाइल बड़ी हो सकती है।',
    exportPng: 'PNG फ़्रेम (ZIP)',
    exportPngDescription: 'आगे संपादन के लिए इमेज सीक्वेंस।',
    exportCancel: 'रद्द करें',
    exporting: 'निर्यात हो रहा है…',
    exportError: 'निर्यात विफल हुआ। ब्राउज़र में स्थानीय रेंडरिंग समर्थन जाँचें और फिर कोशिश करें।',
    exportServerMissing:
      'सर्वर पर वीडियो निर्यात कॉन्फ़िगर नहीं है। JSON प्रोजेक्ट बिना सर्वर डाउनलोड किया जा सकता है.',
  },

  inspector: {
    content: 'कंटेंट',
    animation: 'एनीमेशन',
    layer: 'लेयर',
    appearance: 'दिखावट',
    transform: 'ट्रांसफ़ॉर्म',
    timing: 'समय',

    positionX: 'स्थिति X',
    positionY: 'स्थिति Y',

    scale: 'स्केल',
    scaleX: 'स्केल X',
    scaleY: 'स्केल Y',

    rotation: 'रोटेशन',
    opacity: 'अपारदर्शिता',

    startFrame: 'प्रारंभिक फ़्रेम',
    duration: 'अवधि',
    frameInfo: 'समय 30 FPS पर फ़्रेम में मापा जाता है।',

    zIndex: 'Z-इंडेक्स',

    fontSize: 'फ़ॉन्ट आकार',
    fontFamily: 'फ़ॉन्ट परिवार',
    fontWeight: 'फ़ॉन्ट वज़न',
    color: 'रंग',
    backgroundColor: 'पृष्ठभूमि',

    moveForward: 'आगे',
    moveBackward: 'पीछे',
    bringToFront: 'सबसे आगे',
    sendToBack: 'सबसे पीछे',
    width: 'चौड़ाई',
    height: 'ऊँचाई',
  },

  layer: {
    background: 'पृष्ठभूमि',
    images: 'चित्र',
    characters: 'कैरेक्टर',
    text: 'टेक्स्ट',
    shapes: 'आकृतियाँ',
    other: 'अन्य',
  },

  animation: {
    preset: 'प्रीसेट',
    custom: 'कस्टम',

    enter: 'प्रवेश',
    exit: 'निकास',

    duration: 'अवधि',
    exitDuration: 'निकास अवधि',
    enterDuration: 'प्रवेश अवधि',

    delay: 'विलंब',
    exitDelay: 'निकास विलंब',

    intensity: 'तीव्रता',

    none: 'कोई नहीं',
    fade: 'फ़ेड',
    slide: 'स्लाइड',
    slideUp: 'ऊपर स्लाइड',
    slideDown: 'नीचे स्लाइड',
    slideLeft: 'बाएँ स्लाइड',
    slideRight: 'दाएँ स्लाइड',

    scale: 'स्केल',
    pop: 'पॉप',
    bounce: 'बाउंस',
    shake: 'शेक',
    rotate: 'रोटेशन',

    presetMinimal: 'मिनिमल',
    presetSmooth: 'स्मूथ',
    presetPop: 'पॉप',
    presetSlide: 'स्लाइड',
    presetDramatic: 'ड्रामैटिक',
    presetAttention: 'अटेंशन',
  },

  timeline: {
    video: 'वीडियो',
    text: 'टेक्स्ट',
    shape: 'आकृतियाँ',
    other: 'अन्य',

    collapse: 'समेटें',
    expand: 'विस्तार करें',

    frame: 'फ़्रेम',
    frames: 'फ़्रेम',

    start: 'शुरुआत',
    end: 'अंत',

    move: 'स्थानांतरित करें',
    resize: 'आकार बदलें',
    scenes: 'दृश्य',
    scene: 'दृश्य',
    collapseScenes: 'दृश्यों को समेटें',
    expandScenes: 'दृश्यों को विस्तृत करें',
    addScene: 'दृश्य जोड़ें',
    duplicateScene: 'चयनित दृश्य की प्रतिलिपि बनाएँ',
    deleteScene: 'चयनित दृश्य हटाएँ',
    increaseDuration: 'अवधि बढ़ाएँ',
    decreaseDuration: 'अवधि घटाएँ',
  },

  library: {
    title: 'एलिमेंट्स',

    text: 'टेक्स्ट',
    number: 'संख्या',
    money: 'पैसा',
    metric: 'मेट्रिक',
    stat: 'स्टैट',

    chart: 'चार्ट',
    barChart: 'बार चार्ट',
    comparison: 'तुलना',

    group: 'ग्रुप',
    stack: 'स्टैक',
    sequence: 'सीक्वेंस',

    rectangle: 'आयत',
    circle: 'वृत्त',
    line: 'रेखा',
    arrow: 'तीर',
    bar: 'बार',
    progress: 'प्रगति',
    badge: 'बैज',
    image: 'चित्र',
    overlay: 'ओवरले',
  },

  content: {
    text: 'टेक्स्ट',

    numberFrom: 'से',
    numberTo: 'तक',
    numberSuffix: 'प्रत्यय',

    moneyAmount: 'राशि',
    moneyCurrency: 'मुद्रा',
    moneyCustom: 'कस्टम',
    moneyCustomSuffix: 'कस्टम प्रत्यय',

    value: 'मान',
    label: 'लेबल',
    detail: 'विवरण',
    icon: 'चित्र',
    image: 'चित्र',
    direction: 'दिशा',

    values: 'मान',
    xLabels: 'X लेबल',
    yLabels: 'Y लेबल',

    xAxisTitle: 'X अक्ष शीर्षक',
    yAxisTitle: 'Y अक्ष शीर्षक',

    labels: 'लेबल',

    left: 'बायाँ',
    right: 'दायाँ',
    title: 'शीर्षक',
    arrow: 'तीर',

    max: 'अधिकतम',
    fillDuration: 'भरने की अवधि (सेकंड)',
  },

  direction: {
    up: 'ऊपर',
    down: 'नीचे',
    neutral: 'तटस्थ',
  },

  placeholders: {
    chartLabels: 'जन, फ़र, मार्च, अप्रैल',
    chartXAxisTitle: 'महीना',
    chartYAxisTitle: 'आय, ₹',
    chartValues: '100, 120, 140, 160',
  },

  blocks: {
    text: {
      example: 'उदाहरण टेक्स्ट',
    },

    metric: {
      income: 'आय',
      incomeGrowth: 'आय वृद्धि',
      perMonth: 'प्रति माह',
    },

    stat: {
      incomeGrowth: 'आय वृद्धि',
      perMonth: 'प्रति माह',
    },

    comparison: {
      before: 'पहले',
      after: 'बाद में',
    },

    badge: {
      important: 'महत्वपूर्ण',
    },
  },

  chart: {
    months: [
      'जन',
      'फ़र',
      'मार्च',
      'अप्रैल',
      'मई',
      'जून',
      'जुलाई',
      'अगस्त',
      'सितंबर',
      'अक्टूबर',
      'नवंबर',
      'दिसंबर',
    ],
  },

  validation: {
    invalidValue: 'अमान्य मान',
    required: 'आवश्यक फ़ील्ड',
    minValue: 'न्यूनतम मान',
    maxValue: 'अधिकतम मान',
  },

  errors: {
    saveFailed: 'परिवर्तन सहेजे नहीं जा सके।',
    projectOpenFailed: 'प्रोजेक्ट नहीं खोला जा सका',
    projectsLoadPartial: 'कुछ प्रोजेक्ट लोड नहीं हो सके:',
    projectDataRenderFailed: 'प्रोजेक्ट डेटा रेंडर नहीं किया जा सका।',
    reloadEditor: 'एडिटर फिर से लोड करें',
    backToDashboard: 'प्रोजेक्ट्स पर वापस जाएँ',
  },

  contextMenu: {
    copy: 'कॉपी करें',
    duplicate: 'डुप्लिकेट करें',
    delete: 'हटाएँ',
    moveForward: 'आगे ले जाएँ',
    moveBackward: 'पीछे ले जाएँ',
    bringToFront: 'सबसे आगे लाएँ',
    sendToBack: 'सबसे पीछे भेजें',
    paste: 'पेस्ट करें',
  },

  audio: {
    title: 'ऑडियो',
    notLoaded: 'ऑडियो लोड नहीं है',
    addRecording: 'ऑडियो रिकॉर्डिंग जोड़ें',
    upload: 'अपलोड करें',
    volume: 'वॉल्यूम',
    enableSound: 'ध्वनि चालू करें',
    disableSound: 'ध्वनि बंद करें',
    invalidFile: 'ऑडियो फ़ाइल चुनें: WAV, MP3, M4A, AAC, OGG या WebM।',
    metadataDecodeFailed: 'ऑडियो मेटाडेटा पढ़ा नहीं जा सका।',
  },

  sceneInspector: {
    scene: 'सीन',
    name: 'नाम',
    namePlaceholder: 'सीन का नाम',
    durationSeconds: 'अवधि, सेकंड',
    position: 'स्थिति',
    start: 'शुरुआत',
    end: 'अंत',
    blocks: 'ब्लॉक्स',
    addContent: 'सामग्री जोड़ें',
    secondsShort: 'सेकंड',
  },
};
