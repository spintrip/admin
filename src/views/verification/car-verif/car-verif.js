import React, { useEffect, useState, useCallback } from 'react';
import { getCarVerififcation , approveCarVerification, rejectCarVerification } from '../../../api/car';
import DocsExample from '../../../components/DocsExample';
import { fetchUserById } from '../../../api/user';
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
  CInputGroup,
  CFormInput,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../../../scss/verif.css';

const CarProfiles = () => {
  const [carProfilesData, setCarProfilesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filteredData , setFilteredData] = useState([]);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [hostById, setHostById] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('carid');
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
      const data = await getCarVerififcation();
      setCarProfilesData(data);
      console.log(carProfilesData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleHost = useCallback(async (id) => {
    try {
      const dataByID = await fetchUserById(id);
      
      if (dataByID && dataByID.user) { 
        setHostById(dataByID.user);
        console.log(hostById)
      } else {
        throw new Error('User data not found');
      }
    } catch (error) {
      console.error('Error fetching user by ID:', error);
    
    }
  }, [fetchUserById, setHostById]);

  useEffect(() => {
    const filterCarVerif = () =>{
      if(!searchInput){
        setFilteredData(carProfilesData)
        setCurrentPage(1);
      } else {
        const filtered = carProfilesData.filter((user) => {
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
    filterCarVerif();
  }, [carProfilesData , selectedSearchOption, searchInput] )

  const totalPages = Math.ceil((carProfilesData?.length || 0) / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedCarProfiles = (filteredData || []).slice((currentPage - 1) * limit, currentPage * limit);

  const getVisiblePages = () => {
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  const handleProfileClick = (profile) => {
    setSelectedProfile(profile);
    setModalVisible(true);
    handleHost(profile.car.hostId);
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

  const handleDecline = async(carId) => {
    try{
      await rejectCarVerification(carId);
      setModalVisible(false);
      fetchData();
  } catch (error){
      console.log(error);
  }
   
  };

  const renderBooleanIcon = (value) => {
    return value ? <FaCheckCircle style={{ color: 'green' }} /> : <FaTimesCircle style={{ color: 'red' }} />;
  };
  
  const handleImageClick = (imageUrl) => {
    setEnlargedImage(imageUrl);
  };

  const tableHeaders = [
    { label: 'Car Id', value: 'carid' },
    { label: 'Host Id', value: 'hostId' },
    { label: 'Car Model', value: 'carmodel'},
    { label: 'Type', value: 'type' },
    { label: 'Verif. Status', value: 'verification_status' },
    { label: 'Latitude', value: 'latitude' },
    { label: 'Longitude', value: 'longitude' },
    { label: 'Address', value: 'address' },
    { label: 'Created At', value: 'createdAt' },
    { label: 'Updated At', value: 'updatedAt' },
  ];

  return (
    <div className='container-fluid'>
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
        <CTable color="dark" hover className='carVerif-table'>
          <CTableHead>
            <CTableRow className = "row-style">
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              <CTableHeaderCell scope="col">Car ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Host ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Car Model</CTableHeaderCell>
              <CTableHeaderCell scope="col">Type</CTableHeaderCell>
              <CTableHeaderCell scope="col">Brand</CTableHeaderCell>
              <CTableHeaderCell scope="col">Verification Status</CTableHeaderCell>
              <CTableHeaderCell scope="col">Latitude</CTableHeaderCell>
              <CTableHeaderCell scope="col">Longitude</CTableHeaderCell>
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {displayedCarProfiles.map((profile, index) => (
              <CTableRow key={profile.carid} >
                <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
                <CTableDataCell className='carId' onClick={() => handleProfileClick(profile) }>{profile.carid}</CTableDataCell>
                <CTableDataCell>{profile.car.hostId || 'N/A'}</CTableDataCell>
                <CTableDataCell>{profile.car.carmodel || 'N/A'}</CTableDataCell>
                <CTableDataCell>{profile.car.type || 'N/A'}</CTableDataCell>
                <CTableDataCell>{profile.car.brand || 'N/A'}</CTableDataCell>
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
                <CTableDataCell>{profile.latitude.toFixed(6)}</CTableDataCell>
                <CTableDataCell>{profile.longitude.toFixed(6)}</CTableDataCell>
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
            <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="xl" scrollable>
              <CModalHeader>
                <CModalTitle className='d-flex align-items-center justify-content-between w-100'>
                  <h3>Car Details</h3>
                  <span className='rounded p-1 bg-light text-black mx-2'>{selectedProfile.carid}</span> 
                </CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CRow>
                  {/* Left Column - Car Details */}
                  <CCol md={6} className='d-flex flex-column align-items-start'>
                    <h5>Car Details</h5>
                    <ul className='list-unstyled'>
                      <li className='custom-detail-table'><strong>Model:</strong> <span>{selectedProfile.car.carmodel}</span> </li>
                      <li className='custom-detail-table'><strong>Brand:</strong> {selectedProfile.car.brand}</li>
                      <li className='custom-detail-table'><strong>Type:</strong> {selectedProfile.car.type}</li>
                      <li className='custom-detail-table'><strong>Variant:</strong> {selectedProfile.car.variant}</li>
                      <li className='custom-detail-table'><strong>Color:</strong> {selectedProfile.car.color}</li>
                      <li className='custom-detail-table'><strong>Chassis No:</strong> {selectedProfile.car.chassisno}</li>
                      <li className='custom-detail-table'><strong>RC Number:</strong> {selectedProfile.car.Rcnumber}</li>
                      <li className='custom-detail-table'><strong>Engine Number:</strong> {selectedProfile.car.Enginenumber}</li>
                      <li className='custom-detail-table'><strong>Year:</strong> {new Date(selectedProfile.car.Registrationyear).toLocaleDateString()}</li>
                      <li className='custom-detail-table'><strong>Body Type:</strong> {selectedProfile.car.bodytype}</li>
                      <li className='custom-detail-table'><strong>Rating:</strong> {selectedProfile.car.rating || 'N/A'}</li>
                      <h6 className='host-section-title mt-4'>Host</h6>
                          <li className='custom-detail-table'><strong>Host ID:</strong> <span style={{fontSize: '12px'}}>{hostById.additionalInfo?.id || 'N/A'}</span> </li>
                          <li className='custom-detail-table'><strong>Name:</strong> {hostById.additionalInfo?.FullName || 'N/A'}</li>
                          <li className='custom-detail-table'><strong>Phone:</strong> {hostById.phone || 'N/A'}</li>
                          <li className='custom-detail-table'><strong>Email:</strong> {hostById.additionalInfo?.Email || 'N/A'}</li>
                        
                    </ul>
                  </CCol>
                  
                  {/* Right Column - Other Details */}
                  <CCol md={6} className='d-flex flex-column align-items-start'>
                  <h5>Additional Info</h5>
                  <CRow>
                    <CCol md={6}>
                      <ul className='list-additional'>
                        <li><strong>Horse Power:</strong> {selectedProfile.HorsePower}</li>
                        <li><strong>AC:</strong> {renderBooleanIcon(selectedProfile.AC)}</li>
                        <li><strong>Music System:</strong> {renderBooleanIcon(selectedProfile.Musicsystem)}</li>
                        <li><strong>Auto Window:</strong> {renderBooleanIcon(selectedProfile.Autowindow)}</li>
                        <li><strong>Sunroof:</strong> {renderBooleanIcon(selectedProfile.Sunroof)}</li>
                        <li><strong>Touchscreen:</strong> {renderBooleanIcon(selectedProfile.Touchscreen)}</li>
                        <li><strong>Seven Seater:</strong> {renderBooleanIcon(selectedProfile.Sevenseater)}</li>
                        <li><strong>Reverse Camera:</strong> {renderBooleanIcon(selectedProfile.Reversecamera)}</li>
                        <li><strong>Transmission:</strong> {renderBooleanIcon(selectedProfile.Transmission)}</li>
                        <li><strong>Airbags:</strong> {renderBooleanIcon(selectedProfile.Airbags)}</li>
                        <li><strong>Fuel Type:</strong> {renderBooleanIcon(selectedProfile.FuelType)}</li>
                        <li><strong>Pet Friendly:</strong> {renderBooleanIcon(selectedProfile.PetFriendly)}</li>
                      </ul>
                    </CCol>
                    <CCol md={6}>
                      <ul className='list-additional'>
                        <li><strong>Power Steering:</strong> {renderBooleanIcon(selectedProfile.PowerSteering)}</li>
                        <li><strong>ABS:</strong> {renderBooleanIcon(selectedProfile.ABS)}</li>
                        <li><strong>Traction Control:</strong> {renderBooleanIcon(selectedProfile.tractionControl)}</li>
                        <li><strong>Full Boot Space:</strong> {renderBooleanIcon(selectedProfile.fullBootSpace)}</li>
                        <li><strong>Keyless Entry:</strong> {renderBooleanIcon(selectedProfile.KeylessEntry)}</li>
                        <li><strong>Air Purifier:</strong> {renderBooleanIcon(selectedProfile.airPurifier)}</li>
                        <li><strong>Cruise Control:</strong> {renderBooleanIcon(selectedProfile.cruiseControl)}</li>
                        <li><strong>Voice Control:</strong> {renderBooleanIcon(selectedProfile.voiceControl)}</li>
                        <li><strong>USB Charger:</strong> {renderBooleanIcon(selectedProfile.usbCharger)}</li>
                        <li><strong>Bluetooth:</strong> {renderBooleanIcon(selectedProfile.bluetooth)}</li>
                        <li><strong>Air Freshener:</strong> {renderBooleanIcon(selectedProfile.airFreshner)}</li>
                        <li><strong>Ventilated Front Seat:</strong> {renderBooleanIcon(selectedProfile.ventelatedFrontSeat)}</li>
                      </ul>
                    </CCol>
                  </CRow>
                </CCol>

                </CRow>
                
                {/* Images and Location */}
                <CRow className="mt-4 border rounded p-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <CCol key={index} xs="6" className='d-flex flex-column align-items-center justify-content-center mb-3'>
                      <p><strong>{`Car Image ${index + 1}:`}</strong></p>
                      {selectedProfile[`carimage${index + 1}`] ? (
                        <CImage
                          className='border rounded'
                          src={selectedProfile[`carimage${index + 1}`]}
                          width={200}
                          height={150}
                          style={{ cursor: 'pointer', objectFit: 'cover' }}
                          onClick={() => handleImageClick(selectedProfile[`carimage${index + 1}`])} 
                        />
                      ) : (
                        <div className="empty-image-placeholder d-flex flex-column align-items-center justify-content-center">
                          <span><FaTimesCircle style={{ color: 'grey' }} /> Not Uploaded</span>
                        </div>
                      )}
                    </CCol>
                  ))}
                  <CCol xs="12" className='d-flex flex-column align-items-center justify-content-center mt-3'>
                    <p><strong>Location:</strong></p>
                    <iframe
                      src={`https://www.google.com/maps?q=${selectedProfile.latitude},${selectedProfile.longitude}&hl=es;z=14&output=embed`}
                      className="iframe-video border rounded"
                      frameBorder="0"
                      style={{ width: '100%', height: '300px', border: '0' }}
                    />
                    <p>{`lat = ${selectedProfile.latitude}, long= ${selectedProfile.longitude}`}</p>
                  </CCol>
                </CRow>
              </CModalBody>
              <CModalFooter className='d-flex align-items-center justify-content-between'>
                <CButton color="success" onClick={() => handleApprove(selectedProfile.carid)} className='d-flex align-items-center justify-content-center'>
                  <span>Approve</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="svg-size" style={{marginLeft: '5px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </CButton>
                <CButton color="danger" onClick={() => handleDecline(selectedProfile.carid)} className='d-flex align-items-center justify-content-center'>
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
              <CModalBody className="enlarged-image-modal">
                <div className='image-fit'>
                <CImage src={enlargedImage} className='responsive-image'/>
                </div>
              </CModalBody>
            </CModal>
          )}
    </div>
  );
};

export default CarProfiles;
