// src/api/auth.js
// src/services/authService.js
import axios from 'axios';
import serverApiUrl from '../env';

const apiUrl = serverApiUrl;

export const loginWithOTP = async (phone, otp) => {
    const apiData = {
        phone:phone,
        otp:otp,
    }
    console.log("apiUrl: ",apiUrl)

  try {
    const response = await axios.post(`${apiUrl}admin/verify-otp`, apiData);
    console.log(response.data.token);
    return response.data.token; 
    
  } catch (error) {
    throw error;
  }
};

