<script setup>
import AddGame from './components/AddGame.vue'
</script>

<template>
  <el-aside id="app-aside" width="78px">
    <h1 class="aside-logo">M</h1>
    <ul class="app-aside-inner">
      <div>
        <li class="aside-item">
          <AddGame />
        </li>
      </div>
      <div>
        <li class="aside-item"></li>
      </div>
    </ul>
  </el-aside>
</template>

<style lang="scss" scoped>
#app-aside {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 32px 0;
  color: white;
  gap: 24px;
  background-color: var(--app-aside-bg-color);
}

.app-aside-inner {
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  justify-content: space-between;
}

.aside-logo {
  margin: 0;
  padding: 0;
  font-size: 32px;
  cursor: pointer;
}

.aside-item {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.25s;
  font-size: 24px;
  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
}
</style>
