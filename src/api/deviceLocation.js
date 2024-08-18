import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;
const token = localStorage.getItem('authToken');

export const getDevice = async(id, limit) => {
    try{
        const response = await axios.get(`${apiUrl}admin/device/${id}/?limit=${limit}` , {
            headers : {
                'token' : token,
            },
        });
        return response.data;
    } catch (error){
        throw error;
    }
}

export const createCarDeviceAssign = async(data) => {
    try{
        const response = await axios.post(`${apiUrl}admin/car-device` ,  data , {
            headers:{
                'token' : token,
            },
        });
        return response.data;
    } catch (error){
        throw error;
    }

}

export const updateCarDeviceAssign = async(data) => {
    try{
        const response = await axios.put(`${apiUrl}admin/car-device` , data , {
            headers : {
                'token' : token,
            },
        });
        return response.data;
    } catch (error) {
        throw error ; 
    }
    
}

export const deleteCarDeviceAssign = async(id) => {
    try{
        const response = await axios.delete(`${apiUrl}admin/car-device/${id}`, {
            headers: {
                'token' : token,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getAllDevices = async() => {
    try{
        const response = await axios.get(`${apiUrl}admin/car-device` , {
            headers : {
                'token' : token,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}