import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const fetchDrivers = async () => {
  try {
    const response = await axios.get(`${apiUrl}admin/drivers`, {
      headers: {
        token: token,
      },
    });
    return response.data.drivers; 
  } catch (error) {
    throw error;
  }
};

export const fetchDriverById = async(id) => {
  try{
    const response = await axios.get(`${apiUrl}admin/drivers/${id}`, {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const approveDriverProfile = async(id) => {
  try{
    const response = await axios.put(`${apiUrl}admin/approve-driver/${id}`, {}, {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const rejectDriverProfile = async(id) => {
  try{
    const response = await axios.put(`${apiUrl}admin/reject-driver/${id}`, {}, {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
