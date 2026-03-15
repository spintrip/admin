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

export const createvehicleDeviceAssign = async(data) => {
    try{
        const response = await axios.post(`${apiUrl}admin/vehicle-device` ,  data , {
            headers:{
                'token' : token,
            },
        });
        return response.data;
    } catch (error){
        throw error;
    }

}

export const updatevehicleDeviceAssign = async(data) => {
    try{
        const response = await axios.put(`${apiUrl}admin/vehicle-device` , data , {
            headers : {
                'token' : token,
            },
        });
        return response.data;
    } catch (error) {
        throw error ; 
    }
    
}

export const deletevehicleDeviceAssign = async(id) => {
    try{
        const response = await axios.delete(`${apiUrl}admin/vehicle-device/${id}`, {
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
        const response = await axios.get(`${apiUrl}admin/vehicle-device` , {
            headers : {
                'token' : token,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}