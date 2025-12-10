import axios from 'axios';

const API_URL = 'https://ac8ca470cc27.ngrok-free.app/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const startAssessment = async (userId) => {
    const response = await api.get(`/assessment/start/${userId}`);
    return response.data;
};

export const submitAssessment = async (userId, setId, answers, timeTaken) => {
    const response = await api.post(`/assessment/submit/${userId}`, { setId, answers, timeTaken });
    return response.data;
};

export const saveProgress = async (userId, setId, answers) => {
    const response = await api.post(`/assessment/save-progress/${userId}`, { setId, answers });
    return response.data;
};

export const getProgress = async (userId, setId) => {
    const response = await api.get(`/assessment/progress/${userId}/${setId}`);
    return response.data;
};

export const getResult = async (userId) => {
    const response = await api.get(`/assessment/result/${userId}`);
    return response.data;
};

export const checkAssessmentStatus = async (userId) => {
    const response = await api.get(`/assessment/status/${userId}`);
    return response.data;
};

export const sendOtp = async (phone) => {
    const response = await api.post('/auth/send-otp', { phone });
    return response.data;
};

export const verifyOtp = async (phone, otp) => {
    const response = await api.post('/auth/verify-otp', { phone, otp });
    return response.data;
};

export const retryOtp = async (phone) => {
    const response = await api.post('/auth/retry-otp', { phone });
    return response.data;
};

export const getUserProfile = async (userId) => {
    const response = await api.get(`/user/profile/${userId}`);
    return response.data;
};

// Admin APIs
export const getAllUsersReport = async (userId) => {
    const response = await api.get(`/admin/users/report?userId=${userId}`);
    return response.data;
};

export const exportToPDF = async (userId) => {
    const response = await api.get(`/admin/users/export/pdf?userId=${userId}`, {
        responseType: 'blob'
    });
    return new Blob([response.data], { type: 'application/pdf' });
};

export const exportToXLSX = async (userId) => {
    const response = await api.get(`/admin/users/export/xlsx?userId=${userId}`, {
        responseType: 'blob'
    });
    return new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};
