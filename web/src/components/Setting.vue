<template>
    <el-container>
        <!-- 左侧菜单区域 -->
        <el-aside width="100px">
            <el-menu :default-active="activeIndex" class="el-menu-vertical-demo" @select="handleMenuSelect">
                <el-menu-item v-for="item in displayedMenuData" :key="item.index" :index="item.index">
                    {{ item.label }}
                </el-menu-item>
            </el-menu>
        </el-aside>

        <!-- 右侧内容区域 -->
        <el-main>
            <div class="content-panel">
                <component :is="currentView"></component>
            </div>
        </el-main>
    </el-container>
</template>

<script>
import axios from '@/utils/axios';

import { defineComponent, markRaw } from 'vue';
import Information from './setting/Information.vue';
import User from './setting/User.vue';
import Path from './setting/Path.vue'
import FileLink from './setting/FileLink.vue';
import File from './setting/File.vue';
import Share from './setting/Share.vue';
import BR from './setting/BR.vue';

export default defineComponent({
    components: {
        Information: markRaw(Information),
        User: markRaw(User),
        Path: markRaw(Path),
        FileLink: markRaw(FileLink),
        File: markRaw(File),
        Share: markRaw(Share),
        BR: markRaw(BR),
    },
    data() {
        return {
            originalMenuData: [
                { index: '1', label: '个人信息' },
                { index: '2', label: '用户' },
                { index: '3', label: '目录' },
                { index: '4', label: '链接' },
                { index: '5', label: '文件' },
                { index: '6', label: '分享' },
                { index: '7', label: '备份' },
            ],
            displayedMenuData: [],
            activeIndex: '1',
            currentView: null,
            componentsMapping: {
                '1': Information,
                '2': User,
                '3': Path,
                '4': FileLink,
                '5': File,
                '6': Share,
                '7': BR,
            },
            isAdmin: false,
        };
    },
    methods: {
        async fetchIsAdminStatus() {
            axios({
                url: '/user/isAdmin',
                method: 'post',
                headers: {
                    'Content-Type': 'multipart/form-data;'
                },
                data: {
                    'userId': localStorage.getItem('userId'),
                },
            }).then((res) => {
                if (res.data.code == 200) {

                    this.isAdmin = res.data.data;
                } else {
                    this.isAdmin = false;
                }
                this.updateMenuData();
                this.activeIndex = '1';
                this.currentView = this.componentsMapping[this.activeIndex];
            }).catch((error) => {
                // 请求失败，默认不显示全部菜单
                this.isAdmin = false;
                this.updateMenuData();
                this.activeIndex = '1';
                this.currentView = this.componentsMapping[this.activeIndex];
            });
        },
        handleMenuSelect(index) {
            this.activeIndex = index;
            this.currentView = this.componentsMapping[index];
        },
        updateMenuData() {
            if (this.isAdmin) {
                this.displayedMenuData = [...this.originalMenuData];
            } else {
                // 如果已经是个人信息则无需再次更新
                if (this.displayedMenuData.length !== 1 || this.displayedMenuData[0].index !== '1') {
                    this.displayedMenuData = [{ index: '1', label: '个人信息' }];
                }
            }
        },
    },
    mounted() {
        // this.currentView = this.componentsMapping[this.activeIndex];
    },
    async created() {
        await this.fetchIsAdminStatus();
    },
});
</script>

<style>
.el-menu-vertical-demo {
    height: 100vh;
    /* 使菜单区域高度自适应视口高度 */
    border-right: 1px solid #e6e6e6;
    /* 添加边框 */
}

.content-panel {
    padding: 20px;
}
</style>