<template>

    <el-container>
        <el-header class="header-content">
            <div class="header-div">
                <span>文件列表</span>

                <!-- 面包屑导航 -->
                <el-breadcrumb separator="/" class="breadcrumb">
                    <el-breadcrumb-item v-for="(path, index) in breadcrumbPaths" :key="index" class="breadcrumb-item">
                        <a href="#" @click="handleClickBreadcrumb(index)">
                            <font-awesome-icon v-if="index===0" icon="fa-solid fa-house" />
                            {{ path }}
                        </a>
                    </el-breadcrumb-item>
                </el-breadcrumb>

                <!-- 按钮组 -->
                <el-button-group class="ml-4 button-group" >
                    
                    <!-- 粘贴 -->
                    <el-button type="success" @click="handlePaste()" 
                        v-if="operateCpAMv != null"
                    >
                        <font-awesome-icon icon="paste" />
                    </el-button>

                    <!-- 上传按钮 -->
                    <el-button type="primary" >
                        <el-upload
                        class="upload-demo"
                        :file-list="fileList"
                        :upload-action="''"
                        :before-upload="handleBeforeUpload"
                        :show-file-list="false"
                        :headers="uploadHeaders"
                        >
                            <font-awesome-icon icon="upload" />
                        </el-upload>
                    </el-button>
                    
                    <!-- 创建目录 -->
                    <el-button type="primary" @click="openMkDir = true" >
                        <font-awesome-icon icon="folder-plus" />
                    </el-button>

                </el-button-group>


            </div>
        </el-header>

        <!-- 创建目录dialog -->
        <el-dialog v-model="openMkDir" title="创建目录" width="30%" draggable>
            <el-form :inline="true">
                <el-form-item label="目录名：">
                    <el-input v-model="inputMkDirName" placeholder="Please input ..." clearable />
                </el-form-item>
                <el-form-item>
                    <el-button @click="openMkDir = false">取消</el-button>
                    <el-button type="primary" @click="handleButtonMkDir(this.inputMkDirName)">
                    创建
                    </el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        
        <!-- 重命名dialog -->
        <el-dialog v-model="openRename" title="重命名" width="30%" draggable>
            <el-form :inline="true">
                <el-form-item label="新名：">
                    <el-input v-model="renameNew" placeholder="Please input ..." clearable />
                </el-form-item>
                <el-form-item>
                    <el-button @click="openRename = false">取消</el-button>
                    <el-button type="primary" @click="handleButtonRename(this.renameNew)">
                    更改
                    </el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!-- 预览dialog -->
        <el-dialog v-model="previewVisible" :close-on-click-modal="true" :show-close="true" @close="previewClose">
            <template v-if="previewFileType=='image'">
                <img :src="previewURL" style="max-width: 100%; max-height: 100%;" />
            </template>
            <template v-else-if="previewFileType=='video'">
                <vue3VideoPlay v-bind="previewVideo" v-if="showVideo" />
            </template>
            <template v-else>
                <p>{{ previewContent }}</p>
            </template>

        </el-dialog>
        
        <!-- 右键菜单框 -->
        <AgelContextMenu 
            v-model="contextMenu.show" 
            :x="contextMenu.x" 
            :y="contextMenu.y" 
            :menus="computedMenuData"
            @select="onSelect($event)" 
        />

        <!-- 创建链接分享框 -->
        <el-dialog v-model="shareDialogVisible" title="文件分享" width="500px" align-center>
        <el-form :model="shareEditForm" label-width="100px">
            <el-form-item label="分享文件" :required="true">
                <el-input v-model="shareEditForm.filename" disabled />
            </el-form-item>
            <el-form-item label="有效小时" :required="true">
                <el-tooltip class="box-item" effect="dark" content="指定小时后无法访问" placement="right-start">
                    <el-input v-model="shareEditForm.expireDuration" />
                </el-tooltip>
            </el-form-item>
            <el-form-item label="最大访问次数" :required="true">
                <el-tooltip class="box-item" effect="dark" content="达到上限访问次数后无法访问" placement="right-start">
                    <el-input v-model="shareEditForm.visitLimit" />
                </el-tooltip>
            </el-form-item>
        </el-form>
        <el-form-item v-if="shareDownloadLink" class="share-download-link-container" label="分享链接">
            <el-input
                readonly
                clearable
                autosize
                placeholder="点击复制链接"
                type="textarea"
                v-model="shareDownloadLink"
                @copy="handleCopyLink"
            />
        </el-form-item>
        <span slot="footer" class="dialog-footer">
            <el-button @click="shareDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="createShare()" v-if="!shareDownloadLink">创建分享</el-button>
        </span>
    </el-dialog>

        <!-- :menus="contextMenu.data" -->
        <!-- 文件列表 -->
        <el-main class="main" >
            <div v-for="(key, index) in resultData">
                <div class="fileDiv">
                    <a href="#" class="fileA" 
                        @click="clickFile(key)"
                        @contextmenu.prevent="onContextmenu($event, key)"
                    >
                    <!-- @click="clickFile(key.type, key.label, key.id)" -->
                        <span class="fileMarginLeft"></span>
                        <font-awesome-icon v-if="key.type==0" icon="fa-solid fa-file" />
                        <font-awesome-icon v-if="key.type==1" icon="fa-solid fa-folder-open" />
                        <span class="fileMarginLeft"></span>
                        <p>{{ key.label }}</p>
                        <!-- {{ key }} -->
                    </a>

                    <!-- 列表按钮 -->



                </div> <!-- fileDiv -->
            </div>
            <template v-if="resultData.length==0">
                    <p class="fileEmpty">
                        <el-text class="mx-1" type="warning" size="large">
                            目录为空
                        </el-text>
                    </p>
            </template>
            <!-- {{ this.rout }} -->
        </el-main>
    </el-container>
</template>

<script>
import axios from '@/utils/axios';
import { ElContainer, ElHeader, ElMain, ElTree, ElUpload, ElNotification } from "element-plus";
import { reactive } from "vue";
import { ElMessage } from 'element-plus'

export default {
    name: "showPath",
    components: {
        ElContainer,
        ElHeader,
        ElMain,
        ElTree,
        ElUpload,
        ElNotification,
        ElMessage,
        
    },
    data() {
        return {
            // treeData: [], // 树形数据
            // 文件列表
            resultData: [],
            // 目录路径
            rout: '/',
            breadcrumbPaths: ['index'],

            uploadUrl: '/file/upload',
            // 用户id
            userId: '646e1eba859e82211d3bc5c2',
            fileList: [],
            // 当前路径
            pathList: [],
            uploadHeaders: {
                //在这里添加请求头信息
            },
            // 创建目录dialog默认关闭
            openMkDir: false, 
            // 目录名变量
            inputMkDirName: '',
            // 复制、剪切参数
            formDataCpAMv: null,
            // 复制还是剪切操作
            operateCpAMv: null,
            // 复制、剪切的文件还是目录
            operateCpAMvFileType: null,
            // 重命名dialog默认关闭
            openRename: false,
            // 重命名旧名变量
            renameOld: '',
            // 重命名新名变量
            renameNew: '',
            // 重命名文件还是目录
            renameType: null,
            // 预览链接
            previewURL: '',
            // 预览dialog默认关闭
            previewVisible: false,
            // 预览文件类型
            previewFileType: '',
            // 预览文本内容
            previewContent: '',
            // 控制开关视频显示
            showVideo: false,
            // 可预览后缀
            suffixTypeMap: {
                    image: ['jpg', 'jpeg', 'png', 'gif'],
                    video: ['mp4', 'avi', 'wmv', 'mov'],
                    text: ['txt', 'doc', 'docx', 'pdf']
            },
            fullScreen: false,
            selectedKey: null,
            contextMenu: {
                show: false,
                x: 0,
                y: 0,
                data: [
                    // {
                    //     title: '预览',
                    //     command: 'preview',
                    //     icon: 'magnifying-glass',
                    // },
                    {
                        title: '复制',
                        command: 'copy',
                        icon: 'CopyDocument',
                    },
                    {
                        title: '剪切',
                        command: 'scissors',
                        icon: 'Scissor',
                    },
                    {
                        title: '重命名',
                        command: 'rename',
                        icon: 'EditPen',
                    },
                    {
                        title: '删除',
                        command: 'trash',
                        icon: 'Delete',
                    },
                ],
                
            },
            // 分享框
            tableData: [],
            shareDialogVisible: false,
            shareEditForm: {
                filename: '',
                fileLinkId: '',
                expireDuration: 24,
                visitLimit: 5
            },
            // 分享文件下载链接
            shareDownloadLink: '',
            // 赋值到剪贴板
            clipboardSupported: false,
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
                },
                // headers: {
                //     Authorization: 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJoYW5zMiIsImNyZWF0ZWQiOjE2ODU4Njk1MjE0MzIsImV4cCI6MTY4OTQ2OTUyMX0.87vXHkm2GImC0kWcIM0_oF7Wkii0dLyi046hoPDdGe-NcpggDo4Be7bLxydhKZ08lBVCwSBxh0wzSnKRo5TDKw'
                // }
            }).then((res) => {
                // console.log(res.data.data)
                // this.treeData = this.formatData(res.data.data.content);
                this.resultData = this.loadData(res.data.data);
            }).catch((error) => {
                console.log(error);
                this.resultData = [];
                // this.$message.error('目录为空');
                if(error.response.status==403){
                    // 跳转到登录
                }
            });
        },

        // 遍历路径
        loadData(data){
            const result = []

            for(const key in data){
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
        clickFile(key){
            // console.log(key.id)
            let type = key.type
            if(type==0){
                // 下载文件
                // this.downloadNodeClick(type, label, id);
                this.preview(key.suffix, key.id)
                
            }else if(type==1){
                // 进入该目录

                // this.rout = this.rout + label + '/'

                this.breadcrumbPaths.push(key.label);
                this.rout += (key.label + '/');

                this.getData()
            }
        },

        // 下载文件
        downloadNodeClick(type, label, id) {
            if (type == 0) {
                // console.log(type)
                // console.log(id)
                axios({
                    url: '/file/downloadFileByFileLinkId',
                    method: 'get',
                    responseType: 'blob',
                    params: {
                        fileLinkId: id,
                    }
                }).then((res) => {
                    const contentType = res.headers['content-type']
                    const blob = new Blob([res.data], { type: contentType })
                    const fileName = label
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
                })
            }
        },

        // 面包屑跳转
        handleClickBreadcrumb(index) {
            const allPaths = this.breadcrumbPaths.slice(1, index + 1);
            const newRout = "/" + (allPaths.length ? allPaths.join("/") + "/" : "");
            this.rout = newRout;
            this.getData();
            this.breadcrumbPaths.splice(index + 1);
        },

        // 更新当前pathList
        updatePathList(){
            // const routVar = this.rout;
            // 用/分隔，并除去空字符串，赋值给数组
            // !!转换成布尔两次，用于去除null、undefined、0
            const routList = this.rout.split('/').filter(route => !!route);
            this.pathList = routList;
        },

        // 上传文件
        handleBeforeUpload(file) {

            this.updatePathList();

            const formData = new FormData();
            formData.append('uploadFile', file);
            formData.append('userId',this.userId);
            formData.append('pathList', this.pathList);
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };
            return axios.post(this.uploadUrl, formData, config)
            .then((response) => {
                // console.log(response.data);
                // file.url = response.data.url;
                if(response.data.code==200){
                    this.fileList.push(file);
                    console.log('上传成功');
                    this.$message.success('上传成功');
                    this.getData();
                }else{
                    this.$message.error('上传失败');
                }
                // 取消el-upload组件上传
                return false;
            })
            .catch((err) => {
                // 上传出错处理
                this.$message.error('上传失败');
                return false;
            });
        },

        // 删除按钮
        handleButtonDelete(filename, type){
            console.log(`要删除的文件名为：${filename}`);
            this.updatePathList();
            const formData = new FormData();
            formData.append('userId', this.userId);
            formData.append('pathList', this.pathList);

            if(type==0){
                // 文件
                this.$confirm('确定要删除该文件吗？', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    formData.append('filename', filename);
                    axios({
                        url: '/file/deleteFile',
                        method: 'post',
                        data: formData,
                    }).then((res) => {
                        // console.log(res.data)
                        if(res.data.code==200){
                            this.$message.success('删除文件成功');
                            this.getData();
                        }else{
                            this.$message.error('删除文件失败');
                        }
                    }).catch((res)=>{
                        this.$message.error('删除文件失败');
                    });
                }).catch(() => {
                    // 用户取消删除操作
                    this.$message({
                        type: 'info',
                        message: '已取消删除操作'
                    });
                });
            }else{
                // 目录，二级弹窗
                this.$confirm('确定要删除该目录吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {

                    formData.append('folderName', filename);
                    axios({
                        url: '/path/deleteDir',
                        method: 'post',
                        data: formData,
                    }).then((res) => {
                        // console.log(res.data)
                        if(res.data.code==200){
                            this.$message.success('删除目录成功');
                            this.getData();
                        }else{
                            this.$message.error('删除目录失败');
                        }
                    }).catch((res)=>{
                        this.$message.error('删除目录失败');
                    });
                }).catch(() => {
                    // 用户点击了取消按钮
                });            
            }
        },

        // 创建目录
        handleButtonMkDir(folderName){
            this.updatePathList();
            console.log(this.pathList);

            const formData = new FormData();
            formData.append('userId', this.userId);
            formData.append('folderName', folderName);
            formData.append('pathList', this.pathList);

            console.log(formData)

            axios({
                url: '/path/createDir',
                method: 'post',
                data: formData,
                
            }).then((res) => {
                // console.log(res.data);
                if(res.data.code==200){
                    this.$message.success('创建目录成功');
                    this.getData();
                }else{
                    this.$message.error('创建目录失败');
                }
            }).catch((res) => {
                this.$message.error('创建目录失败');
            })
            this.openMkDir = false;
        },

        // 复制和剪切预处理
        preHandleCpAMv(filename, operate, type){
            this.updatePathList();
            const originPathList = this.pathList;
            const formData = new FormData();
            // formData.append('userId', this.userId);
            formData.append('filename', filename);
            formData.append('pathList', originPathList);
            this.formDataCpAMv = formData;

            var msg = '';
            if(operate=='cp'){
                msg = '已复制';
                this.operateCpAMv = 'cp';
            }else if(operate=='mv'){
                msg = '已剪切';
                this.operateCpAMv = 'mv';
            }

            if(type==0){
                // 对文件操作
                this.operateCpAMvFileType = 0;
            }else if(type==1){
                // 对目录操作
                this.operateCpAMvFileType = 1;
            }
            this.$message.success(msg+'，请粘贴');
        },

        // 粘贴，执行复制、剪切操作
        handlePaste(){
            this.updatePathList();
            this.formDataCpAMv.append('userId', this.userId);
            this.formDataCpAMv.append('targetPathList', this.pathList);
            const formData = this.formDataCpAMv;
            console.log(Object.fromEntries(formData.entries()));
            
            console.log('this.operateCpAMvFileType:'+this.operateCpAMvFileType);
            console.log('this.operateCpAMv:'+this.operateCpAMv);

            var url = '';
            var msg = '';
            if(this.operateCpAMvFileType==0 && this.operateCpAMv=='cp'){
                // 文件复制
                url = '/file/cpFile';
                msg = '文件复制';
            }else if(this.operateCpAMvFileType==0 && this.operateCpAMv=='mv'){
                // 文件剪切
                url = '/file/mvFile';
                msg = '文件剪切';
            }else if(this.operateCpAMvFileType==1 && this.operateCpAMv=='cp'){
                // 目录复制
                url = '/path/cpDir';
                msg = '目录复制';
            }else if(this.operateCpAMvFileType==1 && this.operateCpAMv=='mv'){
                // 目录剪切
                url = '/path/mvDir';
                msg = '目录剪切';
            }

            console.log(url);

            axios({
                url: url,
                method: 'post',
                data: formData,
            }).then((res) => {
                // console.log(res.data)
                if(res.data.code==200){
                    this.$message.success(msg+'成功');
                }else{
                    this.$message.error(msg+'失败');
                }
                this.getData();
            }).catch((res) => {
                this.$message.error(msg+'失败');
            });
            this.formDataCpAMv = null;
            this.operateCpAMv = null;
            this.operateCpAMvFileType = null;

        },

        // 打开重命名dialog
        openRenameFun(label, type){
            this.renameOld = label;
            this.renameNew = label;
            this.renameType = type;
            this.openRename = true;
        },

        // 重命名
        handleButtonRename(renameNew){
            // renameNew新名变量

            this.updatePathList();

            var url = '';
            if(this.renameType==0){
                url = '/file/renameFile';
            }else if(this.renameType==1){
                url = '/path/renameDir';
            }

            const formData = new FormData();
            formData.append('userId', this.userId);
            formData.append('filename', this.renameOld);
            formData.append('pathList', this.pathList);
            formData.append('newName', renameNew);

            console.log(Object.fromEntries(formData.entries()));

            axios({
                url: url,
                method: 'post',
                data: formData,
            }).then((res) => {
                // console.log(res.data);
                if(res.data.code==200){
                    console.log(res.data)
                    this.$message.success('重命名成功');
                    this.getData();
                }else{
                    this.$message.error('重命名失败');
                }
            }).catch((error) => {
                this.$message.error('重命名失败');
            })
            this.openRename = false;
        },
        // 检测是否支持该文件后缀格式
        isSupportedSuffix(suffix) {
            for (const type in this.suffixTypeMap) {
                if (this.suffixTypeMap[type].includes(suffix)) {
                    return true;
                }
            }
            return false;
        },

        // 预览
        preview(suffix, id){
            if (!this.isSupportedSuffix(suffix)) {
                this.$message.error(`不支持"${suffix}"格式的文件预览`);
                return;
            }

            axios({
                url: '/file/downloadFileByFileLinkId',
                method: 'get',
                responseType: 'blob',
                params: {
                    fileLinkId: id,
                },
            }).then(res => {
                this.previewURL = URL.createObjectURL(new Blob([res.data]));

                let fileType = 'other';
                for (const type in this.suffixTypeMap) {
                    if (this.suffixTypeMap[type].includes(suffix)) {
                    fileType = type;
                    break;
                    }
                }
                this.previewFileType = fileType;

                if(fileType=='image'){
                    // this.previewURL = 
                }else if(fileType=='video'){
                    console.log('视频预览')
                    this.previewVideo = reactive({
                        width: "100%",
                        height: "100%",
                        src: this.previewURL,
                    })
                    this.showVideo = true;
                }else{
                    // text
                    const reader = new FileReader();
                    reader.readAsText(res.data);
                    reader.onload = (event) => {
                        this.previewContent = event.target.result;
                    }
                }

                this.previewVisible = true;
            })

        },

        // 关闭预览
        previewClose(){
            this.showVideo = false;
            this.previewVisible=false;

        },
        // 右键菜单项目时
        onContextmenu(e, key) {
            this.contextMenu.show = true
            this.contextMenu.x = e.clientX
            this.contextMenu.y = e.clientY
            // 传递key到对应菜单项目中
            this.selectedKey = key;
            e.preventDefault()
        },
        // 右键菜单选中项目操作
        onSelect(item) {
            // ElMessage.success('选中了' + item.title)
            let key = this.selectedKey;
            if(item.command == 'download'){
                // console.log('预览操作')
                // this.preview(key.suffix,key.id)
                this.downloadNodeClick(key.type, key.label, key.id);

            }else if(item.command == 'copy'){
                this.preHandleCpAMv(key.label,'cp',key.type)

            }else if(item.command == 'scissors'){
                this.preHandleCpAMv(key.label,'mv',key.type)

            }else if(item.command == 'rename'){
                this.openRenameFun(key.label,key.type)

            }else if (item.command === 'trash') {
                this.handleButtonDelete(key.label, key.type);
                // this.$confirm('确定要删除该文件吗？', '警告', {
                //     confirmButtonText: '确定',
                //     cancelButtonText: '取消',
                //     type: 'warning'
                // }).then(() => {
                //     this.handleButtonDelete(key.label, key.type);
                // }).catch(() => {
                //     // 用户取消删除操作
                //     this.$message({
                //         type: 'info',
                //         message: '已取消删除操作'
                //     });
                // });
            }else if (item.command === 'share') {
                this.shareEditForm = {
                    filename: '',
                    fileLinkId: '',
                    expireDuration: 24,
                    visitLimit: 5
                },
                this.shareDownloadLink = '',

                this.shareDialogVisible = true;
                this.shareEditForm.fileLinkId = key.id;
                this.shareEditForm.filename = key.label;
            }
        },
        // 分享文件
        createShare(){
            axios({
                url: '/share/createShareLink',
                method: 'post',
                headers: {
                    'Content-Type': 'multipart/form-data;'
                },
                data: {
                    'username': localStorage.getItem('username'),
                    'fileLinkId': this.shareEditForm.fileLinkId,
                    'expireDuration': this.shareEditForm.expireDuration,
                    'visitLimit': this.shareEditForm.visitLimit
                },
            }).then((res) => {
                if (res.data.code == 200) {
                    this.$message.success('创建分享成功');
                    this.shareDownloadLink = axios.defaults.baseURL + res.data.data.downloadUrl;

                    if (this.clipboardSupported) {
                        navigator.clipboard.writeText(this.shareDownloadLink).then(() => {
                        this.$message.success('链接已自动复制到剪贴板');
                        }, () => {
                        this.$message.error('复制链接到剪贴板失败，请手动复制');
                        });
                    } else {
                        this.$message.info('您的浏览器暂不支持自动复制链接到剪贴板，请手动复制');
                    }
                } else {
                    this.$message.error('创建分享失败');
                }
            }).catch((error) => {
                this.$message.error('创建分享失败');
            })
        },
        handleCopyLink() {
            this.$message.success('链接已复制到剪贴板');
        },
        

    }, // methods_end

    computed: {
        // 计算属性
        // 根据key.type动态生成菜单项
        computedMenuData() {
            // 如果没有选中的key，则直接返回默认的菜单项
            if (!this.selectedKey) return this.contextMenu.data;
            
            // 根据key.type决定是否添加预览菜单项
            const menuData = [...this.contextMenu.data]; 
            // 复制默认菜单项
            if (this.selectedKey.type === 0) { 
                // 文件类型
                menuData.unshift(
                    {
                        title: '下载',
                        command: 'download',
                        icon: 'Download',
                    },
                    {
                        title: '分享',
                        command: 'share',
                        icon: 'Share',
                    }
                );
            }
            return menuData;
        },
    },
    mounted() {
        if ('clipboard' in navigator) {
            this.clipboardSupported = true;
        } else {
            this.clipboardSupported = false;
        }
    }
};
</script>

<style>
.main {
    width: 80%;
    padding: 20px;
    margin: 0 auto; /* 将容器居中对齐 */
    margin-top: 15px;
    border-radius: 15px;
    box-shadow: 0 10px 15px 0 rgb(0 0 0 / 0.3);
}
.fileDiv {
    width: 100%; 
    display: flex;
}
.fileA{
    width: 100%; display: flex; 
    align-items: center;
    display: flex;
    line-height: 1;
    border-radius: 8px;

}
.fileA:hover{
    background-color: rgb(233, 233, 234);
}
.fileMarginLeft{
    margin-left: 10px;
}

/* el-header */
.header-content{
    width: 90%;
    margin-bottom: 15px;
}
/* el-header的div */
.header-div{
    display: flex;
    flex-direction: column;
}
/* 面包屑导航 */
.breadcrumb{
    margin-left: 10%;
    margin-top: 10px;
}
.breadcrumb-item a{
    display: block;
    cursor: pointer;
    width: 100%;
}
/* 按钮组 */
.button-group{
    margin-left: auto;
}
</style>