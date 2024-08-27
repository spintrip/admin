import React , {useState, useEffect } from 'react';
import { fetchUserById } from '../../../api/user';
import {
    CModal,
    CModalBody,
    CModalHeader,
    CModalTitle,
    CRow,
    CCol,
    CImage
  } from '@coreui/react';
  import { FaTimesCircle } from 'react-icons/fa';

const UserData = React.memo(({id}) => {

    const [userById , setUserById] = useState([]);
    const [error , setError] = useState('');
    const [modalVisible , setModalVisible] = useState(false);
    const [enlargedImage , setEnlargedImage] = useState(false);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const dataByID = await fetchUserById(id);
                if (dataByID && dataByID.user) {
                    setUserById(dataByID.user);
                    setError('');
                } else {
                    throw new Error('User data not found');
                }
            } catch (error) {
                console.error('Error fetching user by ID:', error);
                setError(error.message);
            }
        };
    
        fetchData();
    }, [id]);

    const handleImageClick = (imageUrl) => {
        setEnlargedImage(imageUrl);
      };
    
      
 return (
        <div>
        {userById && (
          <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg" scrollable style={{zIndex:"10000"}}>
            <CModalHeader>
              <CModalTitle>User Details</CModalTitle>
            </CModalHeader>
            {error ? (
                <div>{error}</div>
            ) : (
                <CModalBody>
              <CRow>
                {/* Left Column - Basic Info */}
                <CCol md={6} className='user-modal basic-info'>
                  <h5>Basic Info</h5>
                  <p><strong>ID:</strong> {userById.id}</p>
                  <p><strong>Phone:</strong> {userById.phone}</p> 
                  <p><strong>Role:</strong> {userById.role || 'N/A'}</p>
                  <p><strong>OTP:</strong> {userById.otp || 'N/A'}</p>
                  <p><strong>Timestamp:</strong> {userById.timestamp || 'N/A'}</p>
                  <p><strong>Rating:</strong> {userById.rating || 'N/A'}</p>
                  <p><strong>Created At:</strong> {new Date(userById.createdAt).toLocaleString()}</p>
                  <p><strong>Updated At:</strong> {new Date(userById.updatedAt).toLocaleString()}</p>
                </CCol>

                {userById.additionalInfo && (
                  <CCol md={6} className='user-modal additional-info'>
                    <h5>Additional Info</h5>
                    <p><strong>Full Name:</strong> {userById.additionalInfo.FullName || 'N/A'}</p>
                    <p><strong>Email:</strong> {userById.additionalInfo.Email || 'N/A'}</p>
                    <p><strong>DL Verification:</strong> {userById.additionalInfo.Dlverification || 'N/A'}</p>
                    <p><strong>Aadhar Verification ID:</strong> {userById.additionalInfo.AadharVfid || 'N/A'}</p>
                    <p><strong>Address:</strong> {userById.additionalInfo.Address || 'N/A'}</p>
                    <p><strong>Verification Status:</strong> 
                    {userById.additionalInfo.verification_status === 1 ? (
                      <>
                        <span style={{ color: 'orange' }}> Pending </span>
                        <code className='p-2 border rounded' style={{ color: 'orange' }}>Code-1</code>
                      </>
                    ) : userById.additionalInfo.verification_status === 2 ? (
                      <>
                        <span style={{ color: 'green' }}> Confirmed </span>
                        <code className='p-2 border rounded' style={{ color: 'green' }}>Code-2</code>
                      </>
                    ) : userById.additionalInfo.verification_status === null ? (
                      <>
                        <span style={{ color: 'red' }}> N/A </span>
                        <code className='p-2 border rounded' style={{ color: 'red' }}> Code-null</code>
                      </>
                    ) : (
                      <>
                        <span>Unknown Status</span>
                        <code className='p-2 border rounded'>Code-{userById.additionalInfo.verification_status}</code>
                      </>
                    )}
                    </p>
                    <p><strong>Current Address Verification ID:</strong> {userById.additionalInfo.CurrentAddressVfid || 'N/A'}</p>
                    <p><strong>Additional Created At:</strong> {new Date(userById.additionalInfo.createdAt).toLocaleString()}</p>
                    <p><strong>Additional Updated At:</strong> {new Date(userById.additionalInfo.updatedAt).toLocaleString()}</p>
                  </CCol>
                )}
              </CRow>

              {userById.additionalInfo && (
                <CRow className="mt-4 images-section">
                  <CCol className="d-flex flex-column align-items-center">
                    <p><strong>Profile Picture:</strong></p>
                    {userById.additionalInfo.profilepic ? (
                      <img src={userById.additionalInfo.profilepic} alt="Profile" className="img-thumbnail"  onClick={() => handleImageClick(userById.additionalInfo.profilepic)} />
                    ) : (
                      <div className="empty-image-placeholder">
                          <span><FaTimesCircle /> Not Uploaded</span>
                      </div>
                    )}
                  </CCol>
                  <CCol className="d-flex flex-column align-items-center">
                    <p><strong>Driving License:</strong></p>
                    {userById.additionalInfo.dl ? (
                      <img src={userById.additionalInfo.dl} alt="DL" className="img-thumbnail"  onClick={() => handleImageClick(userById.additionalInfo.dl)}/>
                    ) : (
                      <div className="empty-image-placeholder">
                          <span><FaTimesCircle /> Not Uploaded</span>
                      </div>
                    )}
                  </CCol>
                  <CCol className="d-flex flex-column align-items-center">
                    <p><strong>Aadhaar:</strong></p>
                    {userById.additionalInfo.aadhar ? (
                      <img src={userById.additionalInfo.aadhar} alt="Aadhar" className="img-thumbnail" onClick={() => handleImageClick(userById.additionalInfo.aadhar)} />
                    ) : (
                      <div className="empty-image-placeholder">
                          <span><FaTimesCircle /> Not Uploaded</span>
                      </div>
                    )}
                  </CCol>
                </CRow>
              )}
            </CModalBody>
            )}
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
    )
});
export default UserData;