<template>
    <div class="centered-menu">
    <el-menu class="el-menu-demo" mode="horizontal" background-color="#545c64" text-color="#fff" active-text-color="#ffd04b"
        @select="handleSelect">
        <!-- :default-active="activeIndex" -->
        <router-link tag="li" :to="{ path: '/showPath' }" v-if="isShowPathVisible">
            <el-menu-item index="1">文件</el-menu-item>
        </router-link>
        
        <!-- <el-sub-menu index="2">
            <template #title>操作</template>
            <router-link tag="li" :to="{ path: '/uploadFile' }" v-if="isShowPathVisible">
                <el-menu-item index="2-1">上传</el-menu-item>
            </router-link>
            
            <el-menu-item index="2-2">item two</el-menu-item>
            <el-menu-item index="2-3">item three</el-menu-item>
            <el-sub-menu index="2-4">
                <template #title>item four</template>
                <el-menu-item index="2-4-1">item one</el-menu-item>
                <el-menu-item index="2-4-2">item two</el-menu-item>
                <el-menu-item index="2-4-3">item three</el-menu-item>
            </el-sub-menu>
        </el-sub-menu>
        <el-menu-item index="3" disabled>Info</el-menu-item> -->
        
        <el-menu-item @click="queryTotalSize">{{ totalSize }}</el-menu-item>

        <div class="keep-right">
            <el-menu-item class="highlighted" style="color: orange; font-weight: bold;">用户：{{ username }}</el-menu-item>
            <el-menu-item index="4" @click="goto('/setting')" v-if="showLogout">管理</el-menu-item>
            <el-menu-item index="4" @click="handleLogout()" v-if="showLogout">注销</el-menu-item>
        </div>
    </el-menu>
    <!-- <div class="h-6" /> -->
    </div>
</template>

<script>
import axios from '@/utils/axios';
import { defineComponent, reactive, inject } from 'vue';
import { useRouter } from 'vue-router';

// export default defineComponent({
export default {
    setup() {
        const router = useRouter();
        const state = reactive({
            isShowPathVisible: true,
        });

        function handleSelect(index) {
            console.log(index);
        };

        const http = inject('$http');
        function handleLogout(){
            localStorage.removeItem('token');
            localStorage.removeItem('userId');

            delete http.defaults.headers.common['Authorization'];

            location.reload();
        };

        return {
            ...state,
            handleSelect,
            handleLogout,
        };
    },
    data(){
        return {
            showLogout: false,
            // 占用空间大小
            totalSize: '查询空间占用',
            username: '',
        }
    },
    mounted(){
        if(localStorage.getItem('userId')){
            this.showLogout = true;
            this.username = localStorage.getItem('username');
        }
    },
    methods: {
        logout(){
            localStorage.removeItem('token');
            localStorage.removeItem('userId');

            this.$http.defaults.headers.common['Authorization'] = '';
            
            this.$router.push('/');
            // location.reload();
        },

        queryTotalSize(){
            axios({
                url: '/file/queryTotalSize',
                method: 'get',
            }).then((res)=>{
                console.log(res.data);
                if(res.data.code==200){
                    this.totalSize = res.data.data+'MB';
                }else{
                    this.totalSize = '查询失败';
                }
            })
        },
        goto(target){
            this.$router.push(target);
        }
    } // methods end
};
</script>

<style>
.keep-right {
    /* margin-left: auto; */
    display: flex;
    justify-content: flex-end;
    margin-right: 2%;
}

.el-menu-demo {
    max-width: 80%;
    width: 100%;
}

.centered-menu {
    /* display: inline-block; */
    /* width: 80%; */
    display: flex;
    justify-content: center;
}

</style>


<!-- <script>
import { defineComponent, ref ,reactive,toRefs} from 'vue'
import { getCurrentInstance } from 'vue'

export default defineComponent({
    inject:['reload'],

    

    setup(){
        
    }
})

</script> -->

