import React, { useEffect, useState } from 'react';
import { fetchUserVerification, approveUserVerification , rejectUserVerification } from '../../../api/user';
import { useNavigate } from 'react-router-dom';
import FileDisplay from '../../base/controller/FileDisplay';
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButton,
  CImage,
  CCol,
  CRow,
  CInputGroup,
  CFormInput,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/react';
import '../../../scss/verif.css'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
const UserVerification = () => {
  const [userProfilesData, setUserProfilesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [filteredData , setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('id');
  const [searchInput, setSearchInput] = useState('');
  const limit = 20;
  const visiblePages = 3;
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!token) {
      console.log('No token Found');
      navigate('/login');
    }
    try {
      const data = await fetchUserVerification();
      setUserProfilesData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filterUserVerif = () =>{
      if(!searchInput){
        setFilteredData(userProfilesData ? userProfilesData : [])
        setCurrentPage(1);
      } else {
        const filtered = userProfilesData.filter((user) => {
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
    filterUserVerif();
  }, [userProfilesData , selectedSearchOption, searchInput] )

  const totalPages = Math.ceil((userProfilesData?.length || 0) / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedProfiles = (filteredData || []).slice((currentPage - 1) * limit, currentPage * limit);

  const getVisiblePages = () => {
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  const handleProfileClick = (profile) => {
    setSelectedProfile(profile);
    setModalVisible(true);
  };

  const handleImageClick = (imageUrl) => {
    setEnlargedImage(imageUrl);
  };

  const handleApprove = async(userId) => {
    try{
        await approveUserVerification(userId);
        setModalVisible(false);
        fetchData();
    }catch (error) {
        console.log(error);
    }
    
  };

  const handleDecline = async(userId) => {
    try{
      await rejectUserVerification(userId);
      setModalVisible(false);
      fetchData();
    } catch(error){
      console.log(error);
    }
  };

  const tableHeaders = [
    { label: 'User Id', value: 'id' },
    { label: 'Full Name', value: 'FullName' },
    { label: 'Verif. Status', value: 'verification_status' },
    { label: 'Created At', value: 'createdAt' },
    { label: 'Updated At', value: 'updatedAt' },
  ];

  return (
    <div className='container-fluid'>
      <div className='container-fluid px-4 d-flex align-items-center justify-content-between mb-3'>
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
      <CTable  color="dark" hover>
        <CTableHead>
          <CTableRow className = "row-style" >
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">ID</CTableHeaderCell>
            <CTableHeaderCell scope="col">Full Name</CTableHeaderCell>
            <CTableHeaderCell scope="col">Verification Status</CTableHeaderCell>
            <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
            <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {displayedProfiles.map((profile, index) => (
            <CTableRow key={profile.id} onClick={() => handleProfileClick(profile)}>
              <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
              <CTableDataCell className="profileid">{profile.id}</CTableDataCell>
              <CTableDataCell>{profile.FullName ? profile.FullName : 'N/A'}</CTableDataCell>
              <CTableDataCell className ="verification-status">
                  {profile.verification_status === 1 ? (
                    <>
                      <span className="verification-pending">Pending</span>
                      <code className="verification-code verification-pending">Code-1</code>
                    </>
                  ) : profile.verification_status === 2 ? (
                    <>
                      <span className="verification-confirmed">Confirmed</span>
                      <code className="verification-code verification-confirmed">Code-2</code>
                    </>
                  ) : profile.verification_status === null ? (
                    <>
                      <span className="verification-na">N/A</span>
                      <code className="verification-code verification-na">Code-null</code>
                    </>
                  ) : (
                    <>
                      <span>Unknown Status</span>
                      <code className="verification-code">Code-{profile.verification_status}</code>
                    </>
                  )}
              </CTableDataCell>
              <CTableDataCell>{new Date(profile.createdAt).toLocaleString()}</CTableDataCell>
              <CTableDataCell>{new Date(profile.updatedAt).toLocaleString()}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <CPagination aria-label="Page navigation example">
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
      </div>
      {selectedProfile && (
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="xl" scrollable>
          <CModalHeader>
            <CModalTitle>Profile Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow>
              <CCol>
                <p><strong>ID:</strong> {selectedProfile.id}</p>
                <p><strong>Full Name:</strong> {selectedProfile.FullName || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedProfile.Email || 'N/A'}</p>
                <p><strong>DL Verification:</strong> {selectedProfile.Dlverification || 'N/A'}</p>
                <p><strong>Aadhar Verification ID:</strong> {selectedProfile.AadharVfid || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedProfile.Address || 'N/A'}</p>
                <p>
                  <strong>Verification Status:</strong>
                  {selectedProfile.verification_status === 1 ? (
                    <>
                      <span style={{ color: 'orange' }}> Pending </span>
                      <code className='p-2 border rounded' style={{ color: 'orange' }}>Code-1</code>
                    </>
                  ) : selectedProfile.verification_status === 2 ? (
                    <>
                      <span style={{ color: 'green' }}> Confirmed </span>
                      <code className='p-2 border rounded' style={{ color: 'green' }}>Code-2</code>
                    </>
                  ) : selectedProfile.verification_status === null ? (
                    <>
                      <span style={{ color: 'red' }}> N/A </span>
                      <code className='p-2 border rounded' style={{ color: 'red' }}>Code-null</code>
                    </>
                  ) : (
                    <>
                      <span>Unknown Status</span>
                      <code className='p-2 border rounded'>Code-{selectedProfile.verification_status}</code>
                    </>
                  )}
                </p>
                <p><strong>Created At:</strong> {new Date(selectedProfile.createdAt).toLocaleString()}</p>
                <p><strong>Updated At:</strong> {new Date(selectedProfile.updatedAt).toLocaleString()}</p>
              </CCol>
            </CRow>
            <CRow className="mt-4 border rounded p-3">
              <CCol xs="4" className='d-flex flex-column align-items-center justify-content-center'>
                <p><strong>Profile Pic:</strong></p>
                {selectedProfile.profilepic ? (
                  <CImage 
                    src={selectedProfile.profilepic} 
                    width={100} 
                    height={150} 
                    className='border rounded'
                    onClick={() => handleImageClick(selectedProfile.profilepic)} 
                    style={{ cursor: 'pointer', objectFit: 'cover' }} 
                  />
                ) : (
                  <div className="empty-image-placeholder d-flex flex-column align-items-center justify-content-center">
                    <span><FaTimesCircle style={{ color: 'grey' }} /> Not Uploaded</span>
                  </div>
                )}
              </CCol>
              <CCol xs="4" className='d-flex flex-column align-items-center justify-content-center'>
                <p><strong>DL:</strong></p>
                {selectedProfile.dl ? (
                  <FileDisplay fileUrl={selectedProfile.dl} />
                ) : (
                  <div className="empty-image-placeholder d-flex flex-column align-items-center justify-content-center">
                    <span><FaTimesCircle style={{ color: 'grey' }} /> Not Uploaded</span>
                  </div>
                )}
              </CCol>
              <CCol xs="4" className='d-flex flex-column align-items-center justify-content-center'>
                <p><strong>Aadhar:</strong></p>
                {selectedProfile.aadhar ? (
                  <FileDisplay fileUrl={selectedProfile.aadhar} />
                ) : (
                  <div className="empty-image-placeholder d-flex flex-column align-items-center justify-content-center">
                    <span><FaTimesCircle style={{ color: 'grey' }} /> Not Uploaded</span>
                  </div>
                )}
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter className='d-flex align-items-center justify-content-between'>
            <CButton color="danger" onClick={() => handleDecline(selectedProfile.id)} className='d-flex align-items-center justify-content-center'>
              <span>Decline</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="svg-size" style={{marginLeft: '5px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </CButton>
            <CButton color="success" onClick={() => handleApprove(selectedProfile.id)} className='d-flex align-items-center justify-content-center'>
              <span>Approve</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="svg-size" style={{marginLeft: '5px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </CButton>
          </CModalFooter>
        </CModal>
      )}
      
      {enlargedImage && (
        <CModal visible={!!enlargedImage} onClose={() => setEnlargedImage(null)} size="lg">
          <CModalBody className="enlarged-image-modal">
            <CImage src={enlargedImage} />
          </CModalBody>
        </CModal>
      )}
    </div>
  );
};

export default UserVerification;
