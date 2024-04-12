import { createApp } from 'vue'
import { createStore } from 'vuex'
import './style.css'
import App from './App.vue'
import router from './router'
// import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// import axios from 'axios'
import axios from '@/utils/axios';

// fontawesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// import { faFile, faFolderOpen,faUpload,faTrash,faFolderPlus,faCopy,faCut,faPaste,faFileSignature,faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
// library.add(faFile, faFolderOpen, faUpload,faTrash,faFolderPlus,faCopy,faCut,faPaste,faFileSignature,faMagnifyingGlass)

import { fas } from '@fortawesome/free-solid-svg-icons';
import { dom } from '@fortawesome/fontawesome-svg-core'
library.add(fas)
dom.watch()

import vue3videoPlay from "vue3-video-play"; // 引入组件
import "vue3-video-play/dist/style.css"; // 引入css

// elementplus-crx
import ElementPlusCrx from "element-plus-crx";
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

// axios 设置全局请求拦截器
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if(token !== null){
            config.headers.Authorization = `Bearer ${token}`;
        };
        const userId = localStorage.getItem('userId');
        if(userId !== null){
            config.headers.userId = userId;
        };

        return config;
    },
    (error) => Promise.reject(error),
);


router.beforeEach((to,from,next) => {
    // 检查页面是否需要登录
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth); 

    if (requiresAuth && !isLoggedIn()) { // 如果需要登录而且未登录，则跳转到登录页面
    //   next('/login');
        localStorage.clear();
        next({
            path: '/login',
            query: { redirect: to.fullPath } // 将当前页面的路径作为查询参数传递给登录页，用于登录后的重定向
        });
    } else {
      next(); // 否则继续前进
    }
});

function isLoggedIn() {
    const token = localStorage.getItem('token');
    return !!token; // 将 token 转换成布尔值，以判断用户是否已经登录
}


const app = createApp(App)

// axios.defaults.baseURL = import.meta.env.VITE_APP_URL

const store = createStore({
    state(){
        return {
            count: 0
        }
    },
    mutations: {
        increment(state){
            state.count++
        }
    },
})

app.provide('$http', axios)
app.use(router)
app.use(store)
app.use(vue3videoPlay)

app.use(ElementPlus);
app.use(ElementPlusCrx);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')

