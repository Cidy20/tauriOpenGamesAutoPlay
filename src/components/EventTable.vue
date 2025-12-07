<script setup lang="ts">
import { ref, computed, inject } from "vue";
import { info } from '@tauri-apps/plugin-log';
import { getNoteName, groupForNote } from "../config/groups";

interface EventData {
  time: number;
  type: string;
  note?: number;
  channel: number;
  group?: string;
  duration?: number;
  end?: number;
}

interface EventTableProps {
  events: EventData[];
}

const props = defineProps<EventTableProps>();

// 从 App.vue 注入 settingsManager
const settingsManager = inject('settingsManager') as any;

// 获取设置
const settings = settingsManager.getSettings();
const currentMinNote = ref(settings.analyzerSetting?.minNote || 48);
const currentMaxNote = ref(settings.analyzerSetting?.maxNote || 83);

// 状态
const showOnlyOutOfRange = ref(false);
const events = computed(() => props.events || []);

// 计算超限音符数量(只统计note_on事件)
const outOfRangeCount = computed(() => {
  return events.value.filter(e => e.type === 'note_on' && e.note && isOutOfRange(e)).length;
});

// 过滤后的事件
const filteredEvents = computed(() => {
  if (showOnlyOutOfRange.value) {
    // 只显示超限音符相关的事件(包括note_on和note_off)
    return events.value.filter(e => e.note && isOutOfRange(e));
  }
  return events.value;
});

// 检查音符是否超出范围
const isOutOfRange = (event: EventData): boolean => {
  if (!event.note) return false;
  return event.note < currentMinNote.value || event.note > currentMaxNote.value;
};

// 切换显示模式
const toggleDisplay = () => {
  console.log('toggleDisplay called, showOnlyOutOfRange:', showOnlyOutOfRange.value);
};

// 导出事件CSV
const exportEventCsv = () => {
  info("[EventTable.vue] 导出事件CSV");
};

// 双击事件处理
const handleEventDoubleClick = (event: EventData) => {
  info(`[EventTable.vue] 双击事件: ${JSON.stringify(event)}`);
};
</script>

<template>
  <div class="event-table-view">
    <!-- 工具栏 -->
    <div class="event-toolbar">
      <button class="btn btn-small" @click="exportEventCsv">导出事件CSV</button>

      <div class="toolbar-right">
        <span class="out-of-range-count">超限音符数量:{{ outOfRangeCount }}</span>
        <div class="checkbox-item">
          <input type="checkbox" id="showOutOfRange" v-model="showOnlyOutOfRange" @change="toggleDisplay" />
          <label for="showOutOfRange">仅显示超限音符</label>
        </div>
      </div>
    </div>

    <!-- 事件表格 -->
    <div class="event-table-container">
      <table class="event-table">
        <thead>
          <tr>
            <th>序号</th>
            <th>时间</th>
            <th>事件</th>
            <th>音符</th>
            <th>通道</th>
            <th>分组</th>
            <th>结束</th>
            <th>时长</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(event, index) in filteredEvents" :key="index"
            :class="{ 'out-of-range': event.note && isOutOfRange(event) }" @dblclick="handleEventDoubleClick(event)">
            <td>{{ index + 1 }}</td>
            <td>{{ event.time.toFixed(2) }}</td>
            <td>{{ event.type }}</td>
            <td>{{ event.note ? getNoteName(event.note) + '(' + event.note + ')' : '-' }}</td>
            <td>{{ event.channel }}</td>
            <td>{{ event.note ? groupForNote(event.note) : '-' }}</td>
            <td>{{ event.end ? event.end.toFixed(2) : '-' }}</td>
            <td>{{ event.duration ? event.duration.toFixed(2) : '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.event-table-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--bg);
}

.event-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background-color: var(--active);
  border-radius: 4px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.out-of-range-count {
  font-size: 0.9rem;
  color: var(--danger);
  font-weight: 500;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-item input[type="checkbox"] {
  accent-color: var(--primary);
}

.checkbox-item label {
  font-size: 0.9rem;
  color: var(--fg);
  cursor: pointer;
}

.event-table-container {
  flex: 1;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 4px;
  margin: 0 1rem 1rem 1rem;
}

.event-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.event-table th {
  background-color: var(--active);
  padding: 0.5rem;
  text-align: center;
  border: 1px solid var(--border);
  font-weight: 600;
  color: var(--fg);
  position: sticky;
  top: 0;
  z-index: 10;
}

.event-table td {
  padding: 0.5rem;
  text-align: center;
  border: 1px solid var(--border);
  color: var(--fg);
}

.event-table tr:hover {
  background-color: var(--active);
}

.event-table tr.out-of-range {
  background-color: rgba(220, 53, 69, 0.1);
  color: var(--danger);
}

.event-table tr.out-of-range:hover {
  background-color: rgba(220, 53, 69, 0.2);
}

.btn-small {
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background-color: var(--inputbg);
  color: var(--inputfg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-small:hover {
  background-color: var(--primary);
  border-color: var(--primary);
  color: var(--selectfg);
}
</style>
