import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const fetchCabs = async () => {
  try {
    const response = await axios.get(`${apiUrl}admin/cabs`, {
      headers: {
        token: token,
      },
    });
    return response.data.cabs; 
  } catch (error) {
    throw error;
  }
};

export const fetchCabById = async(id) => {
  try{
    const response = await axios.get(`${apiUrl}admin/cabs/${id}`, {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const approveCabProfile = async(id) => {
  try{
    const response = await axios.put(`${apiUrl}admin/approve-cab/${id}`, {}, {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const rejectCabProfile = async(id) => {
  try{
    const response = await axios.put(`${apiUrl}admin/reject-cab/${id}`, {}, {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
