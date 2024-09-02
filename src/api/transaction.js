import axios from 'axios';
import serverApiUrl from '../env';

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const getTransaction = async () => {
  try {
    const response = await axios.get(`${apiUrl}admin/transaction`, {
      headers: {
        token: token,
      },
    });
    return response.data.transactions; 
  } catch (error) {
    throw error;
  }
};

export const updateTransaction = async(id , data) => {
  try{
    const response = await axios.put(`${apiUrl}admin/transaction/${id}` , data , {
      headers: {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const sendPayout = async(data) => {
  try {
    const response = await axios.post(`${apiUrl}admin/payouts` , data , {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error ;
  }
}
