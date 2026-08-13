import { createRouter, createWebHistory } from 'vue-router'
import Estimator from '../pages/Estimator.vue'
import Library from '../pages/Library.vue'
import Ranking from '../pages/Ranking.vue'
import Solver from '../pages/Solver.vue'
import About from '../pages/About.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',          name: 'estimator', component: Estimator, meta: { seoKey: 'estimator' } },
    { path: '/supported', redirect: '/library' },
    { path: '/library',   name: 'library',   component: Library,   meta: { seoKey: 'library' } },
    { path: '/ranking',   name: 'ranking',   component: Ranking,   meta: { seoKey: 'ranking' } },
    { path: '/solver',    name: 'solver',    component: Solver,    meta: { seoKey: 'solver' } },
    { path: '/about',     name: 'about',     component: About,     meta: { seoKey: 'about' } },
  ],
})
