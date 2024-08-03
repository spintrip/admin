import React, { useEffect, useState } from 'react';
import { getCarVerififcation , approveCarVerification } from '../../../api/car';
import DocsExample from '../../../components/DocsExample';
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
  CImage,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButton,
  CCol,
  CRow,
} from '@coreui/react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const CarProfiles = () => {
  const [carProfilesData, setCarProfilesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
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
      const data = await getCarVerififcation();
      setCarProfilesData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPages = Math.ceil((carProfilesData?.length || 0) / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedCarProfiles = (carProfilesData || []).slice((currentPage - 1) * limit, currentPage * limit);

  const getVisiblePages = () => {
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  const handleProfileClick = (profile) => {
    setSelectedProfile(profile);
    setModalVisible(true);
  };

  const handleApprove = async(carId) => {
    try{
        await approveCarVerification(carId);
        setModalVisible(false);
        fetchData();
    } catch (error){
        console.log(error);
    }
  };

  const handleDecline = () => {
    // Decline logic here
    setModalVisible(false);
  };

  const renderBooleanIcon = (value) => {
    return value ? <FaCheckCircle style={{ color: 'green' }} /> : <FaTimesCircle style={{ color: 'red' }} />;
  };

  return (
    <div className='container-fluid'>
      <DocsExample href="components/table#hoverable-rows">
        <CTable color="dark" hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              <CTableHeaderCell scope="col">Car ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Horse Power</CTableHeaderCell>
              <CTableHeaderCell scope="col">AC</CTableHeaderCell>
              <CTableHeaderCell scope="col">Music System</CTableHeaderCell>
              <CTableHeaderCell scope="col">Verification Status</CTableHeaderCell>
              <CTableHeaderCell scope="col">Latitude</CTableHeaderCell>
              <CTableHeaderCell scope="col">Longitude</CTableHeaderCell>
              <CTableHeaderCell scope="col">Address</CTableHeaderCell>
              <CTableHeaderCell scope="col">Sunroof</CTableHeaderCell>
              <CTableHeaderCell scope="col">Touchscreen</CTableHeaderCell>
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {displayedCarProfiles.map((profile, index) => (
              <CTableRow key={profile.carid} onClick={() => handleProfileClick(profile)}>
                <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
                <CTableDataCell style={{ cursor: 'pointer' }}>{profile.carid}</CTableDataCell>
                <CTableDataCell>{profile.HorsePower}</CTableDataCell>
                <CTableDataCell>{profile.AC ? 'Yes' : 'No'}</CTableDataCell>
                <CTableDataCell>{profile.Musicsystem ? 'Yes' : 'No'}</CTableDataCell>
                <CTableDataCell>{profile.verification_status}</CTableDataCell>
                <CTableDataCell>{profile.latitude.toFixed(6)}</CTableDataCell>
                <CTableDataCell>{profile.longitude.toFixed(6)}</CTableDataCell>
                <CTableDataCell>{profile.address}</CTableDataCell>
                <CTableDataCell>{profile.Sunroof ? 'Yes' : 'No'}</CTableDataCell>
                <CTableDataCell>{profile.Touchscreen ? 'Yes' : 'No'}</CTableDataCell>
                <CTableDataCell>{new Date(profile.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{new Date(profile.updatedAt).toLocaleString()}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </DocsExample>
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
            <CModalTitle>Car Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow>
              <CCol>
                <p><strong>Car ID:</strong> {selectedProfile.carid}</p>
                <p><strong>Horse Power:</strong> {selectedProfile.HorsePower}</p>
                <p><strong>AC:</strong> {renderBooleanIcon(selectedProfile.AC)}</p>
                <p><strong>Music System:</strong> {renderBooleanIcon(selectedProfile.Musicsystem)}</p>
                <p><strong>Auto Window:</strong> {renderBooleanIcon(selectedProfile.Autowindow)}</p>
                <p><strong>Sunroof:</strong> {renderBooleanIcon(selectedProfile.Sunroof)}</p>
                <p><strong>Touchscreen:</strong> {renderBooleanIcon(selectedProfile.Touchscreen)}</p>
                <p><strong>Seven Seater:</strong> {renderBooleanIcon(selectedProfile.Sevenseater)}</p>
                <p><strong>Reverse Camera:</strong> {renderBooleanIcon(selectedProfile.Reversecamera)}</p>
                <p><strong>Transmission:</strong> {renderBooleanIcon(selectedProfile.Transmission)}</p>
                <p><strong>Airbags:</strong> {renderBooleanIcon(selectedProfile.Airbags)}</p>
                <p><strong>Fuel Type:</strong> {renderBooleanIcon(selectedProfile.FuelType)}</p>
                <p><strong>Pet Friendly:</strong> {renderBooleanIcon(selectedProfile.PetFriendly)}</p>
                <p><strong>Power Steering:</strong> {renderBooleanIcon(selectedProfile.PowerSteering)}</p>
                <p><strong>ABS:</strong> {renderBooleanIcon(selectedProfile.ABS)}</p>
                <p><strong>Traction Control:</strong> {renderBooleanIcon(selectedProfile.tractionControl)}</p>
                <p><strong>Full Boot Space:</strong> {renderBooleanIcon(selectedProfile.fullBootSpace)}</p>
                <p><strong>Keyless Entry:</strong> {renderBooleanIcon(selectedProfile.KeylessEntry)}</p>
                <p><strong>Air Purifier:</strong> {renderBooleanIcon(selectedProfile.airPurifier)}</p>
                <p><strong>Cruise Control:</strong> {renderBooleanIcon(selectedProfile.cruiseControl)}</p>
                <p><strong>Voice Control:</strong> {renderBooleanIcon(selectedProfile.voiceControl)}</p>
                <p><strong>USB Charger:</strong> {renderBooleanIcon(selectedProfile.usbCharger)}</p>
                <p><strong>Bluetooth:</strong> {renderBooleanIcon(selectedProfile.bluetooth)}</p>
                <p><strong>Air Freshener:</strong> {renderBooleanIcon(selectedProfile.airFreshner)}</p>
                <p><strong>Ventilated Front Seat:</strong> {renderBooleanIcon(selectedProfile.ventelatedFrontSeat)}</p>
                <p><strong>Verification Status:</strong> {selectedProfile.verification_status}</p>
                <p><strong>Address:</strong> {selectedProfile.address}</p>
                <p><strong>Created At:</strong> {new Date(selectedProfile.createdAt).toLocaleString()}</p>
                <p><strong>Updated At:</strong> {new Date(selectedProfile.updatedAt).toLocaleString()}</p>
              </CCol>
            </CRow>
            <CRow className="mt-4 border rounded p-3">
              <CCol xs="6" className='d-flex flex-column align-items-center justify-content-center'>
                <p><strong>Car Image 1:</strong></p>
                <CImage
                  className='border rounded'
                  src={selectedProfile.carimage1}
                  width={200}
                  height={150}
                  style={{ cursor: 'pointer', objectFit: 'cover' }}
                />
              </CCol>
              <CCol xs="6" className='d-flex flex-column align-items-center justify-content-center'>
                <p><strong>Car Image 2:</strong></p>
                <CImage
                  className='border rounded'
                  src={selectedProfile.carimage2}
                  width={200}
                  height={150}
                  style={{ cursor: 'pointer', objectFit: 'cover' }}
                />
              </CCol>
              <CCol xs="12" className='d-flex flex-column align-items-center justify-content-center mt-3'>
                <p><strong>Location:</strong></p>
                <iframe
                src={`https://www.google.com/maps?q=${selectedProfile.latitude},${selectedProfile.longitude}&hl=es;z=14&output=embed`}
                className="iframe-video border rounded"
                frameBorder="0"
                style={{ width: '100%', height: '300px', border: '0' }}
                />
                <p> {`lat =${selectedProfile.latitude}, long=  ${selectedProfile.longitude}`}</p>
             </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter className='d-flex align-items-center justify-content-between'>
            <CButton color="success" onClick={() => handleApprove(selectedProfile.carid)} className='d-flex  align-items-center justify-content-center'>
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
    </div>
  );
};

export default CarProfiles;
