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

export const fetchBookingById = async(id) => {
  try{
    const response = await axios.get(`${apiUrl}admin/bookings/${id}`, {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const updateBooking = async(id , data) => {
  try{
    const response = await axios.put(`${apiUrl}admin/bookings/${id}`, data , {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

