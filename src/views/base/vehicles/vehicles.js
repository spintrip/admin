import React, { useEffect, useState, useCallback } from 'react';
import { getvehicles, fetchvehicleById, updatevehicle } from '../../../api/vehicle';
import { fetchUserById } from '../../../api/user';
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
  CImage,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaMapMarkerAlt } from 'react-icons/fa';
import '../../../scss/vehicles.css';
import DataTable from 'react-data-table-component';
const customStyles = {
  header: {
    style: {
      backgroundColor: 'transparent',
      color: '#ffffff',
    },
  },
  headRow: {
    style: {
      backgroundColor: '#212631',
      color: '#ffffff',
    },
  },
  headCells: {
    style: {
      color: '#ffffff',
    },
  },
  rows: {
    style: {
      backgroundColor: '#282D37',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: 'black',
      },
    },
  },
  pagination: {
    style: {
      backgroundColor: '#343a40',
      color: '#ffffff',
    },
  },
};
const columns = [
  {
    name: 'vehicle Id',
    selector: (row) => row.vehicleid, // Assuming 'vehicleid' is the key in your data
    sortable: true,
  },
  {
    name: 'Host ID',
    selector: (row) => row.hostId, // Assuming 'hostId' is the key in your data
    sortable: true,
  },
  // {
  //   name: 'Vehicle Model',
  //   selector: (row) => row.vehiclemodel, // Assuming 'vehicleModel' is the key in your data
  //   sortable: true,
  // },
  {
    name: 'Type',
    selector: (row) => row.vehicletype, // Assuming 'type' is the key in your data
    sortable: true,
  },
  {
    name: 'Verification',
    selector: row => {
      switch (row.additionalInfo?.verification_status) {
        case 1:
          return "Pending";
        case 2:
          return "Verified";
        default:
          return "Not Uploaded";
      }
    },
    sortable: true,
    cell: row => {
      let statusText;
      let className;
  
      switch (row.additionalInfo?.verification_status) {
        case 1:
          statusText = "Pending";
          className = "p-1 rounded border border-primary text-white bg-primary w-100 text-center";
          break;
        case 2:
          statusText = "Verified";
          className = "p-1 rounded border border-success text-white bg-success w-100 text-center";
          break;
        default:
          statusText = "Not Uploaded";
          className = "p-1 rounded border border-light text-black bg-white w-100 text-center";
      }
  
      return <div key={row.id+row.additionalInfo.verification_status} className={className}>{statusText}</div>;
    },
  },
  {
    name: 'Brand',
    selector: (row) => row.brand, // Assuming 'brand' is the key in your data
    sortable: true,
  },
  {
    name: 'Chassis No',
    selector: (row) => row.chassisno, // Assuming 'chassisNo' is the key in your data
    sortable: true,
  },
  {
    name: 'RC Number',
    selector: (row) => row.Rcnumber, // Assuming 'rcNumber' is the key in your data
    sortable: true,
  },
  {
    name: 'Engine Number',
    selector: (row) => row.Enginenumber, // Assuming 'engineNumber' is the key in your data
    sortable: true,
  },
  {
    name: 'Registration Year',
    selector: (row) => row.Registrationyear, // Assuming 'registrationYear' is the key in your data
    sortable: true,
  },


  {
    name: 'Rating',
    selector: (row) => row.rating? row.rating : 0, // Assuming 'rating' is the key in your data
    sortable: true,
  },
  {
    name: 'Created At',
    selector: row => new Date(row.createdAt), // Return the Date object for sorting
    sortable: true,
    cell: row => new Date(row.createdAt).toLocaleString(), // Display as a formatted string
  },
  {
    name: 'Updated At',
    selector: row => new Date(row.updatedAt), // Return the Date object for sorting
    sortable: true,
    cell: row => new Date(row.updatedAt).toLocaleString(), // Display as a formatted string
  },
];

const vehicles = () => {
  const [vehicleData, setvehicleData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [originalvehicleData, setOriginalvehicleData] = useState(null);
  const [updatevehicleData, setUpdatevehicleData] = useState({});
  const [updateAdditionalInfo, setUpdateAdditionalInfo] = useState({});
  const [vehicleById, setvehicleById] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [error , setError] = useState('')
  const [updateAdditionalInfoModalVisible, setUpdateAdditionalInfoModalVisible] = useState(false);
  const [enlargedImage , setEnlargedImage] = useState(null);
  const [hostData , setHostData] = useState('');
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    if (!token) {
      console.log('No token Found');
      navigate('/login');
    }
    try {
      const data = await getvehicles();
      setvehicleData(data);
      setFilteredData(data);
    } catch (error) {
      setError(error.message);
    }
  } , [token , navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const handlevehicle = useCallback(async (id) => {
    try {
      const dataByID = await fetchvehicleById(id);
      setvehicleById(dataByID.vehicle);
      setOriginalvehicleData(dataByID.vehicle);
      const additionalInfo = dataByID.vehicle.additionalInfo || {};
      setUpdatevehicleData({
        vehiclemodel: dataByID.vehicle.vehiclemodel || '',
        type: dataByID.vehicle.type || '',
        brand: dataByID.vehicle.brand || '',
        variant: dataByID.vehicle.variant || '',
        color: dataByID.vehicle.color || '',
        chassisno: dataByID.vehicle.chassisno || '',
        Rcnumber: dataByID.vehicle.Rcnumber || '',
        mileage: dataByID.vehicle.mileage || '',
        Enginenumber: dataByID.vehicle.Enginenumber || '',
        Registrationyear: dataByID.vehicle.Registrationyear || '',
        bodytype: dataByID.vehicle.bodytype || '',
        rating: dataByID.vehicle.rating || '',
      });
      setUpdateAdditionalInfo({
        verification_status: additionalInfo.verification_status || null,
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
  },[fetchvehicleById, setvehicleById, setOriginalvehicleData, setUpdatevehicleData, setUpdateAdditionalInfo]);

  const handleHost = useCallback(async (id) => {
    try {
      const dataByID = await fetchUserById(id);
      
      if (dataByID && dataByID.user) { 
        setHostData(dataByID.user);
      } else {
        throw new Error('User data not found');
      }
    } catch (error) {
      console.error('Error fetching user by ID:', error);
    
    }
  }, [fetchUserById, setHostData]);

  const handlevehicleByIdClick = (vehicle) => {
    handlevehicle(vehicle.vehicleid);
    handleHost(vehicle.hostId)
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

  const handleUpdatevehicle = useCallback(async (e) => {
    e.preventDefault();

    const updatedFields = {};
    for (let key in updatevehicleData) {
      const originalValue = originalvehicleData[key];
      const updatedValue = updatevehicleData[key];
  
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
        await updatevehicle(vehicleById.vehicleid, updatedFields);
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
  },[updatevehicleData , originalvehicleData , fetchData]);

  const handleUpdateAdditionalInfo = useCallback(async (e) => {
    e.preventDefault();

    const updatedAdditionalFields = {};
    for (let key in updateAdditionalInfo) {
      const originalValue = vehicleById.additionalInfo[key];
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
        await updatevehicle(vehicleById.vehicleid, { additionalInfo: updatedAdditionalFields });
        setUpdateAdditionalInfoModalVisible(false);
        fetchData();
        setError(null);
      } catch (error) {
        setError(error.message);
      }
    } else {
      setUpdateAdditionalInfoModalVisible(false);
    }
  } , [updateAdditionalInfo ,vehicleById, fetchData]);

  useEffect(() => {
    const filtervehicles = () => {
      let sortedData = [...vehicleData];
      sortedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (!searchInput) {
        setFilteredData(sortedData);
      } else {
        const filtered = sortedData.filter((vehicle) => {
          if (selectedSearchOption === 'all') {
            return Object.values(vehicle).some(value =>
              value && value.toString().toLowerCase().includes(searchInput.toLowerCase())
            );
          } else {
            const value = vehicle[selectedSearchOption];
            if (selectedSearchOption === 'createdAt' || selectedSearchOption === 'updatedAt') {
              const formattedDate = new Date(value).toLocaleString();
              return formattedDate && formattedDate.toLowerCase().includes(searchInput.toLowerCase());
            }
            return value && value.toString().toLowerCase().includes(searchInput.toLowerCase());
          }
        });
        setFilteredData(filtered);
        
      }
    };
    filtervehicles();
  }, [vehicleData, selectedSearchOption, searchInput]);



  const displayedvehicles = filteredData


  const handleImageClick = (imageUrl) => {
    setEnlargedImage(imageUrl);
  };

  const tableHeaders = [
    { label: 'All', value: 'all' },
    { label: 'Vehicle Model', value: 'vehiclemodel' },
    { label: 'Type', value: 'type' },
    { label: 'Brand', value: 'brand' },
    { label: 'Chassis No', value: 'chassisno' },
    { label: 'RC Number', value: 'Rcnumber' },
    { label: 'Engine Number', value: 'Enginenumber' },
    { label: 'Registration Year', value: 'Registrationyear' },
    { label: 'Body Type', value: 'bodytype' },
    { label: 'Vehicle ID', value: 'vehicleid' },
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
        <div className='container-fluid px-4 d-flex align-items-center justify-content-end'>
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
          <div className='container-fluid h-fit-content '>
          <DataTable
                  columns={columns}
                  data={displayedvehicles}
                  customStyles={customStyles}
                  responsive={true}
                  title={'Vehicles Table'}
                  highlightOnHover={true}
                  pointerOnHover={true}
                  fixedHeader={true}
                  onRowClicked={(vehicle)=>handlevehicleByIdClick(vehicle)}
          />
        </div>
          

          {/* Modal for vehicle Details */}
          {vehicleById && (
            <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="xl" scrollable>
              <CModalHeader>
                <CModalTitle>Vehicles Details</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CRow>
                  <CCol xs={5} className="vehicle-modal">
                    <p><strong>Vehicle Id:</strong> {vehicleById.vehicleid || 'N/A'}</p>
                    <p><strong>Host Id:</strong> {vehicleById.hostId || 'N/A'}</p>
                    <p><strong>vehicle Model:</strong> {vehicleById.vehiclemodel || 'N/A'}</p>
                    <p><strong>Type:</strong> {vehicleById.type || 'N/A'}</p>
                    <p><strong>Brand:</strong> {vehicleById.brand || 'N/A'}</p>
                    <p><strong>Variant:</strong> {vehicleById.variant || 'N/A'}</p>
                    <p><strong>Color:</strong> {vehicleById.color || 'N/A'}</p>
                    <p><strong>Chassis No:</strong> {vehicleById.chassisno || 'N/A'}</p>
                    <p><strong>RC Number:</strong> {vehicleById.Rcnumber || 'N/A'}</p>
                    <p><strong>Engine Number:</strong> {vehicleById.Enginenumber || 'N/A'}</p>
                    <p><strong>Registration Year:</strong> {vehicleById.Registrationyear || 'N/A'}</p>
                    <p><strong>Body Type:</strong> {vehicleById.bodytype || 'N/A'}</p>
                    <p><strong>Rating:</strong> {vehicleById.rating?.toFixed(2) || 'N/A'}</p>
                    <p><strong>Mileage:</strong> {vehicleById.mileage || 'N/A'}</p>
                    <h3>Host</h3>
                    <p><strong>Phone:</strong> {hostData.phone || 'N/A'}</p>
                    <p><strong>Name:</strong> {hostData.additionalInfo?.FullName || 'N/A'}</p>
                    <p><strong>Email:</strong> {hostData.additionalInfo?.Email || 'N/A'}</p>
                  </CCol>
                  <CCol xs={1} className="d-flex justify-content-center align-items-stretch">
                    <div style={{ borderLeft: '1px solid #dee2e6', height: '100%' }}></div>
                  </CCol>
                  <CCol xs={5} className="vehicle-modal">
                    <h3>Additional Info: </h3>
                    <p>
                      <strong>Status: </strong>
                      {vehicleById.additionalInfo?.verification_status === 1 && (
                        <span className="p-1 status-view rounded border border-primary text-white bg-primary w-100 text-center">
                          Pending
                        </span>
                      )}
                      {vehicleById.additionalInfo?.verification_status === 2 && (
                        <span className="p-1 status-view rounded border border-success text-white bg-success w-100 text-center">
                          Verified
                        </span>
                      )}
                      {(vehicleById.additionalInfo?.verification_status !== 1 && vehicleById.additionalInfo?.verification_status !== 2) && (
                        <span className="p-1 status-view rounded border border-light text-black bg-white w-100 text-center">
                          Not Uploaded
                        </span>
                      )}
                    </p>

                    <p><strong>Horse Power:</strong> {vehicleById.additionalInfo?.HorsePower || 'N/A'}</p>
                    <p><strong>AC:</strong> {vehicleById.additionalInfo?.AC ? 'Yes' : 'No'}</p>
                    <p><strong>Music System:</strong> {vehicleById.additionalInfo?.Musicsystem ? 'Yes' : 'No'}</p>
                    <p><strong>Autowindow:</strong> {vehicleById.additionalInfo?.Autowindow ? 'Yes' : 'No'}</p>
                    <p><strong>Sunroof:</strong> {vehicleById.additionalInfo?.Sunroof ? 'Yes' : 'No'}</p>
                    <p><strong>Touchscreen:</strong> {vehicleById.additionalInfo?.Touchscreen ? 'Yes' : 'No'}</p>
                    <p><strong>Sevenseater:</strong> {vehicleById.additionalInfo?.Sevenseater ? 'Yes' : 'No'}</p>
                    <p><strong>Reverse Camera:</strong> {vehicleById.additionalInfo?.Reversecamera ? 'Yes' : 'No'}</p>
                    <p><strong>Transmission:</strong> {vehicleById.additionalInfo?.Transmission ? 'Yes' : 'No'}</p>
                    <p><strong>Airbags:</strong> {vehicleById.additionalInfo?.Airbags ? 'Yes' : 'No'}</p>
                    <p><strong>Fuel Type:</strong> {vehicleById.additionalInfo?.FuelType ? 'Yes' : 'No'}</p>
                    <p><strong>Pet Friendly:</strong> {vehicleById.additionalInfo?.PetFriendly ? 'Yes' : 'No'}</p>
                    <p><strong>Power Steering:</strong> {vehicleById.additionalInfo?.PowerSteering ? 'Yes' : 'No'}</p>
                    <p><strong>ABS:</strong> {vehicleById.additionalInfo?.ABS ? 'Yes' : 'No'}</p>
                    <p><strong>Traction Control:</strong> {vehicleById.additionalInfo?.tractionControl ? 'Yes' : 'No'}</p>
                    <p><strong>Full Boot Space:</strong> {vehicleById.additionalInfo?.fullBootSpace ? 'Yes' : 'No'}</p>
                    <p><strong>Keyless Entry:</strong> {vehicleById.additionalInfo?.KeylessEntry ? 'Yes' : 'No'}</p>
                    <p><strong>Air Purifier:</strong> {vehicleById.additionalInfo?.airPurifier ? 'Yes' : 'No'}</p>
                    <p><strong>Cruise Control:</strong> {vehicleById.additionalInfo?.cruiseControl ? 'Yes' : 'No'}</p>
                    <p><strong>Voice Control:</strong> {vehicleById.additionalInfo?.voiceControl ? 'Yes' : 'No'}</p>
                    <p><strong>USB Charger:</strong> {vehicleById.additionalInfo?.usbCharger ? 'Yes' : 'No'}</p>
                    <p><strong>Bluetooth:</strong> {vehicleById.additionalInfo?.bluetooth ? 'Yes' : 'No'}</p>
                    <p><strong>Air Freshner:</strong> {vehicleById.additionalInfo?.airFreshner ? 'Yes' : 'No'}</p>
                    <p><strong>Ventilated Front Seat:</strong> {vehicleById.additionalInfo?.ventelatedFrontSeat ? 'Yes' : 'No'}</p>
                    <p><strong>Additional Info:</strong> {vehicleById.additionalInfo?.Additionalinfo || 'N/A'}</p>
                    <p><strong>Address:</strong> {vehicleById.additionalInfo?.address || 'N/A'}</p>
                    <p>
                      <strong>Location: </strong>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <span>{vehicleById.additionalInfo?.latitude}, {vehicleById.additionalInfo?.longitude}</span>
                        <a 
                          href={`https://www.google.com/maps?q=${vehicleById.additionalInfo?.latitude},${vehicleById.additionalInfo?.longitude}&hl=es`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ marginLeft: '8px' }}
                        >
                          <FaMapMarkerAlt style={{ color: 'orange', cursor: 'pointer' }} />
                        </a>
                      </span>
                    </p>
                  </CCol>
                </CRow>
                <hr />
                <CRow>
                  <CCol xs={6} className="d-flex justify-content-center">
                    <div className="image-container mt-2">
                      <p><strong>vehicle Image 1:</strong></p>
                      {vehicleById.additionalInfo?.vehicleimage1 ? (
                        <CImage
                          className="border rounded img-interactive"
                          src={vehicleById.additionalInfo.vehicleimage1}
                          width={200}
                          height={150}
                          onClick={() => handleImageClick(vehicleById.additionalInfo.vehicleimage1)}
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
                      <p><strong>vehicle Image 2:</strong></p>
                      {vehicleById.additionalInfo?.vehicleimage2 ? (
                        <CImage
                          className="border rounded img-interactive"
                          src={vehicleById.additionalInfo.vehicleimage2}
                          width={200}
                          height={150}
                          onClick={() => handleImageClick(vehicleById.additionalInfo.vehicleimage2)}
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
                      <p><strong>vehicle Image 3:</strong></p>
                      {vehicleById.additionalInfo?.vehicleimage3 ? (
                        <CImage
                          className="border rounded img-interactive"
                          src={vehicleById.additionalInfo.vehicleimage3}
                          width={200}
                          height={150}
                          onClick={() => handleImageClick(vehicleById.additionalInfo.vehicleimage3)}
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
                      <p><strong>vehicle Image 4:</strong></p>
                      {vehicleById.additionalInfo?.vehicleimage4 ? (
                        <CImage
                          className="border rounded img-interactive"
                          src={vehicleById.additionalInfo.vehicleimage4}
                          width={200}
                          height={150}
                          onClick={() => handleImageClick(vehicleById.additionalInfo.vehicleimage4)}
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
                      <p><strong>vehicle Image 5:</strong></p>
                      {vehicleById.additionalInfo?.vehicleimage5 ? (
                        <CImage
                          className="border rounded img-interactive"
                          src={vehicleById.additionalInfo.vehicleimage5}
                          width={200}
                          height={150}
                          onClick={() => handleImageClick(vehicleById.additionalInfo.vehicleimage5)}
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

          {/* Modal for Updating vehicle Basic Info */}
          {updateModalVisible && (
            <CModal visible={updateModalVisible} onClose={() => setUpdateModalVisible(false)}>
              <CModalHeader>
                <CModalTitle>Update vehicle Info</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>vehicle Model</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updatevehicleData.vehiclemodel}
                        onChange={(e) => setUpdatevehicleData({ ...updatevehicleData, vehiclemodel: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Type</CFormLabel>
                      <CFormSelect
                        value={updatevehicleData.type}
                        onChange={(e) => setUpdatevehicleData({ ...updatevehicleData, type: e.target.value })}
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
                        value={updatevehicleData.brand}
                        onChange={(e) => setUpdatevehicleData({ ...updatevehicleData, brand: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Variant</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updatevehicleData.variant}
                        onChange={(e) => setUpdatevehicleData({ ...updatevehicleData, variant: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Color</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updatevehicleData.color}
                        onChange={(e) => setUpdatevehicleData({ ...updatevehicleData, color: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Chassis No</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updatevehicleData.chassisno}
                        onChange={(e) => setUpdatevehicleData({ ...updatevehicleData, chassisno: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>RC Number</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updatevehicleData.Rcnumber}
                        onChange={(e) => setUpdatevehicleData({ ...updatevehicleData, Rcnumber: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Mileage</CFormLabel>
                      <CFormInput
                        type="number"
                        value={updatevehicleData.mileage || ''}
                        onChange={(e) => setUpdatevehicleData({ ...updatevehicleData, mileage: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Engine Number</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updatevehicleData.Enginenumber}
                        onChange={(e) => setUpdatevehicleData({ ...updatevehicleData, Enginenumber: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Registration Year</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updatevehicleData.Registrationyear || ''}
                        onChange={(e) => setUpdatevehicleData({ ...updatevehicleData, Registrationyear: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Body Type</CFormLabel>
                      <CFormInput
                        type="text"
                        value={updatevehicleData.bodytype}
                        onChange={(e) => setUpdatevehicleData({ ...updatevehicleData, bodytype: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Rating</CFormLabel>
                      <CFormInput
                        type="number"
                        value={updatevehicleData.rating || ''}
                        onChange={(e) => setUpdatevehicleData({ ...updatevehicleData, rating: e.target.value })}
                      />
                    </CCol>
                  </CRow>
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton color="success" onClick={handleUpdatevehicle}>
                  Update Data
                </CButton>
              </CModalFooter>
            </CModal>
          )}

          {/* Modal for Updating vehicle Additional Info */}
          {updateAdditionalInfoModalVisible && (
            <CModal visible={updateAdditionalInfoModalVisible} onClose={() => setUpdateAdditionalInfoModalVisible(false)}>
              <CModalHeader>
                <CModalTitle>Update Additional Info</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm>
                <CRow className="mb-3">
                    <CCol>
                      <CFormLabel>Status</CFormLabel>
                      <CFormSelect
                        value={updateAdditionalInfo.verification_status}
                        onChange={(e) => setUpdateAdditionalInfo({ ...updateAdditionalInfo, verification_status: e.target.value === "null" ? null : parseInt(e.target.value, 10) })}
                      >
                        <option value="null">Not Uploaded</option>
                        <option value="1">Pending</option>
                        <option value="2">Verified</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>
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
            <CModal visible={!!enlargedImage} onClose={() => setEnlargedImage(null)} size="xl">
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

export default vehicles;
