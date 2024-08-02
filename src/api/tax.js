import axios from 'axios';
import serverApiUrl from '../env';

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const createTax = async (data) => {
  try {
    const response = await axios.post(`${apiUrl}admin/tax`, data , {
      headers: {
        token: token,
      },
    });
    return response.data.bookings; 
  } catch (error) {
    throw error;
  }
};
