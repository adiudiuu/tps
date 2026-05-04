import { createRouter, createWebHistory } from 'vue-router'
import Estimator from '../pages/Estimator.vue'
import Library from '../pages/Library.vue'
import Ranking from '../pages/Ranking.vue'
import Solver from '../pages/Solver.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',          component: Estimator },
    { path: '/supported', redirect: '/library' },
    { path: '/library',   component: Library },
    { path: '/ranking',   component: Ranking },
    { path: '/solver',    component: Solver },
  ],
})
