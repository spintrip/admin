import axios from 'axios';
import serverApiUrl from '../env';

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const sendNotification = async (data) => {
    try {
        const response = await axios.post(`${apiUrl}admin/send-notifications`, data , {
            headers: {
                token: token,
            },
        });
        return response.data; 
    } catch (error) {
        throw error;
    }
};


