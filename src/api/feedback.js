import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;
const token = localStorage.getItem('adminToken');

export const fetchFeedbacks = async () => {
  try {
    const response = await axios.get(`${apiUrl}admin/feedbacks`, {
      headers: {
        token: token,
      },
    });
    return response.data.feedbacks; 
  } catch (error) {
    throw error;
  }
};

export const deleteFeedback = async(id) => {
  try{
    const response = await axios.delete(`${apiUrl}admin/feedbacks/${id}`, {
      headers : {
        'token' : token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
