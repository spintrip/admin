import React, { useEffect, useState } from 'react';
import { fetchUsers , updateUser , fetchUserById } from '../../../api/user';
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
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CCol,
  CForm,
  CFormLabel,
} from '@coreui/react';
import '../../../scss/user.css'

const Users = () => {
  const [userData, setUsersData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData , setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('all');
  const [updateUserData , setUpdateUserData ] =  useState({
    phone: '',
    password: '',
    role: '',
    otp: '',
    status: null,
    rating: null,
  });
  const [userById , setUserById ] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
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

  const handleUser = async (id) => {
    try {
      const dataByID = await fetchUserById(id);
      setUserById(dataByID.user);
      setUpdateUserData({
        phone: dataByID.user.phone || '',
        password: dataByID.user.password || '',
        role: dataByID.user.role || '',
        otp: dataByID.user.otp || '',
        status: dataByID.user.status || '',
        rating: dataByID.user.rating || ''
      });
    } catch (error) {
      console.log(error);
    }
  };
  
  const handleuserByIdClick = (userById) => {
    handleUser(userById.id);
    console.log("userByIdId: ",userById.id);
    setModalVisible(true);
  };

  const handleOpenUpdateForm = () => {
    setUpdateModalVisible(true);
    setModalVisible(false); 
  };
  

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        phone: updateUserData.phone || undefined, 
        password: updateUserData.password || undefined,
        role: updateUserData.role || undefined,
        otp: updateUserData.otp || undefined,
        status: parseInt(updateUserData.status, 10), 
        rating: parseFloat(updateUserData.rating), 
      };
      
      await updateUser(userById.id, updatedData);
      setUpdateModalVisible(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };
  
  useEffect(() => {
    const filterUsers = () =>{
      if(!searchInput){
        setFilteredData(userData)
        setCurrentPage(1);
      } else {
        const filtered = userData.filter((user) => {
          if (selectedSearchOption === 'all') {
            return Object.values(user).some(value =>
              value && value.toString().toLowerCase().includes(searchInput.toLowerCase())
            );
          } else {
            const value = user[selectedSearchOption];
            if (selectedSearchOption === 'createdAt' || selectedSearchOption === 'updatedAt') {
              const formattedDate = new Date(value).toLocaleString();
              return formattedDate && formattedDate.toLowerCase().includes(searchInput.toLowerCase());
            }
            return value && value.toString().toLowerCase().includes(searchInput.toLowerCase());
          }
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
    { label: 'All', value: 'all' },
    { label: 'ID', value: 'id' },
    { label: 'Phone No.', value: 'phone' },
    { label: 'Password', value: 'password' },
    { label: 'Role', value: 'role' },
    { label: 'Otp', value: 'otp' },
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
        <CTable color="dark" hover className='user-column'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              <CTableHeaderCell scope="col">ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Phone</CTableHeaderCell>
              <CTableHeaderCell scope="col">Password</CTableHeaderCell>
              <CTableHeaderCell scope="col">Role</CTableHeaderCell>
              <CTableHeaderCell scope="col">OTP</CTableHeaderCell>
              <CTableHeaderCell scope="col">Rating</CTableHeaderCell>
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {displayedUsers.map((user, index) => (
              <CTableRow key={user.id} onClick={() => handleuserByIdClick(user)}>
                <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
                <CTableDataCell style={{ fontSize: '12px' }}>{user.id}</CTableDataCell>
                <CTableDataCell>{user.phone}</CTableDataCell>
                <CTableDataCell>{user.password.length > 10 ? `${user.password.slice(0, 10)}...` : user.password}</CTableDataCell>
                <CTableDataCell>{user.role}</CTableDataCell>
                <CTableDataCell>{user.otp}</CTableDataCell>
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
      {userById && (
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg" scrollable>
          <CModalHeader>
            <CModalTitle>userById Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow>
              <CCol className='user-modal'>
                <p><strong>ID:</strong> {userById.id}</p>
                <p><strong>Phone:</strong> {userById.phone}</p>
                <p>
                  <strong style={{ fontSize : 'bold'}}>Status : </strong>
                  {userById.status === 1 ? (
                    <>
                      <span style={{ color: 'orange' }}> Pending </span>
                      <code className='p-2 border rounded' style={{ color: 'orange' }}>Code-1</code>
                    </>
                  ) : userById.status === 2 ? (
                    <>
                      <span style={{ color: 'green' }}> Confirmed </span>
                      <code className='p-2 border rounded' style={{ color: 'green' }}>Code-2</code>
                    </>
                  ) : userById.status === null ? (
                    <>
                      <span style={{ color: 'red' }}> N/A </span>
                      <code className='p-2 border rounded' style={{ color: 'red' }}> Code-null</code>
                    </>
                  ) : (
                    <>
                      <span>Unknown Status</span>
                      <code className='p-2 border rounded'>Code-{userById.status}</code>
                    </>
                  )}
                </p>
                <p><strong>Role</strong> {userById.role ? userById.role  : 'N/A'}</p>
                <p><strong>OTP:</strong> {userById.otp ? userById.otp  : 'N/A'}</p>
                <p><strong>Timestamp:</strong> {userById.timestamp ? userById.timestamp  : 'N/A'}</p>
                <p><strong>Rating:</strong> {userById.rating ? userById.rating  : 'N/A'}</p>
                <p><strong>Created At:</strong> {new Date(userById.createdAt).toLocaleString()}</p>
                <p><strong>Updated At:</strong> {new Date(userById.updatedAt).toLocaleString()}</p>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter className='d-flex align-items-center justify-content-end'>
            <CButton color="success"  className='d-flex  align-items-center justify-content-center' onClick={handleOpenUpdateForm}>
                <span style = {{ color : 'white'}}>Update</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="svg-size" style={{marginLeft: '5px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                </CButton>
          </CModalFooter>
        </CModal>
      )}
        {updateModalVisible && (
          <CModal visible={updateModalVisible} onClose={() => setUpdateModalVisible(false)}>
            <CModalHeader>
              <CModalTitle>Update User</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CForm>
                <CFormLabel>Phone</CFormLabel>
                <CFormInput
                  type="text"
                  value={updateUserData.phone}
                  onChange={(e) => setUpdateUserData({ ...updateUserData, phone: e.target.value })}
                />
                <CFormLabel>Password</CFormLabel>
                <CFormInput
                  type="text"
                  value={updateUserData.password}
                  onChange={(e) => setUpdateUserData({ ...updateUserData, password: e.target.value })}
                />
                <CFormLabel>Role</CFormLabel>
                <CFormInput
                  type="text"
                  value={updateUserData.role}
                  onChange={(e) => setUpdateUserData({ ...updateUserData, role: e.target.value })}
                />
                <CFormLabel>OTP</CFormLabel>
                <CFormInput
                  type="text"
                  value={updateUserData.otp}
                  onChange={(e) => setUpdateUserData({ ...updateUserData, otp: e.target.value })}
                />
                <CFormLabel>Status</CFormLabel>
                <CFormInput
                type="text"
                value={updateUserData.status}
                onChange={(e) => setUpdateUserData({ ...updateUserData, status: e.target.value })}
                />
                <CFormLabel>Rating</CFormLabel>
                <CFormInput
                type="text"
                value={updateUserData.rating}
                onChange={(e) => setUpdateUserData({ ...updateUserData, rating: e.target.value })}
                />
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton color="success" onClick={handleUpdateUser}><span style={{color : 'white'}}>Update Data</span></CButton>
            </CModalFooter>
          </CModal>
        )}

    </>
  );
};

export default Users;
