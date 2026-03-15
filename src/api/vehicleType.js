import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const fetchVehicleTypes = async () => {
  try {
    const response = await axios.get(`${apiUrl}admin/vehicle-types`, {
      headers: {
        token: token,
      },
    });
    return response.data.vehicleTypes; 
  } catch (error) {
    throw error;
  }
};

export const createVehicleType = async(data) => {
  try{
    const response = await axios.post(`${apiUrl}admin/vehicle-types`, data, {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const deleteVehicleType = async(id) => {
  try{
    const response = await axios.delete(`${apiUrl}admin/vehicle-types/${id}`, {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
