import axios from "axios";
import serverApiUrl from "../env";

const apiUrl = serverApiUrl;

export const getAllWithdrawals = async () => {
  const token = localStorage.getItem('adminToken');
  try {
    const response = await axios.get(`${apiUrl}admin/withdrawals`, {
      headers: { token: token },
    });
    // Assuming backend sends { success: true, data: withdrawals } or just withdrawals directly
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};

export const approveWithdrawal = async (id) => {
  const token = localStorage.getItem('adminToken');
  try {
    const response = await axios.put(`${apiUrl}admin/withdrawals/${id}/approve`, {}, {
      headers: { token: token },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const rejectWithdrawal = async (id) => {
  const token = localStorage.getItem('adminToken');
  try {
    const response = await axios.put(`${apiUrl}admin/withdrawals/${id}/reject`, {}, {
      headers: { token: token },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
