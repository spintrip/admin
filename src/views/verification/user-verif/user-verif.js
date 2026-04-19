import React, { useEffect, useState } from 'react';
import { fetchUserVerification, approveUserVerification , rejectUserVerification, deleteUser, convertHostToDriver } from '../../../api/user';
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
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [convertModalVisible, setConvertModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
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

  const handleDelete = async () => {
    if (!selectedProfile) return;
    setIsDeleting(true);
    try {
      await deleteUser(selectedProfile.id);
      setDeleteModalVisible(false);
      setModalVisible(false);
      fetchData();
      alert("User deleted successfully. They can now register again from scratch.");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConvertToDriver = async () => {
    if (!selectedProfile) return;
    setIsConverting(true);
    try {
      await convertHostToDriver(selectedProfile.id);
      setConvertModalVisible(false);
      setModalVisible(false);
      fetchData();
      alert(`Role transition complete! ${selectedProfile.FullName} is now a Driver. Their KYC data has been migrated and vehicles have been mirrored to the Cab system.`);
    } catch (error) {
      console.error("Conversion Error:", error);
      alert("Failed to convert role. Please check if the user has a valid Host profile.");
    } finally {
      setIsConverting(false);
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
                  ) : profile.verification_status === 0 ? (
                    <>
                      <span className="verification-na" style={{color: 'red'}}>Not Verified</span>
                      <code className="verification-code verification-na">Code-0</code>
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
                  ) : selectedProfile.verification_status === 0 ? (
                    <>
                      <span style={{ color: 'red' }}> Not Verified </span>
                      <code className='p-2 border rounded' style={{ color: 'red' }}>Code-0</code>
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
            <CButton color="danger" onClick={() => setDeleteModalVisible(true)} className='d-flex align-items-center justify-content-center'>
              <span>Delete Completely</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="svg-size" style={{marginLeft: '5px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </CButton>
            <div className="d-flex">
              <CButton color="warning" onClick={() => handleDecline(selectedProfile.id)} className='d-flex align-items-center justify-content-center me-2' style={{color: 'white'}}>
                <span>Reject</span>
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
            </div>
            <div className='d-flex'>
              <CButton color="info" onClick={() => setConvertModalVisible(true)} className='d-flex align-items-center justify-content-center text-white'>
                <span>Convert to Driver</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="svg-size" style={{marginLeft: '5px'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7.5L19.5 11M19.5 11L16 14.5M19.5 11H4.5M8 16.5L4.5 13M4.5 13L8 9.5M4.5 13H19.5" />
                </svg>
              </CButton>
            </div>
          </CModalFooter>
        </CModal>
      )}

      {/* Delete Confirmation Modal */}
      <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Confirm Complete Deletion</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p className="text-danger"><strong>WARNING:</strong> This will permanently delete the user <b>{selectedProfile?.FullName}</b> and all their records (Profile, Wallet, Bookings, etc.).</p>
          <p>This action cannot be undone. The user will be able to register again as a new user.</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModalVisible(false)} disabled={isDeleting}>Cancel</CButton>
          <CButton color="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Yes, Delete Completely"}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Convert to Driver Confirmation Modal */}
      <CModal visible={convertModalVisible} onClose={() => setConvertModalVisible(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Confirm Role Transition</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>You are about to convert <b>{selectedProfile?.FullName}</b> from a Host to a <b>Driver</b>.</p>
          <ul>
            <li>KYC data (Aadhar, Email, etc.) will be migrated automatically.</li>
            <li>All associated vehicles (Cabs, Cars, Bikes) will be assigned to this user as the Driver.</li>
            <li>User role will be updated to "Driver" immediately in the mobile app.</li>
          </ul>
          <p className="text-info">The user will NOT have to re-register or re-fill their details.</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setConvertModalVisible(false)} disabled={isConverting}>Cancel</CButton>
          <CButton color="info" onClick={handleConvertToDriver} disabled={isConverting} className="text-white">
            {isConverting ? "Converting..." : "Yes, Convert to Driver"}
          </CButton>
        </CModalFooter>
      </CModal>
      
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
