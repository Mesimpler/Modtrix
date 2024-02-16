import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'

import './assets/normalize.css'
import './assets/el-theme.scss'
import './assets/el-custom.scss'
import './assets/index.css'
import './assets/variable.css'

const app = createApp(App)
const pinia = createPinia()

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(ElementPlus)
app.mount('#app')
