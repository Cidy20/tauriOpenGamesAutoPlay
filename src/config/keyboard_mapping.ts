// 键盘映射关系配置
export const NOTE_TO_KEY: Record<number, string> = {
  // 高音区 (1-7 及半音)
  72: 'q',    // 1
  73: 'shift+q',  // #1
  74: 'w',    // 2
  75: 'ctrl+e',   // b3
  76: 'e',    // 3
  77: 'r',    // 4
  78: 'shift+r',  // #4
  79: 't',    // 5
  80: 'shift+t',  // #5
  81: 'y',    // 6
  82: 'ctrl+u',   // b7
  83: 'u',    // 7
  
  // 中音区 (1-7 及半音)
  60: 'a',    // 1
  61: 'shift+a',  // #1
  62: 's',    // 2
  63: 'ctrl+d',   // b3
  64: 'd',    // 3
  65: 'f',    // 4
  66: 'shift+f',  // #4
  67: 'g',    // 5
  68: 'shift+g',  // #5
  69: 'h',    // 6
  70: 'ctrl+j',   // b7
  71: 'j',    // 7
  
  // 低音区 (1-7 及半音)
  48: 'z',    // 1
  49: 'shift+z',  // #1
  50: 'x',    // 2
  51: 'ctrl+c',   // b3
  52: 'c',    // 3
  53: 'v',    // 4
  54: 'shift+v',  // #4
  55: 'b',    // 5
  56: 'shift+b',  // #5
  57: 'n',    // 6
  58: 'ctrl+m',   // b7
  59: 'm',    // 7
};

// 控制键映射为组合键
export const CONTROL_KEYS: Record<string, string> = {
  'START_PAUSE': 'alt+-',     // Alt + 减号键
  'STOP': 'alt+=',           // Alt + 等号键
  'PREV_SONG': 'alt+up',     // Alt + 上箭头键
  'NEXT_SONG': 'alt+down'    // Alt + 下箭头键
};

// 按键状态跟踪
export interface KeyState {
  isPressed: boolean;
  note?: number;
}

// 创建默认的空白键映射（用于用户自定义配置）
export function createEmptyKeyMapping(): Record<number, string> {
  const emptyMapping: Record<number, string> = {};
  // 初始化48-83范围内的音符（覆盖小字组到小字二组）
  for (let note = 48; note <= 83; note++) {
    emptyMapping[note] = '';
  }
  return emptyMapping;
}

// 获取控制键的显示名称（用于UI展示）
export function getControlKeyDisplayName(action: string): string {
  const displayNames: Record<string, string> = {
    'START_PAUSE': '开始/暂停',
    'STOP': '停止',
    'PREV_SONG': '上一曲',
    'NEXT_SONG': '下一曲'
  };
  return displayNames[action] || action;
}