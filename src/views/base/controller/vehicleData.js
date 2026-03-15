import React, { useState, useEffect } from 'react';
import { fetchvehicleById } from '../../../api/vehicle';
import {
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CRow,
  CCol,
  CImage,
  CModal,
  CModalBody
} from '@coreui/react';
import { FaTimesCircle } from 'react-icons/fa';
import '../../../scss/controller.css';

const vehicleData = React.memo(({ id, onClose }) => {
  const [vehicleById, setvehicleById] = useState([]);
  const [error, setError] = useState('');
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataByID = await fetchvehicleById(id);
        if (dataByID && dataByID.vehicle) {
          setvehicleById(dataByID.vehicle);
          setError('');
        } else {
          throw new Error('vehicle data not found');
        }
      } catch (error) {
        console.error('Error fetching vehicle by ID:', error);
        setError(error.message);
      }
    };

    fetchData();
  }, [id]);

  const handleImageClick = (imageUrl) => {
    setEnlargedImage(imageUrl);
  };

  return (
    <CAccordion alwaysOpen activeItemKey={1} className='mt-2 mb-5 accordian'>
      <CAccordionItem itemKey={1}>
        <CAccordionHeader onClick={(e) => { e.stopPropagation(); onClose(); }}>
          vehicle Details
        </CAccordionHeader>
        <CAccordionBody onClick={(e) => e.stopPropagation()}>
  {error ? (
    <div>{error}</div>
  ) : (
    <>
      <CRow>
        <CCol md={6} className='vehicle-modal basic-info'>
          <h5>Basic Info</h5>
          <p><strong>vehicle Model:</strong> {vehicleById.vehiclemodel || 'N/A'}</p>
          <p><strong>Chassis No:</strong> {vehicleById.chassisno || 'N/A'}</p>
          <p><strong>RC Number:</strong> {vehicleById.Rcnumber || 'N/A'}</p>
          <p><strong>Engine Number:</strong> {vehicleById.Enginenumber || 'N/A'}</p>
          <p><strong>Registration Year:</strong> {vehicleById.Registrationyear || 'N/A'}</p>
          <p><strong>Body Type:</strong> {vehicleById.bodytype || 'N/A'}</p>
          <p><strong>Created At:</strong> {new Date(vehicleById.createdAt).toLocaleString()}</p>
          <p><strong>Updated At:</strong> {new Date(vehicleById.updatedAt).toLocaleString()}</p>
        </CCol>
        {vehicleById.additionalInfo && (
          <CCol md={6} className='additional-info'>
            <h5>Additional Info</h5>
            <p><strong>Horse Power:</strong> {vehicleById.additionalInfo.HorsePower || 'N/A'}</p>
            <p><strong>AC:</strong> {vehicleById.additionalInfo.AC || 'N/A'}</p>
            <p><strong>Music System:</strong> {vehicleById.additionalInfo.Musicsystem || 'N/A'}</p>
            <p><strong>Transmission:</strong> {vehicleById.additionalInfo.Transmission || 'N/A'}</p>
            <p><strong>Fuel Type:</strong> {vehicleById.additionalInfo.FuelType || 'N/A'}</p>
            <p><strong>Verification Status:</strong> 
              {vehicleById.additionalInfo.verification_status === 1 ? (
                <>
                  <span style={{ color: 'orange' }}> Pending </span>
                  <code className='p-2 border rounded' style={{ color: 'orange' }}>Code-1</code>
                </>
              ) : vehicleById.additionalInfo.verification_status === 2 ? (
                <>
                  <span style={{ color: 'green' }}> Confirmed </span>
                  <code className='p-2 border rounded' style={{ color: 'green' }}>Code-2</code>
                </>
              ) : vehicleById.additionalInfo.verification_status === null ? (
                <>
                  <span style={{ color: 'red' }}> N/A </span>
                  <code className='p-2 border rounded' style={{ color: 'red' }}> Code-null</code>
                </>
              ) : (
                <>
                  <span>Unknown Status</span>
                  <code className='p-2 border rounded'>Code-{vehicleById.additionalInfo.verification_status}</code>
                </>
              )}
            </p>
            <p><strong>Additional Created At:</strong> {new Date(vehicleById.additionalInfo.createdAt).toLocaleString()}</p>
            <p><strong>Additional Updated At:</strong> {new Date(vehicleById.additionalInfo.updatedAt).toLocaleString()}</p>
          </CCol>
        )}
      </CRow>
      {vehicleById.additionalInfo && (
        <CRow className="mt-4 images-section">
          <CCol className="d-flex flex-column align-items-center">
            <p><strong>vehicle Image 1:</strong></p>
            {vehicleById.additionalInfo.vehicleimage1 ? (
              <img src={vehicleById.additionalInfo.vehicleimage1}  alt="vehicle Image 1" className="img-thumbnail" onClick={() => handleImageClick(vehicleById.additionalInfo.vehicleimage1)} />
            ) : (
              <div className="empty-image-placeholder">
                <span><FaTimesCircle /> Not Uploaded</span>
              </div>
            )}
          </CCol>
          <CCol className="d-flex flex-column align-items-center">
            <p><strong>vehicle Image 2:</strong></p>
            {vehicleById.additionalInfo.vehicleimage2 ? (
              <img src={vehicleById.additionalInfo.vehicleimage2} alt="vehicle Image 2" className="img-thumbnail" onClick={() => handleImageClick(vehicleById.additionalInfo.vehicleimage2)}/>
            ) : (
              <div className="empty-image-placeholder">
                <span><FaTimesCircle /> Not Uploaded</span>
              </div>
            )}
          </CCol>
          <CCol className="d-flex flex-column align-items-center">
            <p><strong>vehicle Image 3:</strong></p>
            {vehicleById.additionalInfo.vehicleimage3 ? (
              <img src={vehicleById.additionalInfo.vehicleimage3}  alt="vehicle Image 3" className="img-thumbnail" onClick={() => handleImageClick(vehicleById.additionalInfo.vehicleimage3)} />
            ) : (
              <div className="empty-image-placeholder">
                <span><FaTimesCircle /> Not Uploaded</span>
              </div>
            )}
          </CCol>
        </CRow>
      )}
    </>
  )}
</CAccordionBody>

      </CAccordionItem>
      {enlargedImage && (
        <CModal visible={!!enlargedImage} onClose={() => setEnlargedImage(null)} size="lg">
          <CModalBody className="enlarged-image-modal">
            <div className='image-fit'>
              <CImage src={enlargedImage} className='responsive-image'/>
            </div>
          </CModalBody>
        </CModal>
      )}
    </CAccordion>
  );
});

export default vehicleData;
