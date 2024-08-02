import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const createFeature = async (featureName) => {
  try {
    const response = await axios.post(`${apiUrl}admin/features`, { 'featureName' : featureName  }, {
      headers: {
        'token': token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getFeatures = async() => {
    try{
        const response = await axios.get(`${apiUrl}admin/allfeatures`);
        return response.data;
    } catch(error){
        throw error;
    }
}

export const deleteFeatures = async(id) =>{
    try{
        const response = await axios.delete(`${apiUrl}admin/features/${id}`, {
            headers: {
                'token': token,
            },
        });
        return response.data;
    } catch (error){
        throw error;
    }
}
