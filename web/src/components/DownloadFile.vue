<template>

</template>

<script>
import axios from '@/utils/axios';
export default{
    name: "DownloadFile",
    components: {

    },
    data() {

    },
    created() {

    },
    methods: {
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
    }
}
</script>