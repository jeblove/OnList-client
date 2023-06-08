import { createRouter, createWebHistory } from "vue-router";

import routesWeb from './routes-web';

const baseRoutes = [];
// const routes = baseRoutes.concat(routesWeb,routesAdmin);
const routes = baseRoutes.concat(routesWeb);


const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
