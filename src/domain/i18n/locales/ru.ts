import type { TranslationKeys } from '../types';

export const ru: TranslationKeys = {
  common: {
    arrowUp: '↑',
    arrowRight: '→',

    yes: 'Да',
    no: 'Нет',

    on: 'Вкл.',
    off: 'Выкл.',

    none: 'Нет',
    default: 'По умолчанию',

    add: 'Добавить',
    remove: 'Удалить',
    cancel: 'Отмена',
    apply: 'Применить',
    reset: 'Сбросить',
    close: 'Закрыть',

    enabled: 'Включено',
    disabled: 'Выключено',

    upload: 'Загрузить',
    language: 'Язык',

    replace: 'Заменить',
  },

  dashboard: {
    title: 'Проекты',
    subtitle: 'Создавайте и управляйте проектами вертикальных видео.',
    newProject: 'Новый проект',
    newProjectDefault: 'Без названия',
    emptyTitle: 'Пока нет проектов',
    emptyText: 'Создайте первый проект и начните собирать вертикальное видео.',
    createFirst: 'Создать первый проект',
    open: 'Открыть',
    rename: 'Переименовать',
    duplicate: 'Дублировать',
    delete: 'Удалить',
    deleteConfirm: 'Удалить этот проект?',
    updated: 'Изменён',
    templateTitle: 'Выберите шаблон проекта',
    templateSubtitle: 'Начните с пустого Canvas или с текущего примера.',
    blankTemplate: 'Пустой проект',
    blankTemplateDescription: 'Пустой проект для создания вертикального видео с нуля.',
    starterTemplate: 'Стартовый пример',
    starterTemplateDescription: 'Текущий пример WallCut с готовыми сценами.',
    createFromTemplate: 'Создать проект',
    cancel: 'Отмена',
  },

  editor: {
    title: 'Редактор WallCut',

    save: 'Сохранить',
    saved: 'Сохранено',
    unsaved: 'Не сохранено',

    undo: 'Отменить',
    redo: 'Повторить',

    inspector: 'Инспектор',
    timeline: 'Таймлайн',

    selectObject: 'Выберите объект',
    selectObjectHint: 'на видео.',

    position: 'Позиция',
    size: 'Размер',
    export: 'Экспорт',
    exportTitle: 'Экспорт проекта',
    exportDescription: 'Выберите формат для экспорта текущей версии проекта.',
    exportProject: 'Проект JSON',
    exportProjectDescription: 'Проект, таймлайн и аудиодорожки для переноса или резервной копии.',
    exportMp4: 'Видео MP4',
    exportMp4Description: 'H.264-видео для платформ вертикальных видео.',
    exportWebm: 'Видео WebM',
    exportWebmDescription: 'Видео в открытом формате WebM.',
    exportGif: 'Анимированный GIF',
    exportGifDescription: 'Анимация без звука, большой размер файла.',
    exportPng: 'Кадры PNG (ZIP)',
    exportPngDescription: 'Последовательность изображений для дальнейшего монтажа.',
    exportCancel: 'Отмена',
    exporting: 'Экспорт…',
    exportError:
      'Не удалось экспортировать. Проверьте поддержку браузером локального рендеринга и попробуйте ещё раз.',
    exportServerMissing:
      'Экспорт видео не настроен на сервере. Проект JSON можно скачать без сервера.',
  },

  inspector: {
    content: 'Содержимое',
    animation: 'Анимация',
    layer: 'Слой',
    appearance: 'Внешний вид',
    transform: 'Трансформация',
    timing: 'Время',

    positionX: 'Позиция X',
    positionY: 'Позиция Y',

    scale: 'Масштаб',
    scaleX: 'Масштаб X',
    scaleY: 'Масштаб Y',

    rotation: 'Поворот',
    opacity: 'Прозрачность',

    startFrame: 'Начальный кадр',
    duration: 'Длительность',
    frameInfo: 'Время указано в кадрах при 30 FPS.',

    zIndex: 'Z-индекс',

    fontSize: 'Размер шрифта',
    fontFamily: 'Семейство шрифта',
    fontWeight: 'Начертание',
    color: 'Цвет',
    backgroundColor: 'Фон',

    moveForward: 'Вперёд',
    moveBackward: 'Назад',
    bringToFront: 'На передний план',
    sendToBack: 'На задний план',
    width: 'Ширина',
    height: 'Высота',
  },

  layer: {
    background: 'Фон',
    images: 'Изображения',
    characters: 'Персонажи',
    text: 'Текст',
    shapes: 'Фигуры',
    other: 'Другое',
  },

  animation: {
    preset: 'Пресет',
    custom: 'Пользовательская',

    enter: 'Вход',
    exit: 'Выход',

    duration: 'Длительность',
    exitDuration: 'Длительность выхода',
    enterDuration: 'Длительность входа',

    delay: 'Задержка',
    exitDelay: 'Задержка выхода',

    intensity: 'Интенсивность',

    none: 'Нет',
    fade: 'Появление',
    slide: 'Скольжение',
    slideUp: 'Скольжение вверх',
    slideDown: 'Скольжение вниз',
    slideLeft: 'Скольжение влево',
    slideRight: 'Скольжение вправо',

    scale: 'Масштабирование',
    pop: 'Всплытие',
    bounce: 'Отскок',
    shake: 'Тряска',
    rotate: 'Поворот',

    presetMinimal: 'Минимальный',
    presetSmooth: 'Плавный',
    presetPop: 'Всплытие',
    presetSlide: 'Скольжение',
    presetDramatic: 'Драматичный',
    presetAttention: 'Акцент',
  },

  timeline: {
    video: 'Видео',
    text: 'Текст',
    shape: 'Фигуры',
    other: 'Другое',

    collapse: 'Свернуть',
    expand: 'Развернуть',

    frame: 'Кадр',
    frames: 'Кадры',

    start: 'Начало',
    end: 'Конец',

    move: 'Переместить',
    resize: 'Изменить размер',
    scenes: 'Сцены',
    scene: 'Сцена',
    collapseScenes: 'Свернуть сцены',
    expandScenes: 'Развернуть сцены',
    addScene: 'Добавить сцену',
    duplicateScene: 'Дублировать выбранную сцену',
    deleteScene: 'Удалить выбранную сцену',
    increaseDuration: 'Увеличить длительность',
    decreaseDuration: 'Уменьшить длительность',
  },

  library: {
    title: 'Элементы',

    text: 'Текст',
    number: 'Число',
    money: 'Деньги',
    metric: 'Метрика',
    stat: 'Статистика',

    chart: 'График',
    barChart: 'Столбчатый график',
    comparison: 'Сравнение',

    group: 'Группа',
    stack: 'Стопка',
    sequence: 'Последовательность',

    rectangle: 'Прямоугольник',
    circle: 'Круг',
    line: 'Линия',
    arrow: 'Стрелка',
    bar: 'Полоса',
    progress: 'Прогресс',
    badge: 'Бейдж',
    image: 'Картинка',
    overlay: 'Оверлей',
  },

  content: {
    text: 'Текст',

    numberFrom: 'От',
    numberTo: 'До',
    numberSuffix: 'Суффикс',

    moneyAmount: 'Сумма',
    moneyCurrency: 'Валюта',
    moneyCustom: 'Пользовательская',
    moneyCustomSuffix: 'Суффикс',

    value: 'Значение',
    label: 'Подпись',
    detail: 'Детали',
    icon: 'Картинка',
    image: 'Картинка',
    direction: 'Направление',

    values: 'Значения',
    xLabels: 'Подписи X',
    yLabels: 'Подписи Y',

    xAxisTitle: 'Название оси X',
    yAxisTitle: 'Название оси Y',

    labels: 'Подписи',

    left: 'Левая часть',
    right: 'Правая часть',
    title: 'Заголовок',
    arrow: 'Стрелка',

    max: 'Максимум',
    fillDuration: 'Время заполнения (сек.)',
  },

  direction: {
    up: 'Вверх',
    down: 'Вниз',
    neutral: 'Нейтральное',
  },

  placeholders: {
    chartLabels: 'Янв, Фев, Мар, Апр',
    chartXAxisTitle: 'Месяц',
    chartYAxisTitle: 'Заработок, ₽',
    chartValues: '100, 120, 140, 160',
  },

  blocks: {
    text: {
      example: 'Пример текста',
    },

    metric: {
      income: 'Доход',
      incomeGrowth: 'Рост дохода',
      perMonth: 'В месяц',
    },

    stat: {
      incomeGrowth: 'Рост дохода',
      perMonth: 'В месяц',
    },

    comparison: {
      before: 'До',
      after: 'После',
    },

    badge: {
      important: 'Важно',
    },
  },

  chart: {
    months: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  },

  validation: {
    invalidValue: 'Некорректное значение',
    required: 'Обязательное поле',
    minValue: 'Минимальное значение',
    maxValue: 'Максимальное значение',
  },

  errors: {
    saveFailed: 'Не удалось сохранить изменения.',
    projectOpenFailed: 'Не удалось открыть проект',
    projectsLoadPartial: 'Не удалось загрузить некоторые проекты:',
    projectDataRenderFailed: 'Не удалось отобразить данные проекта.',
    reloadEditor: 'Перезагрузить редактор',
    backToDashboard: 'Вернуться к проектам',
  },

  contextMenu: {
    copy: 'Копировать',
    duplicate: 'Дублировать',
    delete: 'Удалить',
    moveForward: 'Переместить вперёд',
    moveBackward: 'Переместить назад',
    bringToFront: 'На передний план',
    sendToBack: 'На задний план',
    paste: 'Вставить',
  },

  audio: {
    title: 'Аудио',
    notLoaded: 'Аудио не загружено',
    addRecording: 'Добавить аудиозапись',
    upload: 'Загрузить',
    volume: 'Громкость',
    enableSound: 'Включить звук',
    disableSound: 'Отключить звук',
    invalidFile: 'Выбери аудиофайл: WAV, MP3, M4A, AAC, OGG или WebM.',
    metadataDecodeFailed: 'Не удалось прочитать метаданные аудио.',
  },

  sceneInspector: {
    scene: 'СЦЕНА',
    name: 'Имя',
    namePlaceholder: 'Название сцены',
    durationSeconds: 'Длительность, сек',
    position: 'Позиция',
    start: 'Начало',
    end: 'Конец',
    blocks: 'Блоков',
    addContent: 'Добавить содержимое',
    secondsShort: 'сек',
  },
};
