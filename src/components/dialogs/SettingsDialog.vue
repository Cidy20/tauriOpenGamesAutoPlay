<script setup lang="ts">
import { ref, reactive, computed, inject, watch } from "vue";
import Dialog from "../common/Dialog.vue";
import themeConfig from "../../config/theme.json";
import { info } from '@tauri-apps/plugin-log';

// 从父组件注入主题相关方法和状态
const updateTheme = inject<(themeName: string) => Promise<void>>('updateTheme');
const currentTheme = inject<import('vue').Ref<string>>('currentTheme');

interface SettingsDialogProps {
  visible: boolean;
}

const props = defineProps<SettingsDialogProps>();
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "settingsSaved", settings: any): void;
}>();

// 当前激活的标签页
const activeTab = ref("keys");

// 按键设置
const keySettings = reactive({
  minNote: 48,
  maxNote: 83,
  blackKeyMode: "support_black_key",
  noteToKey: {} as Record<number, string>
});

// 快捷键设置
const shortcuts = reactive({
  START_PAUSE: "alt+-",
  STOP: "alt+=",
  PREV_SONG: "alt+up",
  NEXT_SONG: "alt+down"
});

// 主题设置
const themeSettings = reactive({
  currentTheme: currentTheme?.value || "default"
});

// 主题选项
const themeOptions = computed(() => {
  return themeConfig.theme.map(theme => ({
    value: theme.name,
    label: theme.name === 'default' ? '默认' : theme.name === 'dark' ? '黑夜' : '少女粉'
  }));
});

// 预设配置选项
const presetConfigs = [
  { id: "default", name: "默认配置", minNote: 48, maxNote: 83 },
  { id: "basic", name: "基础模式", minNote: 40, maxNote: 87 },
  { id: "advanced", name: "高级模式", minNote: 0, maxNote: 127 }
];

// 黑键模式选项
const blackKeyModes = [
  { value: "none", label: "无黑键" },
  { value: "all", label: "全部黑键" },
  { value: "selective", label: "选择性黑键" }
];

// 快捷键修饰键选项
const modifierOptions = [
  { value: "", label: "无" },
  { value: "ctrl", label: "Ctrl" },
  { value: "alt", label: "Alt" },
  { value: "shift", label: "Shift" }
];

// 保存设置
const saveSettings = async () => {
  const settings = {
    keySettings: { ...keySettings },
    shortcuts: { ...shortcuts },
    themeSettings: { ...themeSettings }
  };
  
  // 更新主题
  if (updateTheme && themeSettings.currentTheme !== currentTheme?.value) {
    await updateTheme(themeSettings.currentTheme);
  }
  
  emit("settingsSaved", settings);
  emit("update:visible", false);
};

// 取消设置
const cancelSettings = () => {
  // 重置到初始状态
  resetSettings();
  emit("update:visible", false);
};

// 重置设置
const resetSettings = () => {
  // 重置为默认值
  keySettings.minNote = 48;
  keySettings.maxNote = 83;
  keySettings.blackKeyMode = "support_black_key";
  keySettings.noteToKey = {};
  
  shortcuts.START_PAUSE = "alt+-";
  shortcuts.STOP = "alt+=";
  shortcuts.PREV_SONG = "alt+up";
  shortcuts.NEXT_SONG = "alt+down";
  
  themeSettings.currentTheme = currentTheme?.value || "default";
};

// 应用预设配置
const applyPresetConfig = (presetId: string) => {
  info(`应用预设配置: ${presetId}`);
  const preset = presetConfigs.find(p => p.id === presetId);
  if (preset) {
    keySettings.minNote = preset.minNote;
    keySettings.maxNote = preset.maxNote;
  }
};

// 恢复默认快捷键
const restoreDefaultShortcuts = () => {
  shortcuts.START_PAUSE = "alt+-";
  shortcuts.STOP = "alt+=";
  shortcuts.PREV_SONG = "alt+up";
  shortcuts.NEXT_SONG = "alt+down";
};

// 获取音符名称
const getNoteName = (note: number): string => {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(note / 12) - 1;
  const noteIndex = note % 12;
  return `${noteNames[noteIndex]}${octave}`;
};

// 监听可见性变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 加载当前主题设置
    if (currentTheme) {
      themeSettings.currentTheme = currentTheme.value;
    }
    info("加载设置");
  }
});

// 监听当前主题变化，同步到设置中
watch(() => currentTheme?.value, (newVal) => {
  if (newVal && newVal !== themeSettings.currentTheme) {
    themeSettings.currentTheme = newVal;
  }
});

// 获取主题预览样式
const getThemePreviewStyle = (themeName: string) => {
  const theme = themeConfig.theme.find(t => t.name === themeName);
  if (!theme) return {};
  
  return {
    backgroundColor: theme.bg,
    border: `2px solid ${theme.primary}`
  };
};
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    title="设置"
    width="600px"
    height="550px"
  >
    <!-- 标签页导航 -->
    <div class="settings-tabs">
      <div 
        class="tab-button"
        :class="{ active: activeTab === 'keys' }"
        @click="activeTab = 'keys'"
      >
        按键设置
      </div>
      <div 
        class="tab-button"
        :class="{ active: activeTab === 'shortcuts' }"
        @click="activeTab = 'shortcuts'"
      >
        快捷键设置
      </div>
      <div 
        class="tab-button"
        :class="{ active: activeTab === 'theme' }"
        @click="activeTab = 'theme'"
      >
        主题设置
      </div>
    </div>
    
    <!-- 标签页内容 -->
    <div class="tab-content">
      <!-- 按键设置标签页 -->
      <div v-if="activeTab === 'keys'" class="keys-tab">
        <!-- 预设配置 -->
        <div class="setting-section">
          <h4 class="section-title">预设配置</h4>
          <div class="preset-buttons">
          <button 
            v-for="preset in presetConfigs" 
            :key="preset.id"
            class="btn btn-small"
            @click="applyPresetConfig(preset.id)"
          >
            {{ preset.name }}
          </button>
        </div>
        </div>
        
        <!-- 音符范围设置 -->
        <div class="setting-section">
          <h4 class="section-title">音符范围设置</h4>
          <div class="range-controls">
            <div class="control-group">
              <label>最低音符：</label>
              <input 
                type="number" 
                v-model.number="keySettings.minNote"
                min="0" 
                max="127"
                class="number-input"
              />
              <span class="note-name">{{ getNoteName(keySettings.minNote) }}</span>
            </div>
            <div class="control-group">
              <label>最高音符：</label>
              <input 
                type="number" 
                v-model.number="keySettings.maxNote"
                min="0" 
                max="127"
                class="number-input"
              />
              <span class="note-name">{{ getNoteName(keySettings.maxNote) }}</span>
            </div>
          </div>
        </div>
        
        <!-- 黑键模式 -->
        <div class="setting-section">
          <h4 class="section-title">黑键设置</h4>
          <div class="black-key-settings">
            <select v-model="keySettings.blackKeyMode" class="setting-select">
              <option v-for="mode in blackKeyModes" :key="mode.value" :value="mode.value">
                {{ mode.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- 快捷键设置标签页 -->
      <div v-if="activeTab === 'shortcuts'" class="shortcuts-tab">
        <div class="setting-section">
          <h4 class="section-title">播放控制快捷键</h4>
          
          <div class="shortcut-item">
            <label>开始/暂停：</label>
            <div class="shortcut-display">
              {{ shortcuts.START_PAUSE }}
            </div>
          </div>
          
          <div class="shortcut-item">
            <label>停止：</label>
            <div class="shortcut-display">
              {{ shortcuts.STOP }}
            </div>
          </div>
          
          <div class="shortcut-item">
            <label>上一曲：</label>
            <div class="shortcut-display">
              {{ shortcuts.PREV_SONG }}
            </div>
          </div>
          
          <div class="shortcut-item">
            <label>下一曲：</label>
            <div class="shortcut-display">
              {{ shortcuts.NEXT_SONG }}
            </div>
          </div>
          
          <button @click="restoreDefaultShortcuts" class="restore-button">
            恢复默认快捷键
          </button>
        </div>
      </div>
      
      <!-- 主题设置标签页 -->
      <div v-if="activeTab === 'theme'" class="theme-tab">
        <div class="setting-section">
          <h4 class="section-title">主题选择</h4>
          <div class="theme-options">
            <div 
              v-for="option in themeOptions" 
              :key="option.value"
              class="theme-option"
              :class="{ active: themeSettings.currentTheme === option.value }"
              @click="themeSettings.currentTheme = option.value"
            >
              <div class="theme-preview" :style="{ backgroundColor: themeConfig.theme.find(t => t.name === option.value)?.bg || '#ffffff' }">
                <div class="theme-color" :style="{ backgroundColor: themeConfig.theme.find(t => t.name === option.value)?.primary || '#007bff' }"></div>
                <div class="theme-color" :style="{ backgroundColor: themeConfig.theme.find(t => t.name === option.value)?.success || '#28a745' }"></div>
                <div class="theme-color" :style="{ backgroundColor: themeConfig.theme.find(t => t.name === option.value)?.info || '#17a2b8' }"></div>
              </div>
              <span class="theme-name">
                {{ option.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <button @click="cancelSettings" class="cancel-button">取消</button>
        <button @click="saveSettings" class="save-button">保存</button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.settings-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  border: none;
  background: none;
  font-size: 0.95rem;
  color: var(--secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: var(--primary);
}

.tab-button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 500;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
}

.setting-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 0.75rem;
}

/* 按键设置样式 */
.preset-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.range-controls {
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  width: 80px;
  font-size: 0.9rem;
  color: var(--fg);
}

.number-input {
  width: 70px;
  padding: 0.35rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background-color: var(--inputbg);
  color: var(--inputfg);
  font-size: 0.9rem;
}

.note-name {
  font-size: 0.9rem;
  color: var(--primary);
  font-weight: 500;
  min-width: 40px;
}

.radio-group {
  display: flex;
  gap: 1rem;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.radio-item input[type="radio"] {
  accent-color: var(--primary);
}

.radio-item label {
  font-size: 0.9rem;
  color: var(--fg);
  cursor: pointer;
}

/* 快捷键设置样式 */
.shortcut-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.shortcut-item label {
  width: 100px;
  font-size: 0.9rem;
  color: var(--fg);
}

.shortcut-display {
  padding: 0.35rem 0.75rem;
  background-color: var(--active);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--inputfg);
}

.mt-2 {
  margin-top: 1rem;
}

/* 主题设置样式 */
.theme-options {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.theme-option:hover {
  background-color: var(--active);
}

.theme-option.active {
  background-color: var(--active);
  border: 1px solid var(--primary);
}

.theme-preview {
  width: 100px;
  height: 60px;
  border-radius: 4px;
  padding: 0.5rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
}

.theme-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid var(--border);
}

.theme-name {
  font-size: 0.9rem;
  color: var(--fg);
}

/* 按钮样式 */
.btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-small {
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
}

.btn-primary {
  background-color: var(--primary);
  color: var(--selectfg);
  border-color: var(--primary);
}

.btn-primary:hover {
  background-color: var(--dark);
  border-color: var(--dark);
}

.btn-secondary {
  background-color: var(--inputbg);
  color: var(--inputfg);
  border-color: var(--border);
}

.btn-secondary:hover {
  background-color: var(--active);
}

/* 对话框底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
}

.cancel-button, .save-button {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button {
  background-color: var(--inputbg);
  color: var(--inputfg);
  border-color: var(--border);
}

.cancel-button:hover {
  background-color: var(--active);
}

.save-button {
  background-color: var(--primary);
  color: var(--selectfg);
  border-color: var(--primary);
}

.save-button:hover {
  background-color: var(--dark);
  border-color: var(--dark);
}
</style>
