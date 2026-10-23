import type { TranslationKeys } from '../types';

export const zh: TranslationKeys = {
  common: {
    arrowUp: '↑',
    arrowRight: '→',

    yes: '是',
    no: '否',

    on: '开启',
    off: '关闭',

    none: '无',
    default: '默认',

    add: '添加',
    remove: '删除',
    cancel: '取消',
    apply: '应用',
    reset: '重置',
    close: '关闭',

    enabled: '已启用',
    disabled: '已禁用',

    upload: '上传',
    language: '语言',

    replace: '替换',
  },

  dashboard: {
    title: '项目',
    subtitle: '创建和管理你的竖屏视频项目。',
    newProject: '新建项目',
    newProjectDefault: '未命名项目',
    emptyTitle: '还没有项目',
    emptyText: '创建你的第一个项目，开始制作竖屏视频。',
    createFirst: '创建第一个项目',
    open: '打开',
    rename: '重命名',
    duplicate: '复制',
    delete: '删除',
    deleteConfirm: '删除这个项目？',
    updated: '更新于',
    templateTitle: '选择项目模板',
    templateSubtitle: '从空白画布或当前示例开始。',
    blankTemplate: '空白项目',
    blankTemplateDescription: '空白竖屏视频项目。',
    starterTemplate: '入门示例',
    starterTemplateDescription: '当前 WallCut 示例，包含现成场景。',
    createFromTemplate: '创建项目',
    cancel: '取消',
  },

  editor: {
    title: 'WallCut 编辑器',

    save: '保存',
    saved: '已保存',
    unsaved: '未保存',

    undo: '撤销',
    redo: '重做',

    inspector: '检查器',
    timeline: '时间轴',

    selectObject: '选择对象',
    selectObjectHint: '在视频中。',

    position: '位置',
    size: '大小',
    export: '导出',
    exportTitle: '导出项目',
    exportDescription: '选择当前项目版本的导出格式。',
    exportProject: 'JSON 项目',
    exportProjectDescription: '包含项目、时间线和音轨，可用于备份或迁移。',
    exportMp4: 'MP4 视频',
    exportMp4Description: '适用于竖屏视频平台的 H.264 视频。',
    exportWebm: 'WebM 视频',
    exportWebmDescription: '开放 WebM 格式视频。',
    exportGif: '动态 GIF',
    exportGifDescription: '无音频动画，文件可能较大。',
    exportPng: 'PNG 帧序列（ZIP）',
    exportPngDescription: '供后续编辑使用的图像序列。',
    exportCancel: '取消',
    exporting: '正在导出…',
    exportError: '导出失败。请检查浏览器是否支持本地渲染，然后重试。',
    exportServerMissing: '服务器尚未配置视频导出。无需服务器即可下载 JSON 项目。',
  },

  inspector: {
    content: '内容',
    animation: '动画',
    layer: '图层',
    appearance: '外观',
    transform: '变换',
    timing: '时间',

    positionX: 'X 位置',
    positionY: 'Y 位置',

    scale: '缩放',
    scaleX: 'X 缩放',
    scaleY: 'Y 缩放',

    rotation: '旋转',
    opacity: '不透明度',

    startFrame: '起始帧',
    duration: '持续时间',
    frameInfo: '时间以 30 FPS 的帧数计算。',

    zIndex: 'Z 索引',

    fontSize: '字体大小',
    fontFamily: '字体系列',
    fontWeight: '字体粗细',
    color: '颜色',
    backgroundColor: '背景',

    moveForward: '前移',
    moveBackward: '后移',
    bringToFront: '置于顶层',
    sendToBack: '置于底层',
    width: '宽度',
    height: '高度',
  },

  layer: {
    background: '背景',
    images: '图片',
    characters: '角色',
    text: '文本',
    shapes: '形状',
    other: '其他',
  },

  animation: {
    preset: '预设',
    custom: '自定义',

    enter: '进入',
    exit: '退出',

    duration: '持续时间',
    exitDuration: '退出持续时间',
    enterDuration: '进入持续时间',

    delay: '延迟',
    exitDelay: '退出延迟',

    intensity: '强度',

    none: '无',
    fade: '淡入淡出',
    slide: '滑动',
    slideUp: '向上滑动',
    slideDown: '向下滑动',
    slideLeft: '向左滑动',
    slideRight: '向右滑动',

    scale: '缩放',
    pop: '弹出',
    bounce: '弹跳',
    shake: '抖动',
    rotate: '旋转',

    presetMinimal: '简约',
    presetSmooth: '平滑',
    presetPop: '弹出',
    presetSlide: '滑动',
    presetDramatic: '戏剧性',
    presetAttention: '强调',
  },

  timeline: {
    video: '视频',
    text: '文本',
    shape: '形状',
    other: '其他',

    collapse: '折叠',
    expand: '展开',

    frame: '帧',
    frames: '帧',

    start: '开始',
    end: '结束',

    move: '移动',
    resize: '调整大小',
    scenes: '场景',
    scene: '场景',
    collapseScenes: '折叠场景',
    expandScenes: '展开场景',
    addScene: '添加场景',
    duplicateScene: '复制所选场景',
    deleteScene: '删除所选场景',
    increaseDuration: '增加持续时间',
    decreaseDuration: '减少持续时间',
  },

  library: {
    title: '元素',

    text: '文本',
    number: '数字',
    money: '金额',
    metric: '指标',
    stat: '统计',

    chart: '图表',
    barChart: '柱状图',
    comparison: '比较',

    group: '组',
    stack: '堆叠',
    sequence: '序列',

    rectangle: '矩形',
    circle: '圆形',
    line: '线条',
    arrow: '箭头',
    bar: '条形',
    progress: '进度',
    badge: '徽章',
    image: '图片',
    overlay: '叠加层',
  },

  content: {
    text: '文本',

    numberFrom: '从',
    numberTo: '到',
    numberSuffix: '后缀',

    moneyAmount: '金额',
    moneyCurrency: '货币',
    moneyCustom: '自定义',
    moneyCustomSuffix: '自定义后缀',

    value: '数值',
    label: '标签',
    detail: '详情',
    icon: '图片',
    image: '图片',
    direction: '方向',

    values: '数值',
    xLabels: 'X 标签',
    yLabels: 'Y 标签',

    xAxisTitle: 'X 轴标题',
    yAxisTitle: 'Y 轴标题',

    labels: '标签',

    left: '左侧',
    right: '右侧',
    title: '标题',
    arrow: '箭头',

    max: '最大值',
    fillDuration: '填充时长（秒）',
  },

  direction: {
    up: '向上',
    down: '向下',
    neutral: '中性',
  },

  placeholders: {
    chartLabels: '一月, 二月, 三月, 四月',
    chartXAxisTitle: '月份',
    chartYAxisTitle: '收入, ¥',
    chartValues: '100, 120, 140, 160',
  },

  blocks: {
    text: {
      example: '示例文本',
    },

    metric: {
      income: '收入',
      incomeGrowth: '收入增长',
      perMonth: '每月',
    },

    stat: {
      incomeGrowth: '收入增长',
      perMonth: '每月',
    },

    comparison: {
      before: '之前',
      after: '之后',
    },

    badge: {
      important: '重要',
    },
  },

  chart: {
    months: [
      '一月',
      '二月',
      '三月',
      '四月',
      '五月',
      '六月',
      '七月',
      '八月',
      '九月',
      '十月',
      '十一月',
      '十二月',
    ],
  },

  validation: {
    invalidValue: '无效值',
    required: '必填字段',
    minValue: '最小值',
    maxValue: '最大值',
  },

  errors: {
    saveFailed: '保存更改失败。',
    projectOpenFailed: '无法打开项目',
    projectsLoadPartial: '部分项目无法加载：',
    projectDataRenderFailed: '无法渲染项目数据。',
    reloadEditor: '重新加载编辑器',
    backToDashboard: '返回项目',
  },

  contextMenu: {
    copy: '复制',
    duplicate: '复制副本',
    delete: '删除',
    moveForward: '前移',
    moveBackward: '后移',
    bringToFront: '置于顶层',
    sendToBack: '置于底层',
    paste: '粘贴',
  },

  audio: {
    title: '音频',
    notLoaded: '未加载音频',
    addRecording: '添加音频录音',
    upload: '上传',
    volume: '音量',
    enableSound: '开启声音',
    disableSound: '关闭声音',
    invalidFile: '请选择音频文件：WAV、MP3、M4A、AAC、OGG 或 WebM。',
    metadataDecodeFailed: '无法读取音频元数据。',
  },

  sceneInspector: {
    scene: '场景',
    name: '名称',
    namePlaceholder: '场景名称',
    durationSeconds: '时长（秒）',
    position: '位置',
    start: '开始',
    end: '结束',
    blocks: '区块',
    addContent: '添加内容',
    secondsShort: '秒',
  },
};
