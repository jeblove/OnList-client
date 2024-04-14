<template>
    <vue-json-pretty :data="json_data" deep="3" showLength="true" showLineNumber="true" showIcon="true"
        virtual="true" />
</template>

<script>
import axios from '@/utils/axios';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

export default {
    components: {
        VueJsonPretty,
    },
    data() {
        return {
            json_data: '',
        };
    },
    async created() {
        const res = await axios.post('/path/getAllPathInfo');
        console.log(res.data.data)
        if (res.data.code === 200) {
            this.json_data = res.data.data;
        } else {
            this.$message.error('获取目录信息失败:' + res.data.message);
        }
    },
    methods: {
    }
}

</script>