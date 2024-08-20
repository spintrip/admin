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

export const getTax = async() => {
  try{
    const response = await axios.get(`${apiUrl}admin/tax` , {
      headers: {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const updateTax = async(id , data) => {
  try{
    const response = await axios.put(`${apiUrl}admin/tax/${id}`, data , {
      headers: {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}