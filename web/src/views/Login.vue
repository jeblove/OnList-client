<template>
    <div class="login">
        <el-card class="box-card">
            <h2 slot="header">登录</h2>
            <el-form ref="loginForm" :model="loginForm" :rules="rules" status-icon label-width="80px">
                <el-form-item label="账号：" prop="username">
                    <el-input v-model="loginForm.username" ref="usernameInput" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="密码：" prop="password">
                    <el-input type="password" v-model="loginForm.password" show-password auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="login()" >登录</el-button>
                    <el-button type="info" @click="gotoRegister()" >注册</el-button>
                </el-form-item>
            </el-form>
            <div v-if="loginError" class="alert alert-danger">{{ loginMessage }}</div>
        </el-card>
    </div>
</template>
  
<script>
import { reactive } from 'vue';
import axios from '@/utils/axios';
import { ElInput, ElForm, ElFormItem, ElButton, ElCard } from 'element-plus';

export default {
    name: 'Login',
    components: {
        ElInput,
        ElForm,
        ElFormItem,
        ElButton,
        ElCard
    },
    data() {
        return {
            loginForm: {
                username: '',
                password: '',
            },
            rules: {
                username: [{ required:true, message: '请输入用户名', trigger:'blur' }],
                password: [{ required:true, message:'请输入密码', trigger:'blur'}],
            },
            loginError: '',
            loginMessage: '',
        };
    },
    created() {
        const loggedIn = localStorage.getItem('token');
  
        if (loggedIn) {
        this.$router.push('/'); // 如果已经登陆过，则自动跳转到主页
        }
    },
    mounted(){
        // 自动聚焦
        this.$refs.usernameInput.focus();
        // 按键监听
        document.addEventListener('keydown', this.handleKeyDown);
    },
    methods: {
        login(){
            console.log(this.loginForm)
            axios({
                url: '/user/login',
                method: 'post',
                headers: {
                    'Content-Type': 'multipart/form-data;'
                },
                data: this.loginForm,
            }).then((res)=>{
                console.log(res.data)
                if(res.data.code==200){
                    this.$message.success('登录成功');
                    localStorage.setItem('token', res.data.data.token);
                    localStorage.setItem('userId', res.data.data.userId);
                    this.$router.push('/');
                }else{
                    this.$message.error('登录失败');
                }
            }).catch((error)=>{
                this.$message.error('登录失败');
                this.loginError = true;
                this.loginMessage = '用户或密码错误';
            })
        },
        // 回车则登录
        handleKeyDown(event){
            if(event.keyCode === 13){
                this.$refs.loginForm.validate((valid)=>{
                    if(valid) {
                        this.login();
                    }
                })
            }
        },
        // 跳转到注册
        gotoRegister(){
            this.$router.push('/register');
        }

    }, // methods
};
</script>
  
<style>
.login {
    max-width: 360px;
    margin: 0 auto;
}

.box-card {
    border-radius: 10px;
}
</style>
  