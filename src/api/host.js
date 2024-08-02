import axios from 'axios';
import serverApiUrl from '../env';

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const fetchHosts = async () => {
    try {
        const response = await axios.get(`${apiUrl}admin/hosts`, {
            headers: {
                token: token,
            },
        });
        return response.data.hosts; 
    } catch (error) {
        throw error;
    }
};
