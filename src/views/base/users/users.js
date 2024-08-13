import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../../../api/user';
import DocsExample from '../../../components/DocsExample';
import { useNavigate } from 'react-router-dom';
import {
  CTable,
  CTableBody,
  CButton,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem,
  CInputGroup,
  CFormInput,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react';

const Users = () => {
  const [userData, setUsersData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData , setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('id');
  const [searchInput, setSearchInput] = useState('');
  const limit = 20;
  const visiblePages = 3;
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();

  const fetchData = async () => {
    if(!token){
      console.log('No token Found');
      navigate('/login')
    }
    try {
      const data = await fetchUsers();
      setUsersData(data);
      setFilteredData(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filterUsers = () =>{
      if(!searchInput){
        setFilteredData(userData)
        setCurrentPage(1);
      } else {
        const filtered = userData.filter((user) => {
          const value = user[selectedSearchOption];
          if (selectedSearchOption === 'createdAt' || selectedSearchOption === 'updatedAt') {
            const formattedDate = new Date(value).toLocaleString();
            return formattedDate && formattedDate.toLowerCase().includes(searchInput.toLowerCase());
          }
          return value && value.toString().toLowerCase().includes(searchInput.toLowerCase());
        })
        setFilteredData(filtered);
        setCurrentPage(1);
      }
    };
    filterUsers();
  }, [userData , selectedSearchOption, searchInput] )

  const totalPages = Math.ceil(filteredData.length / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedUsers = filteredData.slice((currentPage - 1) * limit, currentPage * limit);

  const getVisiblePages = () => {
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  const tableHeaders = [
    { label: 'ID', value: 'id' },
    { label: 'Phone No.', value: 'phone' },
    { label: 'Password', value: 'password' },
    { label: 'Role', value: 'role' },
    { label: 'Otp', value: 'otp' },
    { label: 'TimeStamp', value: 'timestamp' },
    { label: 'Status', value: 'status' },
    { label: 'Rating', value: 'rating' },
    { label: 'Created At', value: 'createdAt' },
    { label: 'Updated At', value: 'updatedAt' },
  ]

  return (
    <>
      <div className='container-fluid px-4 d-flex align-items-center justify-content-between'>
        <div className='crud-group d-flex mx-2'>
          <CButton className="fw-bolder bg-light text-black mx-2" >Create</CButton>
          <CButton className="fw-bolder bg-light text-black mx-2">Update</CButton>
        </div>
        <div>
          <CInputGroup className="mx-2">
            <CFormInput
              aria-label="Text input with dropdown button"
              placeholder='Search'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <CDropdown alignment="end" variant="input-group">
            <CDropdownToggle color="secondary" variant="outline">
              {tableHeaders.find(header => header.value === selectedSearchOption)?.label || 'Select'}
            </CDropdownToggle>
              <CDropdownMenu>
                {tableHeaders.map((header, index) => (
                  <CDropdownItem key={index} onClick={() => setSelectedSearchOption(header.value)}>
                    {header.label}
                  </CDropdownItem>
                ))}
              </CDropdownMenu>
            </CDropdown>
          </CInputGroup>
        </div>
      </div>
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
              <CTableHeaderCell scope="col">Rating</CTableHeaderCell>
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {displayedUsers.map((user, index) => (
              <CTableRow key={user.id}>
                <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
                <CTableDataCell style={{ fontSize: '12px' }}>{user.id}</CTableDataCell>
                <CTableDataCell>{user.phone}</CTableDataCell>
                <CTableDataCell>{user.password.length > 10 ? `${user.password.slice(0, 10)}...` : user.password}</CTableDataCell>
                <CTableDataCell>{user.role}</CTableDataCell>
                <CTableDataCell>{user.otp}</CTableDataCell>
                <CTableDataCell>{user.timestamp}</CTableDataCell>
                <CTableDataCell>{user.rating !== null && user.rating !== undefined ? user.rating.toFixed(2) : 'N/A'}</CTableDataCell>

                <CTableDataCell>{new Date(user.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{new Date(user.updatedAt).toLocaleString()}</CTableDataCell>
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
