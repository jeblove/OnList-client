<template>
    <el-switch v-model="tableBorder" inactive-text="表格边框" />
    <el-table :data="tableData" stripe style="width: 100%" :border="tableBorder">
        <el-table-column type="expand">
            <template #default="props">
                <el-table :data="props.row.linkUserTableData" stripe style="width: 100%" :border="tableBorder">
                    <el-table-column label="用户" prop="user" />
                    <el-table-column label="总链接数" prop="count" />
                </el-table>
            </template>
        </el-table-column>
        <el-table-column prop="fileId" label="文件ID" width="auto" />
        <el-table-column prop="linkNum" label="链接数" width="auto" />
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
                const res = await axios.post('/fileLink/getAllFileLinkInfo');
                if (res.data.code === 200) {
                    this.tableData = res.data.data.map(row => ({ ...row, linkUserTableData: this.formatLinkUserMap(row) }));
                } else {
                    this.$message.error('获取文件链接列表失败:' + res.data.message);
                }
            } catch (error) {
                this.$message.error('请求文件链接列表接口时发生错误:' + error);
            }
        },
        formatLinkUserMap(row) {
            return Object.entries(row.linkUserMap).map(([user, count]) => ({ user, count }));
        },
    },
};
</script>


<style></style>
