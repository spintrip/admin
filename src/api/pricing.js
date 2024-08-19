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

export const manualCarPricing = async(data) => {
  try{
    const response = await axios.put(`${apiUrl}admin/pricing` , data , {
      headers: {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const autoCarPricing = async(carid) => {
  try{
    const response = await axios.put(`${apiUrl}admin/auto-pricing` ,  carid  , {
      headers: {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}