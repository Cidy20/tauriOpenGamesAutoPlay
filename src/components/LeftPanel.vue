<script setup lang="ts">
import { ref, onMounted, defineEmits, inject } from "vue";
import { info } from '@tauri-apps/plugin-log';
import { open } from '@tauri-apps/plugin-dialog'; // 引入 dialog API
import { readDir } from '@tauri-apps/plugin-fs'; // 引入 fs API

import { join } from '@tauri-apps/api/path';

// 从 App.vue 注入 settingsManager
const settingsManager = inject('settingsManager') as any;

// 左侧面板组件
const searchText = ref("搜索歌曲...");
const midiFiles = ref<string[]>(["测试歌曲-忘记时间-胡歌.mid"]);
const allMidiFiles = ref<string[]>(["测试歌曲-忘记时间-胡歌.mid"]); // 用于存储所有MIDI文件
const selectedFile = ref<string>("");
const currentFolderPath = ref<string>("");

const emit = defineEmits(['update:selectedSong']);

// 组件挂载时加载MIDI文件夹
onMounted(async () => {
  info('[LeftPanel.vue] 组件挂载，开始加载MIDI文件夹');
  try {

    // 等待 settingsManager 初始化完成
    await settingsManager.initialize();

    // 从内存加载保存的MIDI文件夹路径（同步调用）
    const savedFolderPath = settingsManager.loadMidiFolderPath();
    if (savedFolderPath) {
      info(`[LeftPanel.vue:1818] 加载到保存的MIDI文件夹路径: ${savedFolderPath}`);
      await loadMidiFiles(savedFolderPath);
    } else {
      info('[LeftPanel.vue:1919] 未找到保存的MIDI文件夹路径');
    }
  } catch (error) {
    info(`[LeftPanel.vue:2020] 组件挂载时操作失败: ${error}`);
  }
});

// 选择MIDI文件夹
const selectDirectory = async () => {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "选择MIDI文件夹",
    });

    if (selected) {
      const folderPath = selected as string;
      info(`[LeftPanel.vue:2121] 选择了文件夹: ${folderPath}`);
      // 保存文件夹路径到配置
      await settingsManager.saveMidiFolderPath(folderPath);
      await loadMidiFiles(folderPath);
    }
  } catch (error) {
    info(`[LeftPanel.vue:2222] 选择文件夹或读取文件失败: ${error}`);
  }
};

// 搜索歌曲
const filterSongs = () => {
  const query = searchText.value.toLowerCase();
  if (query === "" || query === "搜索歌曲...") {
    midiFiles.value = allMidiFiles.value;
  } else {
    midiFiles.value = allMidiFiles.value.filter(file =>
      file.toLowerCase().includes(query)
    );
  }
};

// 歌曲选中
const songSelected = async (file: string) => {
  selectedFile.value = file;
  if (currentFolderPath.value) {
    try {
      const fullPath = await join(currentFolderPath.value, file);
      emit('update:selectedSong', fullPath);
    } catch (e) {
      info(`[LeftPanel.vue:2323] 拼接路径失败: ${e}`);
      emit('update:selectedSong', file); // Fallback
    }
  } else {
    emit('update:selectedSong', file);
  }
};

// 加载MIDI文件列表
const loadMidiFiles = async (folderPath: string) => {
  try {
    currentFolderPath.value = folderPath;
    const entries = await readDir(folderPath);
    const midiFilesList = entries
      .filter((entry) => entry.name?.endsWith(".mid") || entry.name?.endsWith(".midi"))
      .map((entry) => entry.name as string)
      .sort(); // 按名称排序

    allMidiFiles.value = midiFilesList; // 更新所有MIDI文件列表
    midiFiles.value = allMidiFiles.value; // 将所有文件显示在列表中
    info(`[LeftPanel.vue:2424] 从 ${folderPath} 找到 ${midiFilesList.length} 个MIDI文件`);
  } catch (error) {
    info(`[LeftPanel.vue:2525] 读取MIDI文件失败: ${error}`);
    allMidiFiles.value = [];
    midiFiles.value = []; // 清空列表
  }
};

// 选择上一首歌曲
const selectPrevSong = async () => {
  if (midiFiles.value.length === 0) {
    info('[LeftPanel.vue] 没有可用的歌曲');
    return;
  }

  const currentIndex = midiFiles.value.indexOf(selectedFile.value);
  let prevIndex: number;

  if (currentIndex <= 0) {
    // 如果是第一首或未选中，则选择最后一首
    prevIndex = midiFiles.value.length - 1;
  } else {
    prevIndex = currentIndex - 1;
  }

  const prevFile = midiFiles.value[prevIndex];
  info(`[LeftPanel.vue] 选择上一首: ${prevFile}`);
  await songSelected(prevFile);
};

// 选择下一首歌曲
const selectNextSong = async () => {
  if (midiFiles.value.length === 0) {
    info('[LeftPanel.vue] 没有可用的歌曲');
    return;
  }

  const currentIndex = midiFiles.value.indexOf(selectedFile.value);
  let nextIndex: number;

  if (currentIndex >= midiFiles.value.length - 1 || currentIndex === -1) {
    // 如果是最后一首或未选中，则选择第一首
    nextIndex = 0;
  } else {
    nextIndex = currentIndex + 1;
  }

  const nextFile = midiFiles.value[nextIndex];
  info(`[LeftPanel.vue] 选择下一首: ${nextFile}`);
  await songSelected(nextFile);
};

// 暴露方法给父组件
defineExpose({
  selectPrevSong,
  selectNextSong
});

</script>

<template>
  <aside class="left-panel">
    <!-- 文件选择按钮 -->
    <div class="file-select-section">
      <button class="btn btn-primary" @click="selectDirectory">
        选择MIDI文件夹
      </button>
    </div>

    <!-- 搜索框 -->
    <div class="search-section">
      <input type="text" v-model="searchText" @focus="searchText === '搜索歌曲...' && (searchText = '')"
        @keyup="filterSongs" placeholder="搜索歌曲..." />
    </div>

    <!-- 歌曲列表 -->
    <div class="song-list-section">
      <div class="song-list-header">
        <h3>歌曲列表</h3>
      </div>
      <div class="song-list">
        <div v-for="file in midiFiles" :key="file" class="song-item" :class="{ active: selectedFile === file }"
          @click="songSelected(file)">
          <span class="song-name">{{ file }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.left-panel {
  width: 220px;
  background-color: var(--light);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-select-section {
  padding: 0.5rem 1rem;
  background-color: var(--bg);
  border-bottom: 1px solid var(--border);
}

.search-section {
  padding: 0.5rem 1rem;
  background-color: var(--bg);
  border-bottom: 1px solid var(--border);
}

.search-section input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background-color: var(--inputbg);
  color: var(--inputfg);
  font-size: 0.9rem;
}

.search-section input:focus {
  outline: none;
  border-color: var(--primary);
}

.song-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.song-list-header {
  padding: 0.5rem 1rem;
  background-color: var(--active);
  border-bottom: 1px solid var(--border);
  font-weight: 600;
}

.song-list-header h3 {
  font-size: 0.9rem;
  margin: 0;
  color: var(--fg);
}

.song-list {
  flex: 1;
  overflow-y: auto;
  background-color: var(--bg);
}

.song-item {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
  color: var(--fg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-item:hover {
  background-color: var(--active);
}

.song-item.active {
  background-color: var(--primary);
  color: var(--selectfg);
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 1rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
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
</style>
