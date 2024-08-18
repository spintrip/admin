import React, { useEffect, useState } from 'react';
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
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import '../../../scss/cars.css';

const Cars = () => {
  const [carData, setCarData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [originalCarData, setOriginalCarData] = useState(null);
  const [updateCarData, setUpdateCarData] = useState({
    carmodel: "",
    type: "",
    brand: "",
    variant: "",
    color: "",
    chassisno: "",
    Rcnumber: "",
    mileage: null,
    Enginenumber: "",
    Registrationyear: null,
    bodytype: "",
    rating: null,
  });
  const [carById, setCarById] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
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
      const data = await getCars();
      setCarData(data);
      setFilteredData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCar = async (id) => {
    try {
      const dataByID = await fetchCarById(id);
      setCarById(dataByID.car);
      setOriginalCarData(dataByID.car);
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
    } catch (error) {
      console.log(error);
    }
  };

  const handleCarByIdClick = (car) => {
    handleCar(car.carid);
    console.log("Car ID: ", car.carid);
    setModalVisible(true);
  };

  const handleOpenUpdateForm = () => {
    setUpdateModalVisible(true);
    setModalVisible(false);
  };

  const handleUpdateCar = async (e) => {
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
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("No changes detected");
      setUpdateModalVisible(false);
    }
  };
  

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
    <div className='container-fluid'>
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
        <CTable color="dark" hover>
          <CTableHead>
            <CTableRow className='cars-header'>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              <CTableHeaderCell scope="col">Car ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Car Model</CTableHeaderCell>
              <CTableHeaderCell scope="col">Type</CTableHeaderCell>
              <CTableHeaderCell scope="col">Brand</CTableHeaderCell>
              <CTableHeaderCell scope="col">Chassis No</CTableHeaderCell>
              <CTableHeaderCell scope="col">RC Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Engine Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Registration Year</CTableHeaderCell>
              <CTableHeaderCell scope="col">Body Type</CTableHeaderCell>
              <CTableHeaderCell scope="col">Rating</CTableHeaderCell>
              <CTableHeaderCell scope="col">Host ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {displayedCars.map((car, index) => (
              <CTableRow key={car.carid} onClick={() => handleCarByIdClick(car)}>
                <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
                <CTableDataCell style={{ fontSize: '12px' }}>
                  {car.carid ? car.carid : 'N/A'}
                </CTableDataCell>
                <CTableDataCell>{car.carmodel}</CTableDataCell>
                <CTableDataCell>{car.type}</CTableDataCell>
                <CTableDataCell>{car.brand}</CTableDataCell>
                <CTableDataCell style={{ fontSize: '12px' }}>
                  {car.chassisno ? car.chassisno : 'N/A'}
                </CTableDataCell>
                <CTableDataCell>{car.Rcnumber}</CTableDataCell>
                <CTableDataCell>
                  {car.Enginenumber && car.Enginenumber.length > 10 ? `${car.Enginenumber.slice(0, 10)}...` : car.Enginenumber}
                </CTableDataCell>
                <CTableDataCell>{car.Registrationyear}</CTableDataCell>
                <CTableDataCell>{car.bodytype}</CTableDataCell>
                <CTableDataCell>
                  {car.rating !== null && car.rating !== undefined ? car.rating.toFixed(2) : 'N/A'}
                </CTableDataCell>
                <CTableDataCell>
                  {car.hostId ? car.hostId : 'N/A'}
                </CTableDataCell>
                <CTableDataCell>{new Date(car.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{new Date(car.updatedAt).toLocaleString()}</CTableDataCell>
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
      {carById && (
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg" scrollable>
          <CModalHeader>
            <CModalTitle>Car Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow>
              <CCol className='car-modal'>
                <p><strong>Car ID:</strong> {carById.carid || 'N/A'}</p>
                <p><strong>Car Model:</strong> {carById.carmodel || 'N/A'}</p>
                <p><strong>Type:</strong> {carById.type || 'N/A'}</p>
                <p><strong>Brand:</strong> {carById.brand || 'N/A'}</p>
                <p><strong>Variant:</strong> {carById.variant || 'N/A'}</p>
                <p><strong>Color:</strong> {carById.color || 'N/A'}</p>
                <p><strong>Chassis No:</strong> {carById.chassisno || 'N/A'}</p>
                <p><strong>RC Number:</strong> {carById.Rcnumber || 'N/A'}</p>
                <p><strong>Mileage:</strong> {carById.mileage || 'N/A'}</p>
                <p><strong>Engine Number:</strong> {carById.Enginenumber || 'N/A'}</p>
                <p><strong>Registration Year:</strong> {carById.Registrationyear || 'N/A'}</p>
                <p><strong>Body Type:</strong> {carById.bodytype || 'N/A'}</p>
                <p><strong>Rating:</strong> {carById.rating !== null && carById.rating !== undefined ? carById.rating.toFixed(2) : 'N/A'}</p>
                <p><strong>Host ID:</strong> {carById.hostId || 'N/A'}</p>
                <p><strong>Created At:</strong> {new Date(carById.createdAt).toLocaleString()}</p>
                <p><strong>Updated At:</strong> {new Date(carById.updatedAt).toLocaleString()}</p>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter className='d-flex align-items-center justify-content-end'>
            <CButton color="success" onClick={handleOpenUpdateForm}>
              <span style={{ color: 'white' }}>Update</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="svg-size" style={{ marginLeft: '5px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </CButton>
          </CModalFooter>
        </CModal>
      )}
      {updateModalVisible && (
        <CModal visible={updateModalVisible} onClose={() => setUpdateModalVisible(false)}>
          <CModalHeader>
            <CModalTitle>Update Car</CModalTitle>
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
                  <CFormInput
                    type="text"
                    value={updateCarData.type}
                    onChange={(e) => setUpdateCarData({ ...updateCarData, type: e.target.value })}
                  />
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
              <span style={{ color: 'white' }}>Update Data</span>
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </div>
  );
};

export default Cars;
