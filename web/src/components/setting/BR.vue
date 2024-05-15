<template>

    <el-row type="flex" justify="start">
        <el-button type="info" size="small" @click="refreshUserInfo()">刷新</el-button>
        <el-button type="primary" size="small" @click="execBackup()">创建备份</el-button>
        <el-button type="primary" size="small">
            <el-upload class="upload-demo" :file-list="fileList" :upload-action="''" :before-upload="handleBeforeUpload"
                :show-file-list="false" :headers="uploadHeaders">
                上传备份
            </el-upload>
        </el-button>
    </el-row>

    <el-progress v-if="isBackingUp" :percentage="progressPercentage" :status="progressStatus" striped striped-flow
        :duration="10" />

    <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="file" label="备份文件" width="auto" />

        <el-table-column fixed="right" label="操作" width="200">
            <template #default="{ row }">
                <el-button type="info" size="small" @click="downloadBackup(row)">下载</el-button>
                <el-button type="success" size="small" @click="openDialog(row)">恢复</el-button>
                <el-button type="danger" size="small" @click="deleteBackup(row)">删除</el-button>
            </template>
        </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="恢复数据" width="300" align-center>
        <el-form :model="editForm" label-width="auto">
            <el-form-item label="是否删除当前数据再恢复？">
                <el-switch v-model="editForm.drop" inactive-text="否" active-text="是" />
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="restoreChanges()">恢复</el-button>
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
            editForm: {
                file: '',
                drop: false,
            },
            index: 0,
            isBackingUp: false,
            progressPercentage: 0,
            progressStatus: '',
            backupTimeoutId: null,
            // 设置预计备份时间（秒）
            estimatedBackupTimeSeconds: 30,
            // 设置模拟进度的最大值，防止真实响应晚于预期
            maxSimulatedProgress: 0.9,
            uploadHeaders: {
                //在这里添加上传请求头信息
            },
            // 默认上传文件
            fileList: [],
        };
    },
    async created() {
        this.refreshUserInfo();
    },
    methods: {
        // 刷新数据列表
        async refreshUserInfo() {
            try {
                const res = await axios.post('/br/backupFileList');
                if (res.data.code === 200) {
                    this.tableData = res.data.data.map(file => ({ file }));
                } else {
                    this.$message.error('获取文件列表失败:' + res.data.message);
                }
            } catch (error) {
                this.$message.error('请求文件列表接口时发生错误:' + error);
            }
        },
        deleteBackup(row) {
            axios({
                url: '/br/deleteBackup',
                method: 'post',
                headers: {
                    'Content-Type': 'multipart/form-data;'
                },
                data: {
                    'filename': row.file,
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
        },
        execBackup() {
            this.isBackingUp = true;
            this.progressPercentage = 0;
            this.progressStatus = '';
            this.incrementBackupProgress();

            axios({
                url: '/br/backup',
                method: 'post',
            }).then((res) => {
                clearTimeout(this.backupTimeoutId);
                if (res.data.code === 200) {
                    this.progressPercentage = 100;
                    this.progressStatus = 'success';
                    this.$message.success('备份成功');
                    this.refreshUserInfo();
                } else {
                    this.progressStatus = 'exception';
                    this.$message.error('备份失败');
                }
                this.isBackingUp = false;
            }).catch((error) => {
                clearTimeout(this.backupTimeoutId);
                this.progressStatus = 'exception';
                this.$message.error('备份失败');
                this.isBackingUp = false;
            });
        },
        // 进度条进度
        incrementBackupProgress() {
            this.backupTimeoutId = setTimeout(() => {
                this.progressPercentage += 100 / this.estimatedBackupTimeSeconds;
                this.progressPercentage = Math.min(Math.floor(this.progressPercentage), this.maxSimulatedProgress * 100);

                if (this.progressPercentage <= this.maxSimulatedProgress * 100) {
                    this.incrementBackupProgress();
                }
            }, 1000);
        },
        // 执行恢复
        restoreBackup(filename, drop) {
            this.isBackingUp = true;
            this.progressPercentage = 0;
            this.progressStatus = '';
            this.incrementBackupProgress();

            axios({
                url: '/br/restore',
                method: 'post',
                headers: {
                    'Content-Type': 'multipart/form-data;'
                },
                data: {
                    'filename': filename,
                    'drop': drop,
                },
            }).then((res) => {
                clearTimeout(this.backupTimeoutId);
                if (res.data.code === 200) {
                    this.progressPercentage = 100;
                    this.progressStatus = 'success';
                    this.$message.success('恢复成功');
                    this.refreshUserInfo();
                } else {
                    this.progressStatus = 'exception';
                    this.$message.error('恢复失败');
                }
                this.isBackingUp = false;
            }).catch((error) => {
                clearTimeout(this.backupTimeoutId);
                this.progressStatus = 'exception';
                this.$message.error('恢复失败');
                this.isBackingUp = false;
            });
        },
        openDialog(row) {
            this.editForm = {
                drop: false,
            },
                this.editForm.file = row.file;
            this.dialogVisible = true;
        },
        // dialog框恢复按钮
        restoreChanges() {
            this.restoreBackup(this.editForm.file, this.editForm.drop)
            this.dialogVisible = false
        },
        // 上传备份文件
        handleBeforeUpload(file) {
            this.isBackingUp = true;
            this.progressPercentage = 0;
            this.progressStatus = '';
            this.incrementBackupProgress();

            const formData = new FormData();
            formData.append('file', file);
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };
            return axios.post('/br/uploadBackup', formData, config)
                .then((response) => {
                    if (response.data.code == 200) {
                        this.progressPercentage = 100;
                        this.progressStatus = 'success';
                        this.$message.success('上传成功');
                        this.refreshUserInfo();
                    } else {
                        this.$message.error('上传失败');
                        this.progressStatus = 'exception';
                    }
                    this.isBackingUp = false;
                    // 取消el-upload组件上传
                    return false;
                })
                .catch((err) => {
                    // 上传出错处理
                    this.$message.error('上传失败');
                    clearTimeout(this.backupTimeoutId);
                    this.progressStatus = 'exception';
                    this.isBackingUp = false;
                    return false;
                });
        },
        // 下载备份文件
        downloadBackup(row) {
            axios({
                url: '/br/downloadBackup',
                method: 'get',
                responseType: 'blob',
                params: {
                    filename: row.file,
                }
            }).then((res) => {
                const contentType = res.headers['content-type']
                const blob = new Blob([res.data], { type: contentType })
                const fileName = row.file
                // 下载文件
                if (window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveBlob(blob, fileName)
                } else {
                    const link = document.createElement('a')
                    const url = URL.createObjectURL(blob)

                    link.href = url
                    link.download = fileName
                    link.click()

                    URL.revokeObjectURL(link.href)  // 释放资源
                }
            });
        },

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
</style>