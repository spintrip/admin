import React, { useState } from 'react';
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
} from '@coreui/react';
import Map from './mapComponent'

const DeviceLocation = () => {
  const [deviceId, setDeviceId] = useState('');
  const [deviceData, setDeviceData] = useState([]);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setDeviceId(e.target.value);
  };

  const handleSearch = async () => {
    try {
      const data = await getDevice(deviceId);
      const validData = data.slice(0, 3).map(location => ({
        ...location,
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng),
        speed: parseFloat(location.speed)
      })).filter(location => 
        !isNaN(location.lat) && !isNaN(location.lng)
      );
      setDeviceData(validData);
      setError(null);
    } catch (error) {
      setError('Error fetching device data');
    }
  };

  const latestLocation = deviceData.length > 0 ? deviceData[0] : null;

  return (
    <div className="container-fluid">
      <CForm className="mb-3">
        <CRow className='d-flex align-items-center justify-content-center'>
          <CCol className='d-flex align-items-center justify-content-center'>
            <CFormInput
              type="text"
              placeholder="Enter Device ID"
              value={deviceId}
              className='py-2'
              onChange={handleInputChange}
            />
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
