import React, { useEffect, useState, useCallback } from 'react';
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
  CFormSelect,
  CImage
} from '@coreui/react';
import '../../../scss/user.css';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Users = () => {
  const [userData, setUsersData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData , setFilteredData] = useState([]);
  const [error, setError] = useState(null); 
  const [selectedSearchOption, setSelectedSearchOption] = useState('all');
  const [originalUserData, setOriginalUserData] = useState(null);
  const [updateUserData , setUpdateUserData ] =  useState({
    phone: '',
    password: '',
    role: '',
    otp: '',
    status: null,
    rating: null,
  });
  const [updateAdditionalInfo, setUpdateAdditionalInfo] = useState({});
  const [updateAdditionalInfoModalVisible, setUpdateAdditionalInfoModalVisible] = useState(false);
  const [userById , setUserById ] = useState([]);
  const [enlargedImage , setEnlargedImage] = useState(null)
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const limit = 20;
  const visiblePages = 3;
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    if (!token) {
      console.log('No token Found');
      navigate('/login');
      return;
    }
    try {
      const data = await fetchUsers();
      setUsersData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleUser = useCallback(async (id) => {
    try {
      const dataByID = await fetchUserById(id);
      
      if (dataByID && dataByID.user) { 
        setUserById(dataByID.user);
        setOriginalUserData(dataByID.user);
        const additionalInfo = dataByID.user.additionalInfo;
        setUpdateUserData({
          phone: dataByID.user.phone || '',
          password: dataByID.user.password || '',
          role: dataByID.user.role || '',
          otp: dataByID.user.otp || '',
          status: dataByID.user.status !== null ? dataByID.user.status : '', 
          rating: dataByID.user.rating !== null ? dataByID.user.rating : ''  
        });
        setUpdateAdditionalInfo({
          Dlverification: additionalInfo.Dlverification || '',
          FullName: additionalInfo.FullName || '',
          Email: additionalInfo.Email || '',
          AadharVfid: additionalInfo.AadharVfid || '',
          Address: additionalInfo.Address || '',
          verification_status: additionalInfo.verification_status || '',
          CurrentAddressVfid: additionalInfo.CurrentAddressVfid || '',
          ml_data: additionalInfo.ml_data || '',
          profilepic: additionalInfo.profilepic || '',
          dl: additionalInfo.dl || '',
          aadhar: additionalInfo.aadhar || '',
          createdAt: additionalInfo.createdAt || '',
          updatedAt: additionalInfo.updatedAt || '',
        });
        
        setError(null); 
      } else {
        throw new Error('User data not found');
      }
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      setError(error.message); 
    }
  }, [fetchUserById, setUserById, setOriginalUserData, setUpdateUserData, setError]);
  
  
  const handleuserByIdClick = useCallback((userById) => {
    handleUser(userById.id);
    console.log("userByIdId: ",userById.id);
    setModalVisible(true);
  }, [handleUser, setModalVisible]);

  const handleOpenUpdateForm = () => {
    setUpdateModalVisible(true);
    setModalVisible(false); 
  };
  

  const handleUpdateUser = useCallback(async (e) => {
    e.preventDefault();
  
    const updatedFields = {};
    for (let key in updateUserData) {
      const originalValue = originalUserData[key];
      const updatedValue = updateUserData[key];
      if (
        (originalValue === null || originalValue === undefined) &&
        updatedValue !== null &&
        updatedValue !== undefined &&
        updatedValue !== '' &&
        !(Array.isArray(updatedValue) && updatedValue.length === 0)
      ) {
        updatedFields[key] = updatedValue;
      } else if (
        originalValue !== updatedValue &&
        updatedValue !== '' &&
        !(Array.isArray(updatedValue) && updatedValue.length === 0)
      ) {
        updatedFields[key] = updatedValue;
      }
    }
  
    if (Object.keys(updatedFields).length > 0) {
      try {
        await updateUser(userById.id, updatedFields);
        setUpdateModalVisible(false);
        fetchData();
      } catch (error) {
        setError(error.message);
      }
    } else {
      console.log("No changes detected");
      setUpdateModalVisible(false);
    }
  } , [updateUserData, originalUserData, userById.id, fetchData, setError]);

  const handleOpenUpdateAdditionalInfoForm = () => {
    setUpdateAdditionalInfoModalVisible(true);
    setModalVisible(false);
  };

  const handleUpdateAdditionalInfo = useCallback(async (e) => {
    e.preventDefault();

    const updatedAdditionalFields = {};
    for (let key in updateAdditionalInfo) {
      const originalValue = userById.additionalInfo[key];
      let updatedValue = updateAdditionalInfo[key];

      if (typeof originalValue === 'boolean') {
        updatedValue = updatedValue === 'Yes';
      }

      if (originalValue !== updatedValue && updatedValue !== '') {
        updatedAdditionalFields[key] = updatedValue;
      }
    }

    if (Object.keys(updatedAdditionalFields).length > 0) {
      try {
        await updateUser(userById.id, { additionalInfo: updatedAdditionalFields });
        setUpdateAdditionalInfoModalVisible(false);
        fetchData();
        setError(null);
      } catch (error) {
        setError(error.message);
      }
    } else {
      setUpdateAdditionalInfoModalVisible(false);
    }
  } , [updateAdditionalInfo ,userById, fetchData]);
  
  
  useEffect(() => {
    const filterUsers = () => {
      let sortedData = [...userData];

      // Sort the data by updatedAt field to show the latest data first
      sortedData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      if (!searchInput) {
        setFilteredData(sortedData);
        setCurrentPage(1);
      } else {
        const filtered = sortedData.filter((user) => {
          if (selectedSearchOption === 'all') {
            return Object.values(user).some(value => {
              if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(nestedValue =>
                  nestedValue && nestedValue.toString().toLowerCase().includes(searchInput.toLowerCase())
                );
              }
              return value && value.toString().toLowerCase().includes(searchInput.toLowerCase());
            });
          } else if (selectedSearchOption === 'FullName') {
            return user.additionalInfo?.FullName?.toLowerCase().includes(searchInput.toLowerCase());
          } else {
            const value = user[selectedSearchOption];
            if (selectedSearchOption === 'createdAt' || selectedSearchOption === 'updatedAt') {
              const formattedDate = new Date(value).toLocaleString();
              return formattedDate && formattedDate.toLowerCase().includes(searchInput.toLowerCase());
            }
            return value && value.toString().toLowerCase().includes(searchInput.toLowerCase());
          }
        });
        setFilteredData(filtered);
        setCurrentPage(1);
      }
    };
    filterUsers();
  }, [userData, selectedSearchOption, searchInput]);
  

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

  const handleImageClick = (imageUrl) => {
    setEnlargedImage(imageUrl);
  };

  const tableHeaders = [
    { label: 'All', value: 'all' },
    { label: 'ID', value: 'id' },
    { label: 'Full Name', value: 'FullName' },
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
    <div>
      {error ? (
        <div className="error-message">
        {error}
      </div>
      ) : (
        <>
      <div className='container-fluid px-4 d-flex align-items-center justify-content-between'>
        <div className='crud-group d-flex mx-2'>
          
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
              <CTableHeaderCell scope="col">Full Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Phone</CTableHeaderCell>
              <CTableHeaderCell scope="col">Role</CTableHeaderCell>
              <CTableHeaderCell scope="col">Rating</CTableHeaderCell>
              <CTableHeaderCell scope="col">Status</CTableHeaderCell>
              <CTableHeaderCell scope="col">Verif-Status</CTableHeaderCell>
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {displayedUsers.map((user, index) => (
              <CTableRow key={user.id} >
                <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
                <CTableDataCell className='userId' onClick={() => handleuserByIdClick(user)}>{user.id}</CTableDataCell>
                <CTableDataCell>{user.additionalInfo.FullName ? user.additionalInfo.FullName : 'N/A'}</CTableDataCell>
                <CTableDataCell>{user.phone || 'N/A'}</CTableDataCell>
                <CTableDataCell>{user.role || 'N/A'}</CTableDataCell>
                <CTableDataCell>{user.rating !== null && user.rating !== undefined ? user.rating.toFixed(2) : 'N/A'}</CTableDataCell>
                <CTableDataCell>
                  <div>
                    {user.status === 1 ? (
                      <>
                        <span className="m-2" style={{ color: 'orange', display: 'block' }}>Pending</span>
                        <code className="p-2 border rounded" style={{ color: 'orange', display: 'block' }}>Code-1</code>
                      </>
                    ) : user.status === 2 ? (
                      <>
                        <span className="m-2" style={{ color: 'lightgreen', display: 'block' }}>Confirmed</span>
                        <code className="p-2 border rounded" style={{ color: 'lightgreen', display: 'block' }}>Code-2</code>
                      </>
                    ) : user.status === null ? (
                      <>
                        <span className="m-2" style={{ color: 'red', display: 'block' }}>N/A</span>
                        <code className="p-2 border rounded" style={{ color: 'red', display: 'block' }}>Code-N/A </code>
                      </>
                    ) : (
                      <>
                        <span className="m-2" style={{ display: 'block' }}>Unknown Status</span>
                        <code className="p-2 border rounded" style={{ display: 'block' }}>Code-{user.status}</code>
                      </>
                    )}
                  </div>
                </CTableDataCell>
                <CTableDataCell>
                  <div>
                    {user.additionalInfo.verification_status === 1 ? (
                      <>
                        <span className="m-2" style={{ color: 'orange', display: 'block' }}>Pending</span>
                        <code className="p-2 border rounded" style={{ color: 'orange', display: 'block' }}>Code-1</code>
                      </>
                    ) : user.additionalInfo.verification_status === 2 ? (
                      <>
                        <span className="m-2" style={{ color: 'lightgreen', display: 'block' }}>Confirmed</span>
                        <code className="p-2 border rounded" style={{ color: 'lightgreen', display: 'block' }}>Code-2</code>
                      </>
                    ) : user.additionalInfo.verification_status === null ? (
                      <>
                        <span className="m-2" style={{ color: 'red', display: 'block' }}>N/A</span>
                        <code className="p-2 border rounded" style={{ color: 'red', display: 'block' }}>Code-N/A </code>
                      </>
                    ) : (
                      <>
                        <span className="m-2" style={{ display: 'block' }}>Unknown Status</span>
                        <code className="p-2 border rounded" style={{ display: 'block' }}>Code-{user.additionalInfo.verification_status}</code>
                      </>
                    )}
                  </div>
                </CTableDataCell>
                <CTableDataCell>{new Date(user.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{new Date(user.updatedAt).toLocaleString()}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </DocsExample>
      <CPagination style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', cursor: 'pointer' }}>
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
          <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="xl" scrollable>
            <CModalHeader>
              <CModalTitle>User Details</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CRow>
                {/* Left Column - Basic Info */}
                <CCol md={6} className='user-modal basic-info'>
                  <h5>Basic Info</h5>
                  <p><strong>ID:</strong> {userById.id}</p>
                  <p><strong>Phone:</strong> {userById.phone}</p>
                  <p>
                    <strong>Status:</strong>
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
                  <p><strong>Role:</strong> {userById.role || 'N/A'}</p>
                  <p><strong>OTP:</strong> {userById.otp || 'N/A'}</p>
                  <p><strong>Timestamp:</strong> {userById.timestamp || 'N/A'}</p>
                  <p><strong>Rating:</strong> {userById.rating || 'N/A'}</p>
                  <p><strong>Created At:</strong> {new Date(userById.createdAt).toLocaleString()}</p>
                  <p><strong>Updated At:</strong> {new Date(userById.updatedAt).toLocaleString()}</p>
                </CCol>

                {userById.additionalInfo && (
                  <CCol md={6} className='user-modal additional-info'>
                    <h5>Additional Info</h5>
                    <p><strong>Full Name:</strong> {userById.additionalInfo.FullName || 'N/A'}</p>
                    <p><strong>Email:</strong> {userById.additionalInfo.Email || 'N/A'}</p>
                    <p><strong>DL Verification:</strong> {userById.additionalInfo.Dlverification || 'N/A'}</p>
                    <p><strong>Aadhar Verification ID:</strong> {userById.additionalInfo.AadharVfid || 'N/A'}</p>
                    <p><strong>Address:</strong> {userById.additionalInfo.Address || 'N/A'}</p>
                    <p><strong>Verification Status:</strong> 
                    {userById.additionalInfo.verification_status === 1 ? (
                      <>
                        <span style={{ color: 'orange' }}> Pending </span>
                        <code className='p-2 border rounded' style={{ color: 'orange' }}>Code-1</code>
                      </>
                    ) : userById.additionalInfo.verification_status === 2 ? (
                      <>
                        <span style={{ color: 'green' }}> Confirmed </span>
                        <code className='p-2 border rounded' style={{ color: 'green' }}>Code-2</code>
                      </>
                    ) : userById.additionalInfo.verification_status === null ? (
                      <>
                        <span style={{ color: 'red' }}> N/A </span>
                        <code className='p-2 border rounded' style={{ color: 'red' }}> Code-null</code>
                      </>
                    ) : (
                      <>
                        <span>Unknown Status</span>
                        <code className='p-2 border rounded'>Code-{userById.additionalInfo.verification_status}</code>
                      </>
                    )}
                    </p>
                    <p><strong>Current Address Verification ID:</strong> {userById.additionalInfo.CurrentAddressVfid || 'N/A'}</p>
                    <p><strong>Additional Created At:</strong> {new Date(userById.additionalInfo.createdAt).toLocaleString()}</p>
                    <p><strong>Additional Updated At:</strong> {new Date(userById.additionalInfo.updatedAt).toLocaleString()}</p>
                  </CCol>
                )}
              </CRow>

              {userById.additionalInfo && (
                <CRow className="mt-4 images-section">
                  <CCol className="d-flex flex-column align-items-center">
                    <p><strong>Profile Picture:</strong></p>
                    {userById.additionalInfo.profilepic ? (
                      <img src={userById.additionalInfo.profilepic} alt="Profile" className="img-thumbnail"  onClick={() => handleImageClick(userById.additionalInfo.profilepic)} />
                    ) : (
                      <div className="empty-image-placeholder">
                          <span><FaTimesCircle /> Not Uploaded</span>
                      </div>
                    )}
                  </CCol>
                  <CCol className="d-flex flex-column align-items-center">
                    <p><strong>Driving License:</strong></p>
                    {userById.additionalInfo.dl ? (
                      <img src={userById.additionalInfo.dl} alt="DL" className="img-thumbnail"  onClick={() => handleImageClick(userById.additionalInfo.dl)}/>
                    ) : (
                      <div className="empty-image-placeholder">
                          <span><FaTimesCircle /> Not Uploaded</span>
                      </div>
                    )}
                  </CCol>
                  <CCol className="d-flex flex-column align-items-center">
                    <p><strong>Aadhaar:</strong></p>
                    {userById.additionalInfo.aadhar ? (
                      <img src={userById.additionalInfo.aadhar} alt="Aadhar" className="img-thumbnail" onClick={() => handleImageClick(userById.additionalInfo.aadhar)} />
                    ) : (
                      <div className="empty-image-placeholder">
                          <span><FaTimesCircle /> Not Uploaded</span>
                      </div>
                    )}
                  </CCol>
                </CRow>
              )}
            </CModalBody>
            <CModalFooter className='d-flex align-items-center justify-content-end'>
              <CButton className='btn-interactive basicInfo d-flex align-items-center justify-content-center' onClick={handleOpenUpdateForm}>
                <span>Update</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="svg-size" style={{ marginLeft: '5px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </CButton>
              <CButton className='btn-interactive additionalInfo align-items-center justify-content-center' onClick={handleOpenUpdateAdditionalInfoForm}>
                <span>Update Additional Info</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="svg-size" style={{ marginLeft: '5px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </CButton>
            </CModalFooter>
          </CModal>
        )}

        {updateModalVisible && (
          <CModal visible={updateModalVisible} onClose={() => setUpdateModalVisible(false)} size='lg'>
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
        {updateAdditionalInfoModalVisible && (
          <CModal visible={updateAdditionalInfoModalVisible} onClose={() => setUpdateAdditionalInfoModalVisible(false)} size='lg'>
            <CModalHeader>
              <CModalTitle>Update Additional Info</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CForm>
                {/* Full Name */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Full Name</CFormLabel>
                    <CFormInput
                      type="text"
                      value={updateAdditionalInfo.FullName || ''}
                      onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, FullName: e.target.value })}
                    />
                  </CCol>
                </CRow>

                {/* Email */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Email</CFormLabel>
                    <CFormInput
                      type="email"
                      value={updateAdditionalInfo.Email || ''}
                      onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, Email: e.target.value })}
                    />
                  </CCol>
                </CRow>

                {/* Aadhar Verification ID */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Aadhar Verification ID</CFormLabel>
                    <CFormInput
                      type="text"
                      value={updateAdditionalInfo.AadharVfid || ''}
                      onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, AadharVfid: e.target.value })}
                    />
                  </CCol>
                </CRow>

                {/* Address */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Address</CFormLabel>
                    <CFormInput
                      type="text"
                      value={updateAdditionalInfo.Address || ''}
                      onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, Address: e.target.value })}
                    />
                  </CCol>
                </CRow>

                {/* DL Verification */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>DL Verification</CFormLabel>
                    <CFormInput
                      type="text"
                      value={updateAdditionalInfo.Dlverification || ''}
                      onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, Dlverification: e.target.value })}
                    />
                  </CCol>
                </CRow>

                {/* Current Address Verification ID */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Current Address Verification ID</CFormLabel>
                    <CFormInput
                      type="text"
                      value={updateAdditionalInfo.CurrentAddressVfid || ''}
                      onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, CurrentAddressVfid: e.target.value })}
                    />
                  </CCol>
                </CRow>

                {/* Profile Picture URL */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Profile Picture URL</CFormLabel>
                    <CFormInput
                      type="text"
                      value={updateAdditionalInfo.profilepic || ''}
                      onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, profilepic: e.target.value })}
                    />
                  </CCol>
                </CRow>

                {/* DL Image URL */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>DL Image URL</CFormLabel>
                    <CFormInput
                      type="text"
                      value={updateAdditionalInfo.dl || ''}
                      onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, dl: e.target.value })}
                    />
                  </CCol>
                </CRow>

                {/* Aadhar Image URL */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Aadhar Image URL</CFormLabel>
                    <CFormInput
                      type="text"
                      value={updateAdditionalInfo.aadhar || ''}
                      onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, aadhar: e.target.value })}
                    />
                  </CCol>
                </CRow>

                {/* Created At */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Created At</CFormLabel>
                    <CFormInput
                      type="text"
                      value={updateAdditionalInfo.createdAt || ''}
                      disabled
                    />
                  </CCol>
                </CRow>

                {/* Updated At */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Updated At</CFormLabel>
                    <CFormInput
                      type="text"
                      value={updateAdditionalInfo.updatedAt || ''}
                      disabled
                    />
                  </CCol>
                </CRow>
                
                {/* Verification Status */}
                <CRow className="mb-3">
                  <CCol>
                  <CFormSelect
                    value={updateAdditionalInfo.verification_status !== null ? updateAdditionalInfo.verification_status.toString() : ''}
                    onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, verification_status: e.target.value !== 'null' ? e.target.value : null })}
                  >
                    <option value="">Select Status</option> {/* Placeholder option */}
                    <option value="1">Pending</option>
                    <option value="2">Confirmed</option>
                    <option value="null">N/A</option>
                  </CFormSelect>
                  </CCol>
                </CRow>

                {/* ML Data */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>ML Data</CFormLabel>
                    <CFormInput
                      type="text"
                      value={updateAdditionalInfo.ml_data || ''}
                      onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, ml_data: e.target.value })}
                    />
                  </CCol>
                </CRow>
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton className="additionalInfo" onClick={handleUpdateAdditionalInfo}>
                Update Additional Info
              </CButton>
            </CModalFooter>
          </CModal>
        )}
        {enlargedImage && (
            <CModal visible={!!enlargedImage} onClose={() => setEnlargedImage(null)} size="lg">
              <CModalBody className="enlarged-image-modal">
                <div className='image-fit'>
                <CImage src={enlargedImage} className='responsive-image'/>
                </div>
              </CModalBody>
            </CModal>
          )}

    </>
      )}
    </div>
  );
};

export default Users;
