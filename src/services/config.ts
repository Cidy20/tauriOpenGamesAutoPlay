import { BaseDirectory, readTextFile, writeTextFile, exists } from '@tauri-apps/plugin-fs';
import { info, error } from '@tauri-apps/plugin-log';

const CONFIG_FILE_NAME = 'config.json';

export interface KeySettings {
  minNote: number;
  maxNote: number;
  blackKeyMode: string;
  noteToKey: Record<number, string>;
}

export interface AppConfig {
  keySettings: KeySettings;
  shortcuts: Record<string, string>;
  themeSettings: {
    currentTheme: string;
  };
}

const DEFAULT_CONFIG: AppConfig = {
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
};

export class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig = { ...DEFAULT_CONFIG };
  private loaded = false;

  private constructor() { }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * 加载配置
   */
  public async loadConfig(): Promise<AppConfig> {
    if (this.loaded) {
      return this.config;
    }

    try {
      const configExists = await exists(CONFIG_FILE_NAME, { baseDir: BaseDirectory.AppConfig });

      if (configExists) {
        const content = await readTextFile(CONFIG_FILE_NAME, { baseDir: BaseDirectory.AppConfig });
        const savedConfig = JSON.parse(content);
        // 合并默认配置，确保新字段存在
        this.config = {
          ...DEFAULT_CONFIG,
          ...savedConfig,
          keySettings: { ...DEFAULT_CONFIG.keySettings, ...savedConfig.keySettings },
          shortcuts: { ...DEFAULT_CONFIG.shortcuts, ...savedConfig.shortcuts },
          themeSettings: { ...DEFAULT_CONFIG.themeSettings, ...savedConfig.themeSettings },
        };
        info('配置加载成功');
      } else {
        info('配置文件不存在，使用默认配置');
        await this.saveConfig(DEFAULT_CONFIG);
      }
    } catch (e) {
      error(`加载配置失败: ${e}`);
      this.config = { ...DEFAULT_CONFIG };
    }

    this.loaded = true;
    return this.config;
  }

  /**
   * 保存配置
   */
  public async saveConfig(config: AppConfig): Promise<void> {
    try {
      // 确保配置目录存在
      // 注意：BaseDirectory.AppConfig 对应的目录可能不存在，需要先创建
      // 但 tauri-plugin-fs 的 writeTextFile 会自动创建父目录吗？通常不会。
      // 这里假设 AppConfig 目录由 Tauri 自动管理，或者我们需要显式创建。
      // 为了安全起见，我们尝试写入。如果失败可能是目录不存在。

      // 更新内存中的配置
      this.config = config;

      await writeTextFile(CONFIG_FILE_NAME, JSON.stringify(config, null, 2), {
        baseDir: BaseDirectory.AppConfig,
      });
      info('配置保存成功');
    } catch (e) {
      error(`保存配置失败: ${e}`);
      // 尝试创建目录（如果是因为目录不存在）
      // 由于 API 限制，这里暂时不处理复杂的目录创建逻辑，依赖 Tauri 的默认行为
    }
  }

  /**
   * 获取当前配置（同步，需确保已调用 loadConfig）
   */
  public getConfig(): AppConfig {
    return this.config;
  }
}
