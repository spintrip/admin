import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../../../api/user';
import DocsExample from '../../../components/DocsExample';
import { useNavigate } from 'react-router-dom';
import {
  CTable,
  CTableBody,
  CTableCaption,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem,
} from '@coreui/react';

const Users = () => {
  const [userData, setUsersData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;
  const visiblePages = 3;
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  const fetchData = async () => {
    if(!token){
      console.log('No token Found');
      navigate('/login')
    }
    try {
      const data = await fetchUsers();
      setUsersData(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const totalPages = Math.ceil(userData.length / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedUsers = userData.slice((currentPage - 1) * limit, currentPage * limit);

  const getVisiblePages = () => {
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  return (
    <>
      <DocsExample href="components/table#hoverable-rows">
        <CTable color="dark" hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              <CTableHeaderCell scope="col">ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Phone</CTableHeaderCell>
              <CTableHeaderCell scope="col">Password</CTableHeaderCell>
              <CTableHeaderCell scope="col">Role</CTableHeaderCell>
              <CTableHeaderCell scope="col">OTP</CTableHeaderCell>
              <CTableHeaderCell scope="col">Timestamp</CTableHeaderCell>
              <CTableHeaderCell scope="col">Status</CTableHeaderCell>
              <CTableHeaderCell scope="col">Rating</CTableHeaderCell>
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Booking ID</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {displayedUsers.map((user, index) => (
              <CTableRow key={user.id}>
                <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
                <CTableDataCell>{user.id.length > 10 ? `${user.id.slice(0, 10)}...` : user.id}</CTableDataCell>
                <CTableDataCell>{user.phone}</CTableDataCell>
                <CTableDataCell>{user.password.length > 10 ? `${user.password.slice(0, 10)}...` : user.password}</CTableDataCell>
                <CTableDataCell>{user.role}</CTableDataCell>
                <CTableDataCell>{user.otp}</CTableDataCell>
                <CTableDataCell>{user.timestamp}</CTableDataCell>
                <CTableDataCell>{user.status}</CTableDataCell>
                <CTableDataCell>{user.rating !== null && user.rating !== undefined ? user.rating.toFixed(2) : 'N/A'}</CTableDataCell>

                <CTableDataCell>{new Date(user.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{new Date(user.updatedAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{user.BookingBookingid}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </DocsExample>
      <CPagination style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <CPaginationItem
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </CPaginationItem>
        {getVisiblePages().map((page) => (
          <CPaginationItem
            key={page}
            active={page === currentPage}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </CPaginationItem>
        ))}
        <CPaginationItem
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </CPaginationItem>
      </CPagination>
    </>
  );
};

export default Users;
