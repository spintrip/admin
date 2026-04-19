import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const getvehicles = async () => {
  try {
    const response = await axios.get(`${apiUrl}admin/vehicles`, {
      headers: {
        token: token,
      },
    });
    return response.data.vehicles; 
  } catch (error) {
    throw error;
  }
};
export const fetchvehicleById = async(id) => {
  try{
    const response = await axios.get(`${apiUrl}admin/vehicles/${id}`, {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const updatevehicle = async(id , data) => {
  try{
    const response = await axios.put(`${apiUrl}admin/vehicles/${id}`, data , {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}


export const getvehicleVerififcation = async () => {
    try {
      const response = await axios.get(`${apiUrl}admin/pending-vehicleprofile`, {
        headers: {
          token: token,
        },
      });
      return response.data.pendingProfiles; 
    } catch (error) {
      throw error;
    }
  };

  
export const approvevehicleVerification = async(vehicleid) => {

  try{
    const response = await axios.put(`${apiUrl}admin/approve-vehicleprofile` , { vehicleid } , {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }

}

export const rejectvehicleVerification = async(vehicleid) => {
  try{
    const response = await axios.put(`${apiUrl}admin/reject-vehicleprofile` , { vehicleid } , {
      headers :{
        'token':token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const activateVehicle = async (id, status = true) => {
  try {
    const response = await axios.put(`${apiUrl}admin/activate-vehicle/${id}`, { activated: status }, {
      headers: {
        'token': token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
