<script setup lang="ts">
import { ref } from "vue";

// 使用说明文本
const usageText = ref([
  "1. Win需使用管理员权限启动,Mac需在隐私安全中开启辅助功能",
  "2. 选择MIDI文件和音轨",
  "3. 点击播放按钮开始演奏",
  "4. 最高支持钢琴88键",
  "5. 支持长音修剪(过长的音符在很多游戏中不支持)",
  "6. 不支持黑键的游戏会自动降音,如49c#,会自动降为48c",
  "7. 支持移调(所有音符调整1,c#->c)转位(所有音符调整12,c¹->c)",
  "8. 支持效果试听,按配置试听播放效果,基本和游戏内效果一致"
]);
</script>

<template>
  <div class="help-view">
    <h2 class="view-title">帮助</h2>

    <div class="help-content">
      <div class="usage-section">
        <h4 class="section-title">使用说明</h4>
        <ul class="usage-list">
          <li v-for="(item, index) in usageText" :key="index">
            {{ item }}
          </li>
        </ul>
      </div>

      <div class="notice-section">
        <h4 class="section-title">注意事项</h4>
        <ul class="notice-list">
          <li>请确保游戏窗口处于前台</li>
          <li>使用前请先测试音符范围是否合适</li>
          <li>如有问题请检查配置设置</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 2rem;
  background-color: var(--bg);
  overflow-y: auto;
}

.view-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border);
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 1rem;
}

.usage-list,
.notice-list {
  padding-left: 2rem;
  margin: 0;
}

.usage-list li,
.notice-list li {
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: var(--fg);
  line-height: 1.6;
}

.usage-list li:last-child,
.notice-list li:last-child {
  margin-bottom: 0;
}
</style>
