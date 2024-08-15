import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;
const token = localStorage.getItem('authToken');

export const getDevice = async(id, limit = 10000) => {
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