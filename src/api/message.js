import axios from 'axios';
import serverApiUrl from '../env';

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const getallmessages = async () => {
    try {
        const response = await axios.get(`${apiUrl}admin/chat/all`, {
            headers: {
                token: token,
            },
        });
        return response.data; 
    } catch (error) {
        throw error;
    }
};

export const flagmessage = async (id) => {
    try {
        const response = await axios.post(`${apiUrl}admin/chat/flag/${id}`, {
            headers: {
                token: token,
            },
        });
        return response.data; 
    } catch (error) {
        throw error;
    }
};

