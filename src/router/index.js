import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Supported from '../pages/Supported.vue'
import ModelRanking from '../pages/ModelRanking.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',          component: Home },
    { path: '/supported', component: Supported },
    { path: '/ranking',   component: ModelRanking },
  ],
})
