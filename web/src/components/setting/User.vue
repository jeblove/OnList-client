<template>
    <!-- 按钮 -->
    <el-row type="flex" justify="start">
        <el-button type="info" size="small" @click="refreshUserInfo()">刷新</el-button>
        <el-button type="primary" size="small" @click="addNewUser()">添加</el-button>
    </el-row>

    <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName">
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="pathId" label="目录ID" width="220" />
        <el-table-column label="权限">
            <template #default="{ row }">
                {{ displayRole(row.permissions.role) }}
            </template>
        </el-table-column>
        <el-table-column label="已禁用">
            <template #default="{ row }">
                {{ displayDisabled(row.permissions.disabled) }}
            </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="135">
            <template #default="{ row, $index }">
                <el-button type="primary" size="small" @click="openDialog(row, $index)">编辑</el-button>
                <el-button type="danger" size="small" @click="deleteUser(row)">删除</el-button>
            </template>
        </el-table-column>
    </el-table>

    <!-- 编辑框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" align-center>
        <el-form :model="editForm" label-width="80px">
            <el-form-item label="用户名" :required="true">
                <el-input v-model="editForm.username" />
            </el-form-item>
            <el-form-item label="密码" :required="true">
                <el-input v-model="editForm.newPassword" type="password" placeholder="********" show-password />
            </el-form-item>
            <el-form-item label="目录ID">
                <el-input v-model="editForm.pathId" />
            </el-form-item>
            <el-form-item label="权限">
                <el-switch v-model="editForm.permissions.role" inactive-text="用户" active-text="管理员"/>
            </el-form-item>
            <el-form-item label="是否禁用">
                <el-switch v-model="editForm.permissions.disabled"
                    style="--el-switch-off-color: #13ce66; --el-switch-on-color: #ff4949" inactive-text="否" active-text="是" />
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="saveChanges()">保存</el-button>
        </span>
    </el-dialog>
</template>

<script>
import axios from '@/utils/axios';

export default {
    data() {
        return {
            tableData: [],
            dialogVisible: false,
            dialogTitle: '',
            editForm: {
                id: '',
                username: '',
                newPassword: '',
                pathId: '',
                permissions: {
                    role: false,
                    disabled: false
                }
            },
            index: 0,
        };
    },
    async created() {
        this.refreshUserInfo();
    },
    methods: {
        displayRole(role) {
            return role === 0 ? '管理员' : '用户';
        },
        displayDisabled(disabled) {
            return disabled === 0 ? '否' : '是';
        },
        tableRowClassName({ row }) {
            if (row.permissions.disabled === 1) {
                return 'warning-row';
            }
            if (row.permissions.role === 0) {
                return 'blue-row';
            }
            return '';
        },
        openDialog(row, index) {
            this.dialogTitle = '用户编辑'
            this.editForm = Object.assign({}, row, {
                // 将数字0/1转换为布尔值
                permissions: {
                    // role: 0[true] 管理员；1[false] 用户
                    role: row.permissions.role === 0,
                    // disabled: 0[false] 正常；1[true] 禁用
                    disabled: row.permissions.disabled === 1
                }
            });
            this.index = index;
            this.dialogVisible = true;
        },
        // 刷新数据列表
        async refreshUserInfo() {
            try {
                const res = await axios.post('/user/getAllUserInfo');
                if (res.data.code === 200) {
                    this.tableData = res.data.data;
                } else {
                    this.$message.error('获取用户信息失败:' + res.data.message);
                }
            } catch (error) {
                this.$message.error('请求用户信息接口时发生错误:' + error);
            }
        },
        // 对话框保存
        saveChanges() {
            let tableData = this.tableData[this.index]
            // 修改计数
            let count = 0;

            if (this.editForm.id == '') {
                // 添加账号
                axios({
                    url: '/user/register',
                    method: 'post',
                    headers: {
                        'Content-Type': 'multipart/form-data;'
                    },
                    data: {
                        'username': this.editForm.username,
                        'password': this.editForm.newPassword,
                        'pathId': this.editForm.pathId,
                        'permissions[role]': this.editForm.permissions.role ? 0 : 1,
                        'permissions[disabled]': this.editForm.permissions.disabled ? 1 : 0
                    },
                }).then((res) => {
                    if (res.data.code == 200) {
                        this.$message.success('添加成功');
                        this.refreshUserInfo();
                    } else {
                        this.$message.error('添加失败');
                    }
                }).catch((error) => {
                    this.$message.error('添加失败');
                })
            } else {
                // 修改
                const formData = new FormData();
                formData.append('loginId', localStorage.getItem('userId'));
                formData.append('id', this.editForm.id);
                if (this.editForm.username != tableData.username) {
                    formData.append('username', this.editForm.username);
                    count++;
                }

                if (this.editForm.newPassword != undefined && this.editForm.newPassword != '') {
                    formData.append('password', this.editForm.newPassword);
                    count++;
                }
                if (this.editForm.pathId != tableData.pathId) {
                    formData.append('pathId', this.editForm.pathId);
                    count++;
                }

                let role = this.editForm.permissions.role ? 0 : 1
                let disabled = this.editForm.permissions.disabled ? 1 : 0

                if (role != tableData.permissions.role) {
                    formData.append('permissions[role]', this.editForm.permissions.role ? 0 : 1)
                    count++;
                }
                if (disabled != tableData.permissions.disabled) {
                    formData.append('permissions[disabled]', this.editForm.permissions.disabled ? 1 : 0)
                    count++;
                }

                if (count > 0) {
                    axios({
                        url: '/user/modifyUser',
                        method: 'post',
                        data: formData,
                    }).then((res) => {
                        if (res.data.code == 200) {
                            this.$message.success('修改成功');
                            this.refreshUserInfo();
                        } else {
                            this.$message.error('修改失败');
                        }
                    }).catch((error) => {
                        this.$message.error('修改失败:' + error);
                    });
                } else {
                    this.$message.success('未修改');
                }
            }

            this.dialogVisible = false
        },
        addNewUser() {
            this.editForm = {
                id: '',
                username: '',
                newPassword: '',
                pathId: '',
                permissions: {
                    role: false,
                    disabled: false
                }
            },
                this.dialogTitle = '添加用户';
            this.dialogVisible = true;
        },
        // 删除用户
        deleteUser(row) {
            axios({
                url: '/user/adminDeleteUser',
                method: 'post',
                headers: {
                    'Content-Type': 'multipart/form-data;'
                },
                data: {
                    'loginId': localStorage.getItem('userId'),
                    'userId': row.id,
                },
            }).then((res) => {
                if (res.data.code == 200) {
                    this.$message.success('删除成功');
                    this.refreshUserInfo();
                } else {
                    this.$message.error('删除失败');
                }
            }).catch((error) => {
                this.$message.error('删除失败');
            })
        }


    },
};
</script>


<style>
.el-table .warning-row {
    --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

.el-table .success-row {
    --el-table-tr-bg-color: var(--el-color-success-light-9);
}

.el-table .blue-row {
    --el-table-tr-bg-color: #d9ecff;
}

.el-dialog {
    border-radius: 10px !important;
    border: 1px
}
</style>
