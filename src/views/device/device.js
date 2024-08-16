import React, { useState , useEffect } from 'react';
import { getDevice } from '../../api/deviceLocation';
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
  CFormSelect,
} from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilReload } from '@coreui/icons';
import Map from './mapComponent2'

const DeviceLocation = () => {
  const [deviceId, setDeviceId] = useState('');
  const [deviceData, setDeviceData] = useState([]);
  const [error, setError] = useState(null);
  const [markerLimit, setMarkerLimit] = useState(20);
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);

  const handleInputChange = (e) => {
    setDeviceId(e.target.value);
  };

  const handleSearch = async () => {
    try {
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

      {error && <p className="text-danger">{error}</p>}
    </div>
  );
};



export default DeviceLocation;
