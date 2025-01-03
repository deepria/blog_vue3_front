import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL+'/dynamodb', // 환경 변수에서 API URL 가져오기
    headers: {
        "Content-Type": "application/json",
    },
});

export default apiClient;