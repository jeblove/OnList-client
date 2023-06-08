import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_APP_URL

const instance = axios.create({
    timeout: 10000, // 超时时间
    // headers: {
    //   'Content-Type': 'application/json;charset=UTF-8',
    // },
  });

export default instance;