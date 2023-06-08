<template>
    <div v-for="(key, index) in resultData">
        <div class="fileDiv">
            <a href="#" class="fileA" @click="clickFile(key.type, key.label, key.id)">
                <span class="fileMarginLeft"></span>
                <font-awesome-icon v-if="key.type == 0" icon="fa-solid fa-file" />
                <font-awesome-icon v-if="key.type == 1" icon="fa-solid fa-folder-open" />
                <span class="fileMarginLeft"></span>
                <p>{{ key.label }}</p>
                <!-- {{ key }} -->
            </a>

            <!-- 列表按钮 -->
            <!-- 复制 -->
            <el-button class="fileButton" type="success" slot="reference" circle
                @click="preHandleCpAMv(key.label, 'cp', key.type)">
                <font-awesome-icon icon="copy" />
            </el-button>

            <!-- 剪切 -->
            <el-button class="fileButton" type="warning" slot="reference" circle
                @click="preHandleCpAMv(key.label, 'mv', key.type)">
                <font-awesome-icon icon="scissors" />
            </el-button>

            <!-- 重命名 -->
            <el-button class="fileButton" type="info" slot="reference" circle @click="openRenameFun(key.label, key.type)">
                <font-awesome-icon icon="file-signature" />
            </el-button>

            <!-- 删除 -->
            <el-popconfirm title="确定要删除该文件吗？" @confirm="handleButtonDelete(key.label, key.type)">
                <template #reference>
                    <el-button class="fileButton" type="danger" slot="reference" circle>
                        <font-awesome-icon icon="trash" />
                    </el-button>
                </template>
            </el-popconfirm>

        </div> <!-- fileDiv -->
    </div>
    <template v-if="resultData.length == 0">
        <p class="fileEmpty">
            <el-text class="mx-1" type="warning" size="large">
                目录为空
            </el-text>
        </p>
    </template>
</template>

<script>
import axios from '@/utils/axios';
export default {
    name: "FileList",
    components: {

    },
    data() {
        return {
            // 文件列表
            resultData: [],
            // 目录路径
            rout: '/',
            // 用户id
            userId: '646e1eba859e82211d3bc5c2',
        };

    },
    created() {
        this.getData();
    },
    methods: {
        // 获取路径
        getData() {
            axios({
                url: '',
                method: 'get',
                params: {
                    route: this.rout
                }
            }).then((res) => {
                // console.log(res.data.data)
                // this.treeData = this.formatData(res.data.data.content);
                this.resultData = this.loadData(res.data.data);
            }).catch((error) => {
                console.log(error);
                this.resultData = [];
                // this.$message.error('目录为空');

            });
        },
        // 遍历路径
        loadData(data) {
            const result = []

            for (const key in data) {
                const item = {
                    label: key,
                    id: data[key].fileLinkId,
                    type: data[key].type,
                    suffix: data[key].suffix,
                    content: data[key].content,
                };
                if (data[key].type === 1) {

                    item.children = this.loadData(data[key].content);

                } else if (data[key].type === 0) {
                    // 非叶子节点需要在名称后面添加文件后缀名
                    item.label = `${item.label}.${item.suffix}`
                }
                result.push(item);
            }
            // console.log("result:"+result)
            return result;
        },
        // 点击
        clickFile(type, label, id) {
            // console.log(key.id)
            if (type == 0) {
                // 下载文件
                this.downloadNodeClick(type, label, id);

            } else if (type == 1) {
                // 进入该目录

                // this.rout = this.rout + label + '/'

                this.breadcrumbPaths.push(label);
                this.rout += (label + '/');

                this.getData()
            }
        },


    }
}
</script>