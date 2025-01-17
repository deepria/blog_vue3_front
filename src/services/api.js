import axios from "axios";
import {message} from "ant-design-vue";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 요청 인터셉터 추가 (로딩 메시지)
apiClient.interceptors.request.use(
    (config) => {
        message.loading({content: "Action in progress...", key: "loading", duration: 0}).then();  // 로딩 메시지 표시 (지속)
        return config;
    },
    (error) => {
        message.destroy("loading"); // 에러 발생 시 로딩 제거
        message.warn("axios request failed").then(); // 통신 실패 메시지 표시
        return Promise.reject(error);
    }
);

// 응답 인터셉터 추가 (성공/에러 메시지)
apiClient.interceptors.response.use(
    (response) => {
        message.destroy("loading");
        message.success("Succeed", 1.5).then();
        return response;
    },
    (error) => {
        message.destroy("loading");
        if (error.response) {
            if (error.response.status === 401) {
                message.error("Unauthorized! Redirecting to login...", 1.5).then();
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2500); // 1.5초 후 리디렉트
            } else if (error.response.status === 500) {
                message.error("Server error! Please try again later.", 1.5).then();
            } else {
                message.error(`Error: ${error.response.status} - ${error.response.statusText}`, 1.5).then();
            }
        } else {
            message.error("Network error! Please check your internet connection.", 1.5).then();
        }
        return Promise.reject(error);
    }
);

export default apiClient;