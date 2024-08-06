import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;
//const token = localStorage.getItem('authToken');

export const getDevice = async(id) => {
    try{
        const response = await axios.get(`${apiUrl}admin/device/${id}`)
        return response.data;
    } catch (error){
        throw error;
    }
}