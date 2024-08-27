// UpdateTransactionModal.js
import React, { useEffect, useState, useCallback } from 'react';
import { sendNotification } from '../../../api/notification';

import {
  CInputGroup,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButton,
  CForm,
  CFormLabel,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';


const Notification = () => {
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [notificationFormValues, setNotificationFormValues] = useState({
    userIds : [],
    subject : "",
    message : ""
  });
  const [userIdList , setUserIdList] = useState({});
  const navigate = useNavigate();
  const[sendConfirmModal , setSendConfirmModal] = useState(false);
  const token = localStorage.getItem('adminToken');

  const handleUserIdInput = (e) => {
    const {name , value } = e.target;
    setUserIdList({
       ...userIdList,
       [name]: value,
    })
  }


  const handleNotificationInputChange = (e) => {
    const { name, value } = e.target;
    setNotificationFormValues({
      ...notificationFormValues,
      [name]: value,
    });
  };

  const handleNotificationSubmit = useCallback(async (e) => {
    e.preventDefault();
    if(!token) {
        console.log('No token Found');
        navigate('/login')
     }
     try{
      const trimmedData = setNotificationFormValues({
          userIds : userIds || null,
          subject : "",
          message : ""
      })
      const data = await sendNotification(trimmedData);
      console.log(data);
     } catch (error) {
      console.log(error);
     }
  }, [token , navigate]);
  

//   const filterBooking = () => {
//     let sortedData = [...transactionData];
//     sortedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//       if (!searchInput) {
//         setFilteredData(sortedData);
//       } else {
//         const filtered = sortedData.filter((transaction) => {
//           if (selectedSearchOption == 'all') {
//               return Object.values(transaction).some(value =>
//                 value && value.toString().toLowerCase().includes(searchInput.toLowerCase())
//               );
//           } else {
//               const value = transaction[selectedSearchOption];
//               if (selectedSearchOption == 'createdAt' || selectedSearchOption == 'updatedAt') {
//               const formattedDate = new Date(value).toLocaleString();
//               return formattedDate && formattedDate.toLowerCase().includes(searchInput.toLowerCase());
//               }
//               return value && value.toString().toLowerCase().includes(searchInput.toLowerCase());
//           }
//         });
//         setFilteredData(filtered);
        
//       }
//     };     
//   useEffect(() => {
    
//     filterBooking();
//   }, [transactionData ,selectedSearchOption, searchInput  ]);


const handleSendConfirm = () => {
    setSendConfirmModal(true);
  }

  const handleNotification = (notification) => {
    setNotificationModalVisible(true);
  }

  return (
    <>
      <div className='container-fluid px-4 d-flex align-items-center justify-content-between'>
        <div>
            <CButton onClick={handleNotification}> Add New </CButton>
        </div>
      </div>

      

      <CModal visible={notificationModalVisible} onClose={() => setNotificationModalVisible(false)} alignment="center" size="xl">
        <CModalHeader>
          <CModalTitle>Send Notification</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Subject</CFormLabel>
              <CFormInput type="text" name="subject" value={notificationFormValues.subject} onChange={handleNotificationInputChange} required />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Message</CFormLabel>
              <CFormInput type="text" name="message" value={notificationFormValues.message} onChange={handleNotificationInputChange} required />
            </CInputGroup>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setTransactionModalVisible(false)}>Set all Users</CButton>
              <CButton color="primary" type="submit">Set all Hosts</CButton>
            </CModalFooter>
            <CModalFooter>
              <CButton color="primary" type="submit" onClick={() => handleSendConfirm()}>Send</CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
      <CModal visible={sendConfirmModal} onClose={() => setSendConfirmModal(false)} alignment="center" size="md">
        <CModalHeader>
          <CModalTitle>Send Notification</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div>
            <span>Are You sure?</span>
          </div>
        </CModalBody>
        <CModalFooter>
            <CButton>No</CButton>
            <CButton onClick={() => handleNotificationSubmit()}>Yes</CButton>
        </CModalFooter>
      </CModal>

    </>
  );
};

export default Notification;
