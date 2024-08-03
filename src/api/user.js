import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${apiUrl}admin/users`, {
      headers: {
        token: token,
      },
    });
    return response.data.users; 
  } catch (error) {
    throw error;
  }
};

export const fetchUserVerification = async () => {
  try {
    const response = await axios.get(`${apiUrl}admin/pending-profile`, {
      headers: {
        token: token,
      },
    });
    return response.data.updatedProfiles; 
  } catch (error) {
    throw error;
  }
};

export const approveUserVerification = async(userId) => {
  try{
    const response = await axios.put(`${apiUrl}admin/approve-profile` , { userId } , {
      headers: {
        'token' : token,
      },
    });
    return response.data;
  } catch(error){
    throw error;
  }
}
