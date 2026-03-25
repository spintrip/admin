import axios from 'axios';
import serverApiUrl from '../env';

const getToken = () => localStorage.getItem('adminToken');

export const fetchCrudRecords = async (modelName) => {
  const response = await axios.get(`${serverApiUrl}admin/crud/${modelName}`, {
    headers: { token: getToken() }
  });
  return response.data.data;
};

export const createCrudRecord = async (modelName, data) => {
  const response = await axios.post(`${serverApiUrl}admin/crud/${modelName}`, data, {
    headers: { token: getToken() }
  });
  return response.data;
};

export const updateCrudRecord = async (modelName, id, data) => {
  const response = await axios.put(`${serverApiUrl}admin/crud/${modelName}/${id}`, data, {
    headers: { token: getToken() }
  });
  return response.data;
};

export const deleteCrudRecord = async (modelName, id) => {
  const response = await axios.delete(`${serverApiUrl}admin/crud/${modelName}/${id}`, {
    headers: { token: getToken() }
  });
  return response.data;
};
