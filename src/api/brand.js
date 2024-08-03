import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const getBrand = async() => {
    try{
        const response = await axios.get(`${apiUrl}admin/brand`,{
            headers: {
                'token': token,
            },
        });
        return response.data;
    } catch(error){
        throw error;
    }
}

export const updateBrand = async(data) => {
    try{
        const response = await axios.put(`${apiUrl}admin/update_brand` , data ,{
            headers: {
                'token' : token,
            },
        });
        return response.data;
    } catch(error){
        throw error;
    }
}

export const putBrand = async(data) => {
    try{
        const response = await axios.put(`${apiUrl}admin/brand` , data ,{
            headers: {
                'token' : token,
            },
        });
        return response.data;
    } catch(error){
        throw error;
    }
}