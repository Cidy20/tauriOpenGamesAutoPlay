import { reactive } from 'vue';
import { ConfigService, type AppConfig } from '../services/config';
import { info } from '@tauri-apps/plugin-log';

// 全局响应式状态
const state = reactive<AppConfig>({
  keySettings: {
    minNote: 48,
    maxNote: 83,
    blackKeyMode: 'support_black_key',
    noteToKey: {},
  },
  shortcuts: {
    START_PAUSE: 'alt+-',
    STOP: 'alt+=',
    PREV_SONG: 'alt+up',
    NEXT_SONG: 'alt+down',
  },
  themeSettings: {
    currentTheme: 'default',
  },
});

const configService = ConfigService.getInstance();
let isInitialized = false;

export const useSettingsStore = () => {

  // 初始化 store
  const init = async () => {
    if (isInitialized) return;

    const config = await configService.loadConfig();

    // 更新状态
    state.keySettings = config.keySettings;
    state.shortcuts = config.shortcuts;
    state.themeSettings = config.themeSettings;

    isInitialized = true;
    info('SettingsStore 初始化完成');
  };

  // 保存设置
  const save = async (newConfig: Partial<AppConfig>) => {
    // 更新状态
    if (newConfig.keySettings) state.keySettings = { ...state.keySettings, ...newConfig.keySettings };
    if (newConfig.shortcuts) state.shortcuts = { ...state.shortcuts, ...newConfig.shortcuts };
    if (newConfig.themeSettings) state.themeSettings = { ...state.themeSettings, ...newConfig.themeSettings };

    // 持久化
    await configService.saveConfig({
      keySettings: state.keySettings,
      shortcuts: state.shortcuts,
      themeSettings: state.themeSettings,
    });
  };

  return {
    state,
    init,
    save,
  };
};
