<template>
    <div class="register">
        <el-card class="box-card">
            <h2 slot="header">注册</h2>
            <el-form ref="registerForm" :model="registerForm" :rules="rules" status-icon label-width="80px">
                <el-form-item label="账 号：" prop="username">
                    <el-input v-model="registerForm.username" ref="usernameInput" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="密 码：" prop="password">
                    <el-input type="password" v-model="registerForm.password" show-password auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="确认密码：" prop="password2">
                    <el-input type="password2" v-model="registerForm.password2" show-password auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="邮 箱：" prop="email">
                    <el-input v-model="registerForm.email" ref="emailInput" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="手机号：" prop="phone">
                    <el-input v-model="registerForm.phone" ref="phoneInput" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="register()" >注册</el-button>
                    <el-button type="info" @click="cancel()" >取消</el-button>
                </el-form-item>
            </el-form>
            <div v-if="registerError" class="alert alert-danger">{{ registerMessage }}</div>
        </el-card>
    </div>
</template>
  
<script>
import { reactive } from 'vue';
import axios from '@/utils/axios';
import { ElInput, ElForm, ElFormItem, ElButton, ElCard } from 'element-plus';

export default {
    name: 'Register',
    components: {
        ElInput,
        ElForm,
        ElFormItem,
        ElButton,
        ElCard
    },
    data() {
        return {
            registerForm: {
                username: '',
                password: '',
                password2: '',
                email: '',
                phone: '',
            },
            rules: {
                username: [{ required:true, message: '请输入用户名', trigger:'blur' }],
                password: [{ required:true, message:'请输入密码', trigger:'blur'}],
                password2: [{ required:true, message:'请再次输入密码', trigger:'blur'},{validator: this.checkPassword}],
                email: [{ required:true, message:'请输入邮箱', trigger:'blur'}],
                phone: [{ required:true, message:'请输入手机号', trigger:'blur'}],
            },
            registerError: '',
            registerMessage: '',
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
        register(){
            delete this.registerForm.password2;
            console.log(this.registerForm)
            const form = this.$refs.registerForm;
            const isValid = form.validate();
            const errors = isValid ? null : Object.values(isValid).filter(v => v); // 如果表单未通过验证，则获取错误信息
            const hasErrors = errors && errors.length > 0; // 判断是否存在错误信息
            if (!hasErrors) {
                // 正常
            } else {
                // 错误
                this.$message.error('注册失败');
                return;
            }

            axios({
                url: '/user/register',
                method: 'post',
                headers: {
                    'Content-Type': 'multipart/form-data;'
                },
                data: this.registerForm,
            }).then((res)=>{
                console.log(res.data)
                if(res.data.code==200){
                    this.$message.success('注册成功');
                    this.$router.push('/login');
                }else{
                    this.$message.error('注册失败');
                }
            }).catch((error)=>{
                this.$message.error('注册失败');
                this.registerError = true;
                this.registerMessage = '';
            })
        },
        // 回车则注册
        handleKeyDown(event){
            if(event.keyCode === 13){
                this.$refs.registerForm.validate((valid)=>{
                    if(valid) {
                        this.register();
                    }
                })
            }
        },
        cancel(){
            this.$router.push('/')
        },
        // 两次密码检验
        checkPassword(rule, value, callback){
            if(value !== this.registerForm.password){
                callback(new Error('两次输入密码不一致'));
            }else{
                callback();
            }
        }

    }, // methods
};
</script>
  
<style>
.register {
    max-width: 360px;
    margin: 0 auto;
}

.box-card {
    border-radius: 10px;
}
label {
  white-space: nowrap;
}
</style>
  