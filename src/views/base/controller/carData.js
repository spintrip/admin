import React, { useState, useEffect } from 'react';
import { fetchCarById } from '../../../api/car';
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

const CarData = React.memo(({ id, onClose }) => {
  const [carById, setCarById] = useState([]);
  const [error, setError] = useState('');
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataByID = await fetchCarById(id);
        if (dataByID && dataByID.car) {
          setCarById(dataByID.car);
          setError('');
        } else {
          throw new Error('Car data not found');
        }
      } catch (error) {
        console.error('Error fetching Car by ID:', error);
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
          Car Details
        </CAccordionHeader>
        <CAccordionBody onClick={(e) => e.stopPropagation()}>
  {error ? (
    <div>{error}</div>
  ) : (
    <>
      <CRow>
        <CCol md={6} className='car-modal basic-info'>
          <h5>Basic Info</h5>
          <p><strong>Car Model:</strong> {carById.carmodel || 'N/A'}</p>
          <p><strong>Chassis No:</strong> {carById.chassisno || 'N/A'}</p>
          <p><strong>RC Number:</strong> {carById.Rcnumber || 'N/A'}</p>
          <p><strong>Engine Number:</strong> {carById.Enginenumber || 'N/A'}</p>
          <p><strong>Registration Year:</strong> {carById.Registrationyear || 'N/A'}</p>
          <p><strong>Body Type:</strong> {carById.bodytype || 'N/A'}</p>
          <p><strong>Created At:</strong> {new Date(carById.createdAt).toLocaleString()}</p>
          <p><strong>Updated At:</strong> {new Date(carById.updatedAt).toLocaleString()}</p>
        </CCol>
        {carById.additionalInfo && (
          <CCol md={6} className='additional-info'>
            <h5>Additional Info</h5>
            <p><strong>Horse Power:</strong> {carById.additionalInfo.HorsePower || 'N/A'}</p>
            <p><strong>AC:</strong> {carById.additionalInfo.AC || 'N/A'}</p>
            <p><strong>Music System:</strong> {carById.additionalInfo.Musicsystem || 'N/A'}</p>
            <p><strong>Transmission:</strong> {carById.additionalInfo.Transmission || 'N/A'}</p>
            <p><strong>Fuel Type:</strong> {carById.additionalInfo.FuelType || 'N/A'}</p>
            <p><strong>Verification Status:</strong> 
              {carById.additionalInfo.verification_status === 1 ? (
                <>
                  <span style={{ color: 'orange' }}> Pending </span>
                  <code className='p-2 border rounded' style={{ color: 'orange' }}>Code-1</code>
                </>
              ) : carById.additionalInfo.verification_status === 2 ? (
                <>
                  <span style={{ color: 'green' }}> Confirmed </span>
                  <code className='p-2 border rounded' style={{ color: 'green' }}>Code-2</code>
                </>
              ) : carById.additionalInfo.verification_status === null ? (
                <>
                  <span style={{ color: 'red' }}> N/A </span>
                  <code className='p-2 border rounded' style={{ color: 'red' }}> Code-null</code>
                </>
              ) : (
                <>
                  <span>Unknown Status</span>
                  <code className='p-2 border rounded'>Code-{carById.additionalInfo.verification_status}</code>
                </>
              )}
            </p>
            <p><strong>Additional Created At:</strong> {new Date(carById.additionalInfo.createdAt).toLocaleString()}</p>
            <p><strong>Additional Updated At:</strong> {new Date(carById.additionalInfo.updatedAt).toLocaleString()}</p>
          </CCol>
        )}
      </CRow>
      {carById.additionalInfo && (
        <CRow className="mt-4 images-section">
          <CCol className="d-flex flex-column align-items-center">
            <p><strong>Car Image 1:</strong></p>
            {carById.additionalInfo.carimage1 ? (
              <img src={carById.additionalInfo.carimage1}  alt="Car Image 1" className="img-thumbnail" onClick={() => handleImageClick(carById.additionalInfo.carimage1)} />
            ) : (
              <div className="empty-image-placeholder">
                <span><FaTimesCircle /> Not Uploaded</span>
              </div>
            )}
          </CCol>
          <CCol className="d-flex flex-column align-items-center">
            <p><strong>Car Image 2:</strong></p>
            {carById.additionalInfo.carimage2 ? (
              <img src={carById.additionalInfo.carimage2} alt="Car Image 2" className="img-thumbnail" onClick={() => handleImageClick(carById.additionalInfo.carimage2)}/>
            ) : (
              <div className="empty-image-placeholder">
                <span><FaTimesCircle /> Not Uploaded</span>
              </div>
            )}
          </CCol>
          <CCol className="d-flex flex-column align-items-center">
            <p><strong>Car Image 3:</strong></p>
            {carById.additionalInfo.carimage3 ? (
              <img src={carById.additionalInfo.carimage3}  alt="Car Image 3" className="img-thumbnail" onClick={() => handleImageClick(carById.additionalInfo.carimage3)} />
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

export default CarData;
