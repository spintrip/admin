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
} from '@coreui/react';
import '../../scss/device.css'
import { CIcon } from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons';
import { cilReload } from '@coreui/icons';
import Map from './mapComponent2';
import { useNavigate } from 'react-router-dom';

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

  const handleInputChange = (e) => {
    setDeviceId(e.target.value.trim());
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
      setError(null);
      setIsSearchTriggered(true);
    } catch (error) {
      setError('Error fetching device data');
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
  
      // Only update if there's new data with a more recent updatedAt
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
  
  

  useEffect(() => {
    if (!isSearchTriggered || !deviceId) return;
  
    const intervalId = setInterval(() => {
      handleRefresh();
    }, 5000); 
  
    return () => clearInterval(intervalId);
  }, [isSearchTriggered, deviceId, deviceData]);
  
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

  const latestLocation = deviceData.length > 0 ? deviceData[0] : null;

  return (
    <div className="container-fluid">
      <CForm className="mb-3">
        <CRow className='d-flex align-items-center justify-content-center'>
          <CCol className='d-flex align-items-center justify-content-center'>
            <CInputGroup>
              <CFormInput
                type="text"
                placeholder="Enter Device ID"
                value={deviceId}
                className='py-2'
                onChange={handleInputChange}
              />
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
        <CRow className='d-flex align-items-center justify-content-center mt-3'>
          <CCol className='d-flex align-items-center justify-content-center'>
            <CInputGroup>
              <CButton className="fw-bolder bg-light text-black mx-2" onClick={handleSeeDevices} >See Devices</CButton>
              
            </CInputGroup>
            <CButton className="icon-button mx-2" onClick={() => setShowCreateModal(true)}>
              <CIcon icon={cilPlus} size="lg" />
            </CButton>
            <CButton className="icon-button mx-2" onClick={() => setShowUpdateModal(true)}>
              <CIcon icon={cilPencil} size="lg" />
            </CButton>
            <CButton className="icon-button mx-2" color="danger" onClick={handleDeleteModalOpen}>
              <CIcon icon={cilTrash} size="lg" />
            </CButton>
          </CCol>
        </CRow>
      </CForm>

      {deviceData.length > 0 && (
        <div>
          <div className='container'>
            <Map locations={deviceData} />
          </div>
          {latestLocation && (
            <CCard className="my-4">
              <CCardHeader>
                <CCardTitle>Latest Location Details</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <p><strong>Device ID:</strong> {latestLocation.deviceid}</p>
                <p><strong>Latitude:</strong> {latestLocation.lat}</p>
                <p><strong>Longitude:</strong> {latestLocation.lng}</p>
                <p><strong>Speed:</strong> {latestLocation.speed} km/h</p>
                <p><strong>Date:</strong> {latestLocation.date}</p>
                <p><strong>Time:</strong> {latestLocation.time}</p>
                <p><strong>Created At:</strong> {new Date(latestLocation.createdAt).toLocaleString()}</p>
                <p><strong>Updated At:</strong> {new Date(latestLocation.updatedAt).toLocaleString()}</p>
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



      {error && <p className="text-danger">{error}</p>}
    </div>
  );
};



export default DeviceLocation;
