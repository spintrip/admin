import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const createBlog = async (formData) => {
  try {
    const response = await axios.post(`${apiUrl}admin/createBlog`, formData , {
      headers: {
        'token': token,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; 
  } catch (error) {
    throw error;
  }
};

export const getBlog = async() => {
    try{
        const response = await axios.get(`${apiUrl}admin/getallblogs`, );
        return response.data;
    } catch(error){
        throw error;
    }
}

export const updateBlog = async(formData) => {
    try{
        const response = await axios.post(`${apiUrl}admin/updateBlog` , formData ,{
            headers:{
                'token': token,
                'Content-Type' : 'multipart/form-data',
            },
        });
        return response.data;
    } catch(error) {
        throw error;
    }
}

export const deleteBlog = async(id) =>{
    try{
        const response = await axios.get(`${apiUrl}admin/deleteBlog/${id}`, {
            headers: {
                'token': token,
            },
        });
        return response.data;
    } catch (error){
        throw error;
    }
}
