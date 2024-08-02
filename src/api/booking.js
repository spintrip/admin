import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const getBooking = async () => {
  try {
    const response = await axios.get(`${apiUrl}admin/bookings`, {
      headers: {
        token: token,
      },
    });
    return response.data.bookings; 
  } catch (error) {
    throw error;
  }
};
