import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const getCars = async () => {
  try {
    const response = await axios.get(`${apiUrl}admin/cars`, {
      headers: {
        token: token,
      },
    });
    return response.data.cars; 
  } catch (error) {
    throw error;
  }
};
export const fetchCarById = async(id) => {
  try{
    const response = await axios.get(`${apiUrl}admin/cars/${id}`, {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const updateCar = async(id , data) => {
  try{
    const response = await axios.put(`${apiUrl}admin/cars/${id}`, data , {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}


export const getCarVerififcation = async () => {
    try {
      const response = await axios.get(`${apiUrl}admin/pending-carprofile`, {
        headers: {
          token: token,
        },
      });
      return response.data.pendingProfiles; 
    } catch (error) {
      throw error;
    }
  };

  
export const approveCarVerification = async(carId) => {

  try{
    const response = await axios.put(`${apiUrl}admin/approve-carprofile` , { carId } , {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }

}

export const rejectCarVerification = async(carId) => {
  try{
    const response = await axios.put(`${apiUrl}admin/reject-carprofile` , { carId } , {
      headers :{
        'token':token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
