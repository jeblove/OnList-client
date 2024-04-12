<template>
  <el-input
    v-model="textarea"
    style="width: 240px"
    autosize
    type="textarea"
    placeholder="Please input"
  />
</template>

<script>
import axios from '@/utils/axios';
export default {
    components: {
        
    },
    data() {
        return {
            textarea: '',
        };
    },
    async created() {
        const res = await axios.post('/path/getAllPathInfo');
        console.log(res.data.data)
        if (res.data.code === 200) {
            this.textarea = JSON.stringify(res.data.data);
        } else {
            this.$message.error('获取目录信息失败:' + res.data.message);
        }
    },
    methods: {
    }
}

</script>