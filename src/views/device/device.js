import React, { useState , useEffect } from 'react';
import { getDevice , getAllDevices ,createCarDeviceAssign ,updateCarDeviceAssign , deleteCarDeviceAssign } from '../../api/deviceLocation';
import {
  CButton,
  CForm,
  CFormInput,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/react';
import '../../scss/device.css'
import { CIcon } from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilReload } from '@coreui/icons';
import Map from './mapComponent2';
import { useNavigate } from 'react-router-dom';
import { FaFilter } from 'react-icons/fa';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DeviceLocation = () => {
  
  const [deviceId, setDeviceId] = useState('');
  const [deviceData, setDeviceData] = useState([]);
  const [allDevices, setAllDevices] = useState([]);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [createData, setCreateData] = useState({ deviceid: '', carid: '' });
  const [updateData, setUpdateData] = useState({ deviceid: '', carid: '' });
  const [error, setError] = useState(null);
  const [markerLimit, setMarkerLimit] = useState(20);
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);
  const [locationData, setLocationData] = useState([]);
  const [startDate, setStartDate] = useState(() => new Date()); // Default to current date and time
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return new Date(now.setHours(now.getHours() + 1)); // Set end date to one hour later than the start date
  });
  const [showDateTime, setShowDateTime] = useState(false);
  const [showMenu , setShowMenu] = useState(false);
  const handleInputChange = (event) => {
    if (event.target){
      setDeviceId(event.target.value.trim());
      setSelectedDevice(event.target.value.trim())
    } else {
      setDeviceId(event.deviceid);
      setSelectedDevice(event.deviceid)
    } 
  };

  
  const handleSearch = async () => {
    try {
      if(!token){
        console.log('No token Found')
        navigate('/login');
      }
      const data = await getDevice(deviceId , markerLimit);
      const validData = data.map(location => ({
        ...location,
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng),
        speed: parseFloat(location.speed),
      })).filter(location => 
        !isNaN(location.lat) && !isNaN(location.lng)
      );
      setDeviceData(validData);
      setLocationData(validData);
      console.log('Valid Data', validData)
      setError(null);
      setIsSearchTriggered(true);
    } catch (error) {
      if(error.response?.status == 404){
        setError(error.response.message || 'Device id not present')
      } else {
        setError('An error occured');
      }
    }
  };
  

  const handleRefresh = async () => {
    try {
      const data = await getDevice(deviceId , markerLimit);
      const validData = data
        .map(location => ({
          ...location,
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lng),
          speed: parseFloat(location.speed),
        }))
        .filter(location => !isNaN(location.lat) && !isNaN(location.lng));
        setDeviceData(validData);
      const lastUpdate = deviceData.length > 0 ? new Date(deviceData[0].updatedAt) : null;
      const newData = validData.filter(
        location => lastUpdate === null || new Date(location.updatedAt) > lastUpdate
      );
  
      if (newData.length > 0) {
        setDeviceData(prevData =>  [...prevData, ...newData]);
      }
  
      setError(null);
    } catch (error) {
      setError('Error refreshing device data');
    }
  };

  
  const handleDropdown = async () => {
    try {
      const data = await getAllDevices();
      setAllDevices(data);
    } catch (error) {
      setError('Error fetching all devices');
    }
  };
  
  const handleSeeDevices = async () => {
    try {
      const data = await getAllDevices();
      setAllDevices(data);
      setShowDeviceModal(true);
    } catch (error) {
      setError('Error fetching all devices');
    }
  };
  

  const handleCreateSubmit = async () => {
    const trimmedData = {
      deviceid: createData.deviceid.trim(),
      carid: createData.carid.trim(),
    };
  
    try {
      await createCarDeviceAssign(trimmedData);
      setShowCreateModal(false); 
    } catch (error) {
      console.log(error);
    }
  };
  

  const handleUpdateSubmit = async () => {
    const trimmedData = {
      deviceid: updateData.deviceid.trim(),
      carid: updateData.carid.trim(),
    };
  
    try {
      await updateCarDeviceAssign(trimmedData);
      setShowUpdateModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteModalOpen = async () => {
    try {
      const data = await getAllDevices();
      setAllDevices(data);
      setShowDeleteModal(true);
    } catch (error) {
      setError('Error fetching all devices');
    }
  };
  
  
  const handleDeleteSubmit = async (id) => {
    try {
      await deleteCarDeviceAssign(id);
      setAllDevices(prevDevices => prevDevices.filter(device => device.deviceid !== id));
    } catch (error) {
      console.log(error);
    }
  };

 const formatDateForInput = (date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16); // Format to yyyy-MM-ddTHH:mm
  };

   const parseDateFromInput = (value) => {
    const [date, time] = value.split('T');
    const [hours, minutes] = time.split(':');
    return new Date(`${date}T${hours}:${minutes}:00`);
  };
  const handleStartDateChange = (e) => {
    setStartDate(parseDateFromInput(e.target.value));
  };

  const handleEndDateChange = (e) => {
    setEndDate(parseDateFromInput(e.target.value));
  };
  // Filter data based on the selected date range
 const filterTime = (startDate, endDate) => {
    console.log('Start Date:', startDate, 'End Date:', endDate);
    if (deviceData != null) {
        const filter = deviceData.filter((item) => {
            const pickedTime = new Date(item.createdAt);
            const startUTC = startDate.getTime();
            const endUTC = endDate.getTime();
            const pickedUTC = pickedTime.getTime();

            return pickedUTC >= startUTC && pickedUTC <= endUTC;
        });
        setLocationData(filter);
        console.log('Filtered Data:', filter);
    }
};

  const latestLocation = deviceData.length > 0 ? deviceData[0] : null;
  
  return (
    <div className="container-fluid">
      <CForm className="mb-3">
        <CRow className='d-flex align-items-center justify-content-center'>
          <CCol className='d-flex align-items-center justify-content-center'>
            <CInputGroup>
            <CFormInput
                type="text"
                value={selectedDevice}
                onChange={handleInputChange}
                className="mx-2"
                placeholder="Device Name"
              />
            <CDropdown className='device-dropdown' onClick={() => handleDropdown()}>
              <CDropdownToggle className='device-menu'>
                
              </CDropdownToggle>
              <CDropdownMenu className='device-menu'>
                {allDevices.map((device) => (
                  <CDropdownItem key={device.deviceid} onClick={() => handleInputChange(device)}>
                    {device.deviceid}
                  </CDropdownItem>
                ))}
              </CDropdownMenu>
            </CDropdown>
              <CFormInput
                type="number"
                value={markerLimit}
                onChange={(e) => setMarkerLimit(parseInt(e.target.value))}
                className="mx-2"
                placeholder="Enter Marker Limit"
              />
              <CInputGroupText onClick={handleRefresh} style={{ cursor: 'pointer' }}>
                <CIcon icon={cilReload} />
              </CInputGroupText>
            </CInputGroup>
            <CButton className='mx-2 py-2' color="primary" onClick={handleSearch}>
              Search
            </CButton>
          </CCol>
        </CRow>
        <div className='mt-2'>
            <div className='Tool-color d-flex align-items-center justify-content-between'>
              <div>
              {error && <span className="text-danger error-message">{error}</span>} 
              </div>
              <div>
              <span className= "Tool-icons">
                {showDateTime ?
                  <svg  onClick={()=>{setShowDateTime(false)}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '20px'}} >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                  : 
                  <svg onClick={()=>{setShowDateTime(true)}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '20px'}} >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                }
              </span>
              
              <span className='Tool-icons'>
              {showMenu ? 
              <svg  onClick={()=>{setShowMenu(false)}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style={{width: '20px'}} >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
              </svg> 
              :
              <svg onClick={()=>{setShowMenu(true)}}  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style={{width: '20px'}} 
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>

              }
              </span>
              </div>
            </div>
        </div>
          {showDateTime ?
                <div className='d-flex align-items-center justify-content-between border px-2 mt-1'>
                  <label>
                    Start Date:
                  </label>
                  
                  <input className='rounded bg-dark p-1 ' type="datetime-local" onChange={handleStartDateChange} value={formatDateForInput(startDate)} />
                  <label>
                    End Date:
                  </label>
                  <input className='rounded bg-dark p-1  ' type="datetime-local" onChange={handleEndDateChange} value={formatDateForInput(endDate)}  />
                  <CButton className='border mt-2 mx-3' onClick={() => filterTime(startDate, endDate)}>Go</CButton>
                </div>
                :
                <>
                </>
              } 
              {showMenu ? 
                <div className=' d-flex align-items-center justify-content-center border px-2 m-3'>
                <svg onClick={handleSeeDevices} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" style={{width: '20px'}} className='deviceEdit'>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
                <CButton className="icon-button mx-2" onClick={() => setShowCreateModal(true)}>
                  <CIcon icon={cilPlus} size="lg" />
                </CButton>
                <CButton className="icon-button mx-2 " onClick={() => setShowUpdateModal(true)}>
                  <CIcon icon={cilPencil} size="lg" />
                </CButton>
                <CButton className="icon-button mx-2 " color="danger" onClick={handleDeleteModalOpen}>
                  <CIcon icon={cilTrash} size="lg" />
                </CButton>
                </div>
              : 
              <>
              </>}
            </CForm>
      
      {deviceData.length > 0 && (
        <div>
          <div className='container'>
            <Map locations={locationData} />
          </div>
          {latestLocation && (
            <CCard className="my-4">
              <CCardHeader>
                <CCardTitle>Latest Location Details</CCardTitle>
              </CCardHeader>
              <CCardBody className='d-flex align-items-center justify-content-evenly map-details'>
                <div>
                <p><strong>Latest Id:</strong> {latestLocation.id}</p>
                <p><strong>Device ID:</strong> {latestLocation.deviceid}</p>
                <p><strong>Latitude:</strong> {latestLocation.lat}</p>
                <p><strong>Longitude:</strong> {latestLocation.lng}</p>
                <p><strong>Speed:</strong> {latestLocation.speed} km/h</p>
                </div>
                <div>
                <p><strong>Date:</strong> {latestLocation.date}</p>
                <p><strong>Time:</strong> {latestLocation.time}</p>
                <p><strong>Created At:</strong> {new Date(latestLocation.createdAt).toLocaleString()}</p>
                <p><strong>Updated At:</strong> {new Date(latestLocation.updatedAt).toLocaleString()}</p>
                </div>
              </CCardBody>
            </CCard>
          )}
        </div>
      )}

      {/* Create Device Modal */}
      <CModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} className="custom-modal">
        <CModalHeader className="modal-header-styled">Create Device Assignment</CModalHeader>
        <CModalBody className="modal-body-styled">
          <CForm className="modal-form">
            <CFormInput
              type="text"
              placeholder="Enter Device ID"
              value={createData.deviceid}
              onChange={(e) => setCreateData({ ...createData, deviceid: e.target.value })}
              className="modal-input"
            />
            <CFormInput
              type="text"
              placeholder="Enter Car ID"
              value={createData.carid}
              onChange={(e) => setCreateData({ ...createData, carid: e.target.value })}
              className="modal-input"
            />
          </CForm>
        </CModalBody>
        <CModalFooter className="modal-footer-styled">
          <CButton color="secondary" onClick={() => setShowCreateModal(false)}>Close</CButton>
          <CButton color="primary" onClick={handleCreateSubmit}>Create</CButton>
        </CModalFooter>
      </CModal>

      {/* Update Device Modal */}
        <CModal visible={showUpdateModal} onClose={() => setShowUpdateModal(false)} className="custom-modal">
          <CModalHeader className="modal-header-styled">Update Device Assignment</CModalHeader>
          <CModalBody className="modal-body-styled">
            <CForm className="modal-form">
              <CFormInput
                type="text"
                placeholder="Enter Device ID"
                value={updateData.deviceid}
                onChange={(e) => setUpdateData({ ...updateData, deviceid: e.target.value })}
                className="modal-input"
              />
              <CFormInput
                type="text"
                placeholder="Enter Car ID"
                value={updateData.carid}
                onChange={(e) => setUpdateData({ ...updateData, carid: e.target.value })}
                className="modal-input"
              />
            </CForm>
          </CModalBody>
          <CModalFooter className="modal-footer-styled">
            <CButton color="secondary" onClick={() => setShowUpdateModal(false)}>Close</CButton>
            <CButton color="primary" onClick={handleUpdateSubmit}>Update</CButton>
          </CModalFooter>
        </CModal>

      {/* Delete Device Modal */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="custom-modal">
        <CModalHeader className="modal-header-styled">All Devices</CModalHeader>
        <CModalBody className="modal-body-styled">
          <CRow>
            <CCol>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Device ID</CTableHeaderCell>
                    <CTableHeaderCell>Car ID</CTableHeaderCell>
                    <CTableHeaderCell>Created At</CTableHeaderCell>
                    <CTableHeaderCell>Delete</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {allDevices.map((device) => (
                    <CTableRow key={device.deviceid}>
                      <CTableDataCell>{device.deviceid}</CTableDataCell>
                      <CTableDataCell>{device.carid}</CTableDataCell>
                      <CTableDataCell>{new Date(device.createdAt).toLocaleString()}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="danger"
                          className="icon-button"
                          onClick={() => handleDeleteSubmit(device.deviceid)}
                        >
                          <CIcon icon={cilTrash} size="lg" />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter className="modal-footer-styled">
          <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>Close</CButton>
        </CModalFooter>
      </CModal>

      {/* See Devices Modal */}
      <CModal
        visible={showDeviceModal}
        onClose={() => setShowDeviceModal(false)}
        className="custom-modal"
        centered
      >
        <CModalHeader>All Devices</CModalHeader>
        <CModalBody>
          <CRow>
            <CCol>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Device ID</CTableHeaderCell>
                    <CTableHeaderCell>Car ID</CTableHeaderCell>
                    <CTableHeaderCell>Created At</CTableHeaderCell>
                    <CTableHeaderCell>Updated At</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {allDevices.map((device) => (
                    <CTableRow key={device.deviceid}>
                      <CTableDataCell>{device.deviceid}</CTableDataCell>
                      <CTableDataCell>{device.carid}</CTableDataCell>
                      <CTableDataCell>{new Date(device.createdAt).toLocaleString()}</CTableDataCell>
                      <CTableDataCell>{new Date(device.updatedAt).toLocaleString()}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDeviceModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
      
    </div>
  );
};



export default DeviceLocation;
