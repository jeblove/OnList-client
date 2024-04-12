<template>
    
    <el-row type="flex" justify="start">
        <el-button type="info" size="small" @click="refreshUserInfo()">刷新</el-button>
        <el-switch v-model="tableBorder" inactive-text="表格边框" />
    </el-row>

    <el-table :data="tableData" style="width: 100%" :border="tableBorder" :row-class-name="tableRowClassName">
        <el-table-column type="expand">
            <template #default="props">
                <el-table :data="[props.row]" stripe style="width: 100%" :border="tableBorder">
                    <el-table-column label="访问上限" prop="visitLimit" width="100" />
                    <el-table-column label="访问次数" prop="visits" width="100" />
                    <el-table-column prop="uploadDate" label="创建时间">
                        <template #default="props">
                            {{ formatDateTime(props.row.createTime) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="过期时间" prop="uploadDate">
                        <template #default="props">
                            {{ formatDateTime(props.row.expireTime) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="下载链接" prop="downloadUrl" />
                </el-table>
            </template>
        </el-table-column>
        <el-table-column prop="username" label="用户" width="100" />
        <el-table-column prop="fileLinkId" label="分享文件ID" width="auto" />
        <el-table-column prop="expired" label="是否过期" width="auto" />

        <el-table-column fixed="right" label="操作" width="135">
            <template #default="{ row }">
                <el-button type="danger" size="small" @click="deleteShare(row)">删除</el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
import axios from '@/utils/axios';

export default {
    data() {
        return {
            tableData: [],
            tableBorder: false,
        };
    },
    async created() {
        this.refreshUserInfo();
    },
    methods: {
        // 刷新数据列表
        async refreshUserInfo() {
            try {
                const res = await axios.post('/share/getAllShareInfo');
                if (res.data.code === 200) {
                    this.tableData = res.data.data;
                } else {
                    this.$message.error('获取文件列表失败:' + res.data.message);
                }
            } catch (error) {
                this.$message.error('请求文件列表接口时发生错误:' + error);
            }
        },
        formatDateTime(dateTimeStr) {
            const date = new Date(dateTimeStr);
            return date.toLocaleString();
        },
        tableRowClassName({ row }) {
            if (row.expired) {
                return 'warning-row';
            } else {
                return 'success-row';
            }
            return '';
        },
        deleteShare(row) {
            axios({
                url: '/share/deleteShareLink',
                method: 'post',
                headers: {
                    'Content-Type': 'multipart/form-data;'
                },
                data: {
                    'id': row.id,
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
</style>