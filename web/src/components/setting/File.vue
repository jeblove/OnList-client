<template>
    表格边框: <el-switch v-model="tableBorder" />
    <el-table :data="tableData" stripe style="width: 100%" :border="tableBorder">
        <el-table-column type="expand">
            <template #default="props">
                <el-table :data="[props.row]" stripe style="width: 100%" :border="tableBorder">
                    <el-table-column label="文件ID" prop="id" />
                    <el-table-column prop="uploadDate" label="上传日期">
                        <template #default="props">
                            {{ formatDateTime(props.row.uploadDate) }}
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </el-table-column>
        <el-table-column prop="filename" label="文件名" width="auto" />
        <el-table-column prop="length" label="文件大小" width="auto">
            <template #default="props">
                {{ formatFileSize(props.row.length) }}
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
                const res = await axios.post('/file/getAllFileInfo');
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
        formatFileSize(bytes) {
            if (bytes === 0) return '0 MB';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));

            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
    },
};
</script>
