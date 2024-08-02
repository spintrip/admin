import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const getAllSupportTickets = async() => {
    try{
        const response = await axios.get(`${apiUrl}admin/support`);
        return response.data.tickets;
    } catch(error){
        throw error;
    }
}


export const getSupportChat = async (supportId) => {
    try {
      const response = await axios.post(`${apiUrl}admin/support/supportChat`, { supportId }, {
        headers: {
          token: token,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  