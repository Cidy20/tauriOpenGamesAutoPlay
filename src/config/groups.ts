// 音符基础配置
// 定义音符名称
export const NOTE_NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];

// MIDI note numbers: A₂=21, c¹=60 (中央C), c⁵=108
// 按照标准钢琴音域定义音组 (21..108)
export const GROUPS: Record<string, [number, number]> = {
  "大字二组 (A₂-B₂)": [21, 23],
  "大字一组 (C₁-B₁)": [24, 35],
  "大字组 (C-B)": [36, 47],
  "小字组 (c-b)": [48, 59],
  "小字一组 (c¹-b¹)": [60, 71],
  "小字二组 (c²-b²)": [72, 83],
  "小字三组 (c³-b³)": [84, 95],
  "小字四组 (c⁴-b⁴)": [96, 107],
  "小字五组 (c⁵)": [108, 108],
};

export const ORDERED_GROUP_NAMES: string[] = Object.keys(GROUPS);

// 预生成88个钢琴音符的名称映射
export const NOTE_NAME_MAP: Record<number, string> = {};

// 初始化音符名称映射
for (let noteNumber = 21; noteNumber <= 108; noteNumber++) {
  // 获取音符名（不包含八度）
  const noteIndex = noteNumber % 12;
  let noteName = NOTE_NAMES[noteIndex];
  let octaveSymbol = '';

  // 确定八度符号和音符大小写
  if (noteNumber >= 60) {
    // 小字一组及以上（使用小写字母）
    if (60 <= noteNumber && noteNumber <= 71) {
      octaveSymbol = '¹';
    } else if (72 <= noteNumber && noteNumber <= 83) {
      octaveSymbol = '²';
    } else if (84 <= noteNumber && noteNumber <= 95) {
      octaveSymbol = '³';
    } else if (96 <= noteNumber && noteNumber <= 107) {
      octaveSymbol = '⁴';
    } else {
      octaveSymbol = '⁵';
    }
  } else if (noteNumber >= 48) {
    // 小字组 (48-59)
    octaveSymbol = '';
  } else if (noteNumber >= 36) {
    // 大字组 (36-47)
    noteName = noteName.toUpperCase();
    octaveSymbol = '';
  } else if (noteNumber >= 24) {
    // 大字一组 (24-35)
    noteName = noteName.toUpperCase();
    octaveSymbol = '₁';
  } else {
    // 大字二组 (21-23)
    noteName = noteName.toUpperCase();
    octaveSymbol = '₂';
  }

  // 组合音符名称和八度
  const fullNoteName = `${noteName}${octaveSymbol}`;
  NOTE_NAME_MAP[noteNumber] = fullNoteName;
}

export function groupForNote(note: number): string {
  /*
   * 根据音符数字获取所属分组
   */
  for (const [name, [lo, hi]] of Object.entries(GROUPS)) {
    if (lo <= note && note <= hi) {
      return name;
    }
  }
  return "未知";
}

export function getNoteName(note: number): string {
  /*
   * 根据音符数字获取标准钢琴音符名称,并添加简谱前缀
   * 例如:60 为 1c¹,61 为 1c¹#,62 为 2d¹,53 为 4f
   */
  // 检查音符是否在有效范围内
  if (21 <= note && note <= 108) {
    const noteName = NOTE_NAME_MAP[note] || String(note);

    // 添加简谱数字前缀
    const noteIndex = note % 12;
    // C=1, C#=1, D=2, D#=2, E=3, F=4, F#=4, G=5, G#=5, A=6, A#=6, B=7
    const solfege = [1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6, 7][noteIndex];

    return `${solfege}${noteName}`;
  }
  return String(note);
}

export interface NoteEvent {
  note?: number;
  [key: string]: any;
}

export function filterNotesByGroups(notes: NoteEvent[], selectedGroups: string[]): NoteEvent[] {
  if (!selectedGroups || selectedGroups.length === 0) {
    return notes;
  }

  const ranges = selectedGroups
    .filter(name => name in GROUPS)
    .map(name => GROUPS[name]);

  if (ranges.length === 0) {
    return notes;
  }

  return notes.filter(ev => {
    if (!ev.note) return false;
    return ranges.some(([lo, hi]) => lo <= ev.note! && ev.note! <= hi);
  });
}
