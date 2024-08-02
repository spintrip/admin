import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const getPricing = async () => {
  try {
    const response = await axios.get(`${apiUrl}admin/pricing`, {
      headers: {
        token: token,
      },
    });
    return response.data.pricing; 
  } catch (error) {
    throw error;
  }
};
