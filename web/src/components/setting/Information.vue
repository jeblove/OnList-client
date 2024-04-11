<template>
    <el-form :model="form" ref="form" label-width="auto" label-position="top" :rules="rules">
        <el-form-item label="修改用户名" :required="true">
            <el-col :span="8">
                <el-input v-model="form.username" :required="true" />
            </el-col>
        </el-form-item>

        <el-form-item prop="password" label="修改密码"
            :rules="{ required: true, message: '密码不能为空', trigger: ['blur', 'change'] }">
            <el-col :span="10">
                <el-input v-model="form.password" placeholder="********" type="password" />
            </el-col>
        </el-form-item>
        <el-form-item prop="confirmPassword" label="确认密码"
            :rules="{ required: true, validator: validatePasswordConfirm, trigger: ['blur', 'change'] }">
            <el-col :span="10">
                <el-input v-model="form.confirmPassword" placeholder="********" type="password" />
            </el-col>
        </el-form-item>

        <el-form-item>
            <el-button type="primary" @click="onSubmit">保存</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
import axios from '@/utils/axios';
import { ElMessage } from 'element-plus'

export default {
    name: "information",
    components: {
        ElMessage, 
    },
    data() {
        return {
            form: {
                username: '',
                password: '',
                confirmPassword: '',
            },
            rules: {
                confirmPassword: [
                    { validator: this.validatePasswordConfirm, trigger: ['blur', 'change'] },
                ],
            },

        };
    },
    methods: {
        validatePasswordConfirm(rule, value, callback) {
            if (!value) {
                callback(new Error('确认密码不能为空'));
            } else if (value !== this.form.password) {
                callback(new Error('两次输入的密码不一致'));
            } else {
                callback();
            }
        },
        onSubmit() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    const formData = new FormData();
                    formData.append('loginId', localStorage.getItem('userId'));
                    // formData.append('currentPassword', this.form.currentPassword);
                    formData.append('username', this.form.username);
                    formData.append('password', this.form.password);

                    axios({
                        url: '/user/modifyUser',
                        method: 'post',
                        data: formData,
                    }).then((res) => {
                        if(res.data.code==200){
                            this.$message.success('保存成功');
                        }else{
                            // console.log('fail:'+ res.data)
                            this.$message.error('保存失败');
                        }
                    }).catch((error) => {
                        // console.error('失败:', error);
                        this.$message.error('保存失败');
                    });
                } else {
                    console.log('表单验证失败');
                }
            });

        }
    },
    mounted() {
        this.form.username = localStorage.getItem('username');
    }
};
</script>