import React, { useEffect, useState } from 'react';
import { fetchUserVerification, approveUserVerification } from '../../../api/user';
import { useNavigate } from 'react-router-dom';
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
} from '@coreui/react';

const UserVerification = () => {
  const [userProfilesData, setUserProfilesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);
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

  const totalPages = Math.ceil((userProfilesData?.length || 0) / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedProfiles = (userProfilesData || []).slice((currentPage - 1) * limit, currentPage * limit);

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
    } catch(error){
        console.log(error);
    }
    
  };

  const handleDecline = () => {
    setModalVisible(false);
  };

  return (
    <div className='container-fluid'>
      <CTable  color="dark" hover>
        <CTableHead>
          <CTableRow>
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
              <CTableDataCell>{profile.id}</CTableDataCell>
              <CTableDataCell>{profile.FullName}</CTableDataCell>
              <CTableDataCell>{profile.verification_status}</CTableDataCell>
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
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg" scrollable>
          <CModalHeader>
            <CModalTitle>Profile Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow>
              <CCol>
                <p><strong>ID:</strong> {selectedProfile.id}</p>
                <p><strong>Full Name:</strong> {selectedProfile.FullName}</p>
                <p>
                    <strong>Verification Status:</strong> 
                    {selectedProfile.verification_status === 1 ? ' Image Uploaded ' : selectedProfile.verification_status === 2 ? 'Image Verified' : 'Unknown Status'}  
                    <code className='p-2 border rounded'>Code-{selectedProfile.verification_status}</code>
                </p>
                <p><strong>Created At:</strong> {new Date(selectedProfile.createdAt).toLocaleString()}</p>
                <p><strong>Updated At:</strong> {new Date(selectedProfile.updatedAt).toLocaleString()}</p>
              </CCol>
            </CRow>
            <CRow className="mt-4 border rounded p-3">
              <CCol xs="4" className='d-flex flex-column align-items-center justify-content-center'>
                <p><strong>Profile Pic:</strong></p>
                <CImage 
                  src={selectedProfile.profilepic} 
                  width={100} 
                  height={150} 
                  className='border rounded'
                  onClick={() => handleImageClick(selectedProfile.profilepic)} 
                  style={{ cursor: 'pointer', objectFit: 'cover' }} 
                />
              </CCol>
              <CCol xs="4" className='d-flex flex-column align-items-center justify-content-center'>
                <p><strong>DL:</strong></p>
                <CImage 
                  src={selectedProfile.dl} 
                  width={100} 
                  height={150} 
                  className='border rounded'
                  onClick={() => handleImageClick(selectedProfile.dl)} 
                  style={{ cursor: 'pointer' , objectFit: 'cover' }} 
                />
              </CCol>
              <CCol xs="4" className='d-flex flex-column align-items-center justify-content-center'>
                <p><strong>Aadhar:</strong></p>
                <CImage 
                  src={selectedProfile.aadhar} 
                  width={100} 
                  height={150} 
                  className='border rounded'
                  onClick={() => handleImageClick(selectedProfile.aadhar)} 
                  style={{ cursor: 'pointer', objectFit: 'cover' }} 
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter className='d-flex align-items-center justify-content-between'>
            <CButton color="success" onClick={() => handleApprove(selectedProfile.id)} className='d-flex  align-items-center justify-content-center'>
                <span>Approve</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="svg-size" style={{marginLeft: '5px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                </CButton>
            <CButton color="danger" onClick={handleDecline} className='d-flex  align-items-center justify-content-center'>
                <span>Decline</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="svg-size" style={{marginLeft: '5px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>

            </CButton>
          </CModalFooter>
        </CModal>
      )}
      {enlargedImage && (
        <CModal visible={!!enlargedImage} onClose={() => setEnlargedImage(null)} size="lg">
          <CModalBody style={{ display: 'flex', justifyContent: 'center' }}>
            <CImage src={enlargedImage} width="auto" height="auto" />
          </CModalBody>
        </CModal>
      )}
    </div>
  );
};

export default UserVerification;
