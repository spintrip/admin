import React, { useEffect, useState, useCallback } from 'react';
import { getCars, fetchCarById, updateCar } from '../../../api/car';
import DocsExample from '../../../components/DocsExample';
import {
  CTable,
  CTableBody,
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
  CButton,
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
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../../../scss/cars.css';

const Cars = () => {
  const [carData, setCarData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [originalCarData, setOriginalCarData] = useState(null);
  const [updateCarData, setUpdateCarData] = useState({});
  const [updateAdditionalInfo, setUpdateAdditionalInfo] = useState({});
  const [carById, setCarById] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [error , setError] = useState('')
  const [updateAdditionalInfoModalVisible, setUpdateAdditionalInfoModalVisible] = useState(false);
  const [enlargedImage , setEnlargedImage] = useState(null);
  const limit = 20;
  const visiblePages = 3;
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    if (!token) {
      console.log('No token Found');
      navigate('/login');
    }
    try {
      const data = await getCars();
      setCarData(data);
      setFilteredData(data);
    } catch (error) {
      setError(error.message);
    }
  } , [token , navigate])

  useEffect(() => {
    fetchData();
  }, []);

  const handleCar = useCallback(async (id) => {
    try {
      const dataByID = await fetchCarById(id);
      setCarById(dataByID.car);
      setOriginalCarData(dataByID.car);
      const additionalInfo = dataByID.car.additionalInfo || {};
      setUpdateCarData({
        carmodel: dataByID.car.carmodel || '',
        type: dataByID.car.type || '',
        brand: dataByID.car.brand || '',
        variant: dataByID.car.variant || '',
        color: dataByID.car.color || '',
        chassisno: dataByID.car.chassisno || '',
        Rcnumber: dataByID.car.Rcnumber || '',
        mileage: dataByID.car.mileage || '',
        Enginenumber: dataByID.car.Enginenumber || '',
        Registrationyear: dataByID.car.Registrationyear || '',
        bodytype: dataByID.car.bodytype || '',
        rating: dataByID.car.rating || '',
      });
      setUpdateAdditionalInfo({
        HorsePower: additionalInfo.HorsePower || '',
        AC: additionalInfo.AC ? 'Yes' : 'No',
        Musicsystem: additionalInfo.Musicsystem ? 'Yes' : 'No',
        Autowindow: additionalInfo.Autowindow ? 'Yes' : 'No',
        Sunroof: additionalInfo.Sunroof ? 'Yes' : 'No',
        Touchscreen: additionalInfo.Touchscreen ? 'Yes' : 'No',
        Sevenseater: additionalInfo.Sevenseater ? 'Yes' : 'No',
        Reversecamera: additionalInfo.Reversecamera ? 'Yes' : 'No',
        Transmission: additionalInfo.Transmission ? 'Yes' : 'No',
        Airbags: additionalInfo.Airbags ? 'Yes' : 'No',
        FuelType: additionalInfo.FuelType ? 'Yes' : 'No',
        PetFriendly: additionalInfo.PetFriendly ? 'Yes' : 'No',
        PowerSteering: additionalInfo.PowerSteering ? 'Yes' : 'No',
        ABS: additionalInfo.ABS ? 'Yes' : 'No',
        tractionControl: additionalInfo.tractionControl ? 'Yes' : 'No',
        fullBootSpace: additionalInfo.fullBootSpace ? 'Yes' : 'No',
        KeylessEntry: additionalInfo.KeylessEntry ? 'Yes' : 'No',
        airPurifier: additionalInfo.airPurifier ? 'Yes' : 'No',
        cruiseControl: additionalInfo.cruiseControl ? 'Yes' : 'No',
        voiceControl: additionalInfo.voiceControl ? 'Yes' : 'No',
        usbCharger: additionalInfo.usbCharger ? 'Yes' : 'No',
        bluetooth: additionalInfo.bluetooth ? 'Yes' : 'No',
        airFreshner: additionalInfo.airFreshner ? 'Yes' : 'No',
        ventelatedFrontSeat: additionalInfo.ventelatedFrontSeat ? 'Yes' : 'No',
        Additionalinfo: additionalInfo.Additionalinfo || '',
        latitude: additionalInfo.latitude || '',
        longitude: additionalInfo.longitude || '',
        address: additionalInfo.address || '',
      });
    } catch (error) {
      setError(error.message);
    }
  },[fetchCarById, setCarById, setOriginalCarData, setUpdateCarData, setUpdateAdditionalInfo]);

  const handleCarByIdClick = (car) => {
    handleCar(car.carid);
    setModalVisible(true);
  };

  const handleOpenUpdateForm = () => {
    setUpdateModalVisible(true);
    setModalVisible(false);
  };

  const handleOpenUpdateAdditionalInfoForm = () => {
    setUpdateAdditionalInfoModalVisible(true);
    setModalVisible(false);
  };

  const handleUpdateCar = useCallback(async (e) => {
    e.preventDefault();

    const updatedFields = {};
    for (let key in updateCarData) {
      const originalValue = originalCarData[key];
      const updatedValue = updateCarData[key];
  
      // Check for changes and avoid sending unchanged or empty fields
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
        await updateCar(carById.carid, updatedFields);
        setUpdateModalVisible(false);
        fetchData();
        setError(''); 
      } catch (error) {
        setError(error.message);
      }
    } else {
      console.log('No changes detected');
      setUpdateModalVisible(false);
    }
  },[updateCarData , originalCarData , fetchData]);

  const handleUpdateAdditionalInfo = useCallback(async (e) => {
    e.preventDefault();

    const updatedAdditionalFields = {};
    for (let key in updateAdditionalInfo) {
      const originalValue = carById.additionalInfo[key];
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
        await updateCar(carById.carid, { additionalInfo: updatedAdditionalFields });
        setUpdateAdditionalInfoModalVisible(false);
        fetchData();
        setError(null);
      } catch (error) {
        setError(error.message);
      }
    } else {
      setUpdateAdditionalInfoModalVisible(false);
    }
  } , [updateAdditionalInfo ,carById, fetchData]);

  useEffect(() => {
    const filterCars = () => {
      if (!searchInput) {
        setFilteredData(carData);
        setCurrentPage(1);
      } else {
        const filtered = carData.filter((car) => {
          if (selectedSearchOption === 'all') {
            return Object.values(car).some(value =>
              value && value.toString().toLowerCase().includes(searchInput.toLowerCase())
            );
          } else {
            const value = car[selectedSearchOption];
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
    filterCars();
  }, [carData, selectedSearchOption, searchInput]);

  const totalPages = Math.ceil(filteredData.length / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedCars = filteredData.slice((currentPage - 1) * limit, currentPage * limit);

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
    { label: 'Car Model', value: 'carmodel' },
    { label: 'Type', value: 'type' },
    { label: 'Brand', value: 'brand' },
    { label: 'Chassis No', value: 'chassisno' },
    { label: 'RC Number', value: 'Rcnumber' },
    { label: 'Engine Number', value: 'Enginenumber' },
    { label: 'Registration Year', value: 'Registrationyear' },
    { label: 'Body Type', value: 'bodytype' },
    { label: 'Car ID', value: 'carid' },
    { label: 'Rating', value: 'rating' },
    { label: 'Host ID', value: 'hostId' },
    { label: 'Created At', value: 'createdAt' },
    { label: 'Updated At', value: 'updatedAt' },
  ];

  return (
    <div>
      {error ? (
        <div className='error-message'> {error} </div>
      ) : (
        <div className="container-fluid">
        <div className='container-fluid px-4 d-flex align-items-center justify-content-between'>
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
          <DocsExample href="components/table#hoverable-rows ">
          <CTable className = "car-table" color="dark" hover>
            <CTableHead>
              <CTableRow className="cars-header">
                {/* Table Headers */}
                <CTableHeaderCell scope="col">#</CTableHeaderCell>
                <CTableHeaderCell scope="col">Car ID</CTableHeaderCell>
                <CTableHeaderCell scope="col">Host ID</CTableHeaderCell>
                <CTableHeaderCell scope="col">Car Model</CTableHeaderCell>
                <CTableHeaderCell scope="col">Type</CTableHeaderCell>
                <CTableHeaderCell scope="col">Brand</CTableHeaderCell>
                <CTableHeaderCell scope="col">Chassis No</CTableHeaderCell>
                <CTableHeaderCell scope="col">RC Number</CTableHeaderCell>
                <CTableHeaderCell scope="col">Engine Number</CTableHeaderCell>
                <CTableHeaderCell scope="col">Registration Year</CTableHeaderCell>
                <CTableHeaderCell scope="col">Verification</CTableHeaderCell>
                <CTableHeaderCell scope="col">Rating</CTableHeaderCell>
                <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
                <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {displayedCars.map((car, index) => (
                <CTableRow key={car.carid} onClick={() => handleCarByIdClick(car)}>
                <CTableHeaderCell scope="row">
                  {(currentPage - 1) * limit + index + 1}
                </CTableHeaderCell>
                <CTableDataCell>{car.carid || 'N/A'}</CTableDataCell>
                <CTableDataCell>{car.hostId || 'N/A'}</CTableDataCell>
                <CTableDataCell>{car.carmodel || 'N/A'}</CTableDataCell>
                <CTableDataCell>{car.type || 'N/A'}</CTableDataCell>
                <CTableDataCell>{car.brand || 'N/A'}</CTableDataCell>
                <CTableDataCell>{car.chassisno || 'N/A'}</CTableDataCell>
                <CTableDataCell>{car.Rcnumber || 'N/A'}</CTableDataCell>
                <CTableDataCell>{car.Enginenumber ? car.Enginenumber : ''}</CTableDataCell>
                <CTableDataCell>{car.Registrationyear || 'N/A'}</CTableDataCell>
                <CTableDataCell>
                  <div>
                    {car.additionalInfo.verification_status === 1 ? (
                      <>
                        <span className="m-2" style={{ color: 'orange', display: 'block' }}>Pending</span>
                        <code className="p-2 border rounded" style={{ color: 'orange', display: 'block' }}>Code-1</code>
                      </>
                    ) : car.additionalInfo.verification_status === 2 ? (
                      <>
                        <span className="m-2" style={{ color: 'lightgreen', display: 'block' }}>Confirmed</span>
                        <code className="p-2 border rounded" style={{ color: 'lightgreen', display: 'block' }}>Code-2</code>
                      </>
                    ) : car.additionalInfo.verification_status === null ? (
                      <>
                        <span className="m-2" style={{ color: 'red', display: 'block' }}>N/A</span>
                        <code className="p-2 border rounded" style={{ color: 'red', display: 'block' }}>Code-N/A </code>
                      </>
                    ) : (
                      <>
                        <span className="m-2" style={{ display: 'block' }}>Unknown Status</span>
                        <code className="p-2 border rounded" style={{ display: 'block' }}>Code-{car.additionalInfo.verification_status}</code>
                      </>
                    )}
                  </div>
                </CTableDataCell>
                <CTableDataCell>{car.rating?.toFixed(2) || 'N/A'}</CTableDataCell>
                <CTableDataCell>{new Date(car.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{new Date(car.updatedAt).toLocaleString()}</CTableDataCell>
              </CTableRow>
              
              ))}
            </CTableBody>
          </CTable>
          </DocsExample>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <CPagination aria-label="Page navigation example">
              <CPaginationItem disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                Previous
              </CPaginationItem>
              {getVisiblePages().map((page) => (
                <CPaginationItem key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                  {page}
                </CPaginationItem>
              ))}
              <CPaginationItem disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                Next
              </CPaginationItem>
            </CPagination>
          </div>

          {/* Modal for Car Details */}
          {carById && (
            <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="xl" scrollable>
              <CModalHeader>
                <CModalTitle>Car Details</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CRow>
                  <CCol xs={5} className="car-modal">
                    <p><strong>Car Id:</strong> {carById.carid || 'N/A'}</p>
                    <p><strong>Host Id:</strong> {carById.hostId || 'N/A'}</p>
                    <p><strong>Car Model:</strong> {carById.carmodel || 'N/A'}</p>
                    <p><strong>Type:</strong> {carById.type || 'N/A'}</p>
                    <p><strong>Brand:</strong> {carById.brand || 'N/A'}</p>
                    <p><strong>Variant:</strong> {carById.variant || 'N/A'}</p>
                    <p><strong>Color:</strong> {carById.color || 'N/A'}</p>
                    <p><strong>Chassis No:</strong> {carById.chassisno || 'N/A'}</p>
                    <p><strong>RC Number:</strong> {carById.Rcnumber || 'N/A'}</p>
                    <p><strong>Engine Number:</strong> {carById.Enginenumber || 'N/A'}</p>
                    <p><strong>Registration Year:</strong> {carById.Registrationyear || 'N/A'}</p>
                    <p><strong>Body Type:</strong> {carById.bodytype || 'N/A'}</p>
                    <p><strong>Rating:</strong> {carById.rating?.toFixed(2) || 'N/A'}</p>
                    <p><strong>Mileage:</strong> {carById.mileage || 'N/A'}</p>
                  </CCol>
                  <CCol xs={1} className="d-flex justify-content-center align-items-stretch">
                    <div style={{ borderLeft: '1px solid #dee2e6', height: '100%' }}></div>
                  </CCol>
                  <CCol xs={5} className="car-modal">
                    <h3>Additional Info: </h3>
                    <p><strong>Horse Power:</strong> {carById.additionalInfo?.HorsePower || 'N/A'}</p>
                    <p><strong>AC:</strong> {carById.additionalInfo?.AC ? 'Yes' : 'No'}</p>
                    <p><strong>Music System:</strong> {carById.additionalInfo?.Musicsystem ? 'Yes' : 'No'}</p>
                    <p><strong>Autowindow:</strong> {carById.additionalInfo?.Autowindow ? 'Yes' : 'No'}</p>
                    <p><strong>Sunroof:</strong> {carById.additionalInfo?.Sunroof ? 'Yes' : 'No'}</p>
                    <p><strong>Touchscreen:</strong> {carById.additionalInfo?.Touchscreen ? 'Yes' : 'No'}</p>
                    <p><strong>Sevenseater:</strong> {carById.additionalInfo?.Sevenseater ? 'Yes' : 'No'}</p>
                    <p><strong>Reverse Camera:</strong> {carById.additionalInfo?.Reversecamera ? 'Yes' : 'No'}</p>
                    <p><strong>Transmission:</strong> {carById.additionalInfo?.Transmission ? 'Yes' : 'No'}</p>
                    <p><strong>Airbags:</strong> {carById.additionalInfo?.Airbags ? 'Yes' : 'No'}</p>
                    <p><strong>Fuel Type:</strong> {carById.additionalInfo?.FuelType ? 'Yes' : 'No'}</p>
                    <p><strong>Pet Friendly:</strong> {carById.additionalInfo?.PetFriendly ? 'Yes' : 'No'}</p>
                    <p><strong>Power Steering:</strong> {carById.additionalInfo?.PowerSteering ? 'Yes' : 'No'}</p>
                    <p><strong>ABS:</strong> {carById.additionalInfo?.ABS ? 'Yes' : 'No'}</p>
                    <p><strong>Traction Control:</strong> {carById.additionalInfo?.tractionControl ? 'Yes' : 'No'}</p>
                    <p><strong>Full Boot Space:</strong> {carById.additionalInfo?.fullBootSpace ? 'Yes' : 'No'}</p>
                    <p><strong>Keyless Entry:</strong> {carById.additionalInfo?.KeylessEntry ? 'Yes' : 'No'}</p>
                    <p><strong>Air Purifier:</strong> {carById.additionalInfo?.airPurifier ? 'Yes' : 'No'}</p>
                    <p><strong>Cruise Control:</strong> {carById.additionalInfo?.cruiseControl ? 'Yes' : 'No'}</p>
                    <p><strong>Voice Control:</strong> {carById.additionalInfo?.voiceControl ? 'Yes' : 'No'}</p>
                    <p><strong>USB Charger:</strong> {carById.additionalInfo?.usbCharger ? 'Yes' : 'No'}</p>
                    <p><strong>Bluetooth:</strong> {carById.additionalInfo?.bluetooth ? 'Yes' : 'No'}</p>
                    <p><strong>Air Freshner:</strong> {carById.additionalInfo?.airFreshner ? 'Yes' : 'No'}</p>
                    <p><strong>Ventilated Front Seat:</strong> {carById.additionalInfo?.ventelatedFrontSeat ? 'Yes' : 'No'}</p>
                    <p><strong>Additional Info:</strong> {carById.additionalInfo?.Additionalinfo || 'N/A'}</p>
                    <p><strong>Address:</strong> {carById.additionalInfo?.address || 'N/A'}</p>
                    <p><strong>Latitude:</strong> {carById.additionalInfo?.latitude || 'N/A'}</p>
                    <p><strong>Longitude:</strong> {carById.additionalInfo?.longitude || 'N/A'}</p>
                  </CCol>
                </CRow>
                <hr />
                <CRow>
                  <CCol xs={6} className="d-flex justify-content-center">
                    <div className="image-container mt-2">
                      <p><strong>Car Image 1:</strong></p>
                      {carById.additionalInfo?.carimage1 ? (
                        <CImage
                          className="border rounded img-interactive"
                          src={carById.additionalInfo.carimage1}
                          width={200}
                          height={150}
                          onClick={() => handleImageClick(carById.additionalInfo.carimage1)}
                        />
                      ) : (
                        <div className="empty-image-placeholder">
                          <span><FaTimesCircle /> Not Uploaded</span>
                        </div>
                      )}
                    </div>
                  </CCol>
                  <CCol xs={6} className="d-flex justify-content-center">
                    <div className="image-container mt-2">
                      <p><strong>Car Image 2:</strong></p>
                      {carById.additionalInfo?.carimage2 ? (
                        <CImage
                          className="border rounded img-interactive"
                          src={carById.additionalInfo.carimage2}
                          width={200}
                          height={150}
                          onClick={() => handleImageClick(carById.additionalInfo.carimage2)}
                        />
                      ) : (
                        <div className="empty-image-placeholder">
                          <span><FaTimesCircle /> Not Uploaded</span>
                        </div>
                      )}
                    </div>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol xs={6} className="d-flex justify-content-center">
                    <div className="image-container mt-2">
                      <p><strong>Car Image 3:</strong></p>
                      {carById.additionalInfo?.carimage3 ? (
                        <CImage
                          className="border rounded img-interactive"
                          src={carById.additionalInfo.carimage3}
                          width={200}
                          height={150}
                          onClick={() => handleImageClick(carById.additionalInfo.carimage3)}
                        />
                      ) : (
                        <div className="empty-image-placeholder">
                          <span><FaTimesCircle /> Not Uploaded</span>
                        </div>
                      )}
                    </div>
                  </CCol>
                  <CCol xs={6} className="d-flex justify-content-center">
                    <div className="image-container mt-2">
                      <p><strong>Car Image 4:</strong></p>
                      {carById.additionalInfo?.carimage4 ? (
                        <CImage
                          className="border rounded img-interactive"
                          src={carById.additionalInfo.carimage4}
                          width={200}
                          height={150}
                          onClick={() => handleImageClick(carById.additionalInfo.carimage4)}
                        />
                      ) : (
                        <div className="empty-image-placeholder">
                          <span><FaTimesCircle /> Not Uploaded</span>
                        </div>
                      )}
                    </div>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol xs={6} className="d-flex justify-content-center">
                    <div className="image-container mt-2">
                      <p><strong>Car Image 5:</strong></p>
                      {carById.additionalInfo?.carimage5 ? (
                        <CImage
                          className="border rounded img-interactive"
                          src={carById.additionalInfo.carimage5}
                          width={200}
                          height={150}
                          onClick={() => handleImageClick(carById.additionalInfo.carimage5)}
                        />
                      ) : (
                        <div className="empty-image-placeholder">
                          <span><FaTimesCircle /> Not Uploaded</span>
                        </div>
                      )}
                    </div>
                  </CCol>
                </CRow>
              </CModalBody>
              <CModalFooter className="d-flex align-items-center justify-content-end">
                <CButton className="btn-interactive basicInfo" onClick={handleOpenUpdateForm}>
                  Update Info
                </CButton>
                <CButton className="btn-interactive additionalInfo" onClick={handleOpenUpdateAdditionalInfoForm}>
                  Update Additional Info
                </CButton>
              </CModalFooter>
            </CModal>
          )}

          {/* Modal for Updating Car Basic Info */}
          {updateModalVisible && (
            <CModal visible={updateModalVisible} onClose={() => setUpdateModalVisible(false)}>
              <CModalHeader>
                <CModalTitle>Update Car Info</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Car Model</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updateCarData.carmodel}
                        onChange={(e) => setUpdateCarData({ ...updateCarData, carmodel: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Type</CFormLabel>
                      <CFormSelect
                        value={updateCarData.type}
                        onChange={(e) => setUpdateCarData({ ...updateCarData, type: e.target.value })}
                      >
                        <option value="Compact SUV">Compact SUV</option>
                        <option value="Sedan">Sedan</option>
                        <option value="MUV">MUV</option>
                        <option value="SUV">SUV</option>
                        <option value="Hatchback">Hatchback</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Brand</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updateCarData.brand}
                        onChange={(e) => setUpdateCarData({ ...updateCarData, brand: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Variant</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updateCarData.variant}
                        onChange={(e) => setUpdateCarData({ ...updateCarData, variant: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Color</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updateCarData.color}
                        onChange={(e) => setUpdateCarData({ ...updateCarData, color: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Chassis No</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updateCarData.chassisno}
                        onChange={(e) => setUpdateCarData({ ...updateCarData, chassisno: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>RC Number</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updateCarData.Rcnumber}
                        onChange={(e) => setUpdateCarData({ ...updateCarData, Rcnumber: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Mileage</CFormLabel>
                      <CFormInput
                        type="number"
                        value={updateCarData.mileage || ''}
                        onChange={(e) => setUpdateCarData({ ...updateCarData, mileage: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Engine Number</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updateCarData.Enginenumber}
                        onChange={(e) => setUpdateCarData({ ...updateCarData, Enginenumber: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Registration Year</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updateCarData.Registrationyear || ''}
                        onChange={(e) => setUpdateCarData({ ...updateCarData, Registrationyear: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Body Type</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updateCarData.bodytype}
                        onChange={(e) => setUpdateCarData({ ...updateCarData, bodytype: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Rating</CFormLabel>
                      <CFormInput
                        type="number"
                        value={updateCarData.rating || ''}
                        onChange={(e) => setUpdateCarData({ ...updateCarData, rating: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton color="success" onClick={handleUpdateCar}>
                  Update Data
                </CButton>
              </CModalFooter>
            </CModal>
          )}

          {/* Modal for Updating Car Additional Info */}
          {updateAdditionalInfoModalVisible && (
            <CModal visible={updateAdditionalInfoModalVisible} onClose={() => setUpdateAdditionalInfoModalVisible(false)}>
              <CModalHeader>
                <CModalTitle>Update Additional Info</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm>
                  {/* Form Inputs for Additional Info */}
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Horse Power</CFormLabel>
                      <CFormInput
                        type="number"
                        value={updateAdditionalInfo.HorsePower || ''}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, HorsePower: e.target.value })}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>AC</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.AC}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, AC: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Music System</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.Musicsystem}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, Musicsystem: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Autowindow</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.Autowindow}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, Autowindow: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Sunroof</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.Sunroof}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, Sunroof: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Touchscreen</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.Touchscreen}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, Touchscreen: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Seven Seater</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.Sevenseater}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, Sevenseater: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Reverse Camera</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.Reversecamera}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, Reversecamera: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Transmission</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.Transmission}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, Transmission: e.target.value })}
                      >
                        <option value="Yes">Automatic</option>
                        <option value="No">Manual</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Airbags</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.Airbags}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, Airbags: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Fuel Type</CFormLabel>
                      <CFormSelect
                        type="text"
                        value={updateAdditionalInfo.FuelType || ''}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, FuelType: e.target.value })}
                      >
                        <option value="Yes">Diesel</option>
                        <option value="No">Petrol</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Pet Friendly</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.PetFriendly}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, PetFriendly: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Power Steering</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.PowerSteering}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, PowerSteering: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>ABS</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.ABS}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, ABS: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Traction Control</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.tractionControl}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, tractionControl: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Full Boot Space</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.fullBootSpace}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, fullBootSpace: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Keyless Entry</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.KeylessEntry}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, KeylessEntry: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Air Purifier</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.airPurifier}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, airPurifier: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Cruise Control</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.cruiseControl}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, cruiseControl: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Voice Control</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.voiceControl}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, voiceControl: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>USB Charger</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.usbCharger}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, usbCharger: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Bluetooth</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.bluetooth}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, bluetooth: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Air Freshner</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.airFreshner}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, airFreshner: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Ventilated Front Seat</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.ventelatedFrontSeat}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, ventelatedFrontSeat: e.target.value })}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Additional Info</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updateAdditionalInfo.Additionalinfo || ''}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, Additionalinfo: e.target.value })}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Address</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updateAdditionalInfo.address || ''}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, address: e.target.value })}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Latitude</CFormLabel>
                      <CFormInput
                        type="number"
                        value={updateAdditionalInfo.latitude || ''}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, latitude: e.target.value })}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Longitude</CFormLabel>
                      <CFormInput
                        type="number"
                        value={updateAdditionalInfo.longitude || ''}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, longitude: e.target.value })}
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
        </div>
      )}
    </div>
  );
};

export default Cars;
