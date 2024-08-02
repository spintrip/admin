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
