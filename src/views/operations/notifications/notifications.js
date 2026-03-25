// UpdateNotificationModal.js
import React, { useMemo, useState, useCallback } from 'react';
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
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CFooter,
  CFormCheck
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { fetchUsers } from '../../../api/user';
import { fetchHosts } from '../../../api/host';

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
      name: 'ID',
      selector: (row) => row.id,
      sortable: true,

    },
    {
      name: 'Full Name',
      selector: (row) => row.additionalInfo?.FullName? row.additionalInfo?.FullName : '--' || row.FullName, // Check both possible locations
      sortable: true,
    },
    {
      name: 'Phone',
      selector: (row) => row.phone,
      sortable: true,
    },
    {
      name: 'Role',
      selector: (row) => row.role,
      sortable: true,
    },
  ];

  const hostColumns = [
    {
      name: 'ID',
      selector: (row) => row.id,
      sortable: true,

    },
  ];



const Notification = () => {
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [hostModalVisible, setHostModalVisible] = useState(false);
  const [notificationFormValues, setNotificationFormValues] = useState({
    userIds : [],
    subject : "",
    message : ""
  });
  const navigate = useNavigate();
  const [sendConfirmModal , setSendConfirmModal] = useState(false);
  const token = localStorage.getItem('adminToken');
  const [isLoading , setisLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  const [error , setError] = useState('');
  const [isHostLoading , setisHostLoading] = useState(false);
  const [hostData, setHostData] = useState([]);
  const [hostError , setHostError] = useState('');
  const [sendError , setSendError] = useState('');
  const [toggledClearRows, setToggleClearRows] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [searchHostQuery, setSearchHostQuery] = useState('');
  const [activeAccordionKey, setActiveAccordionKey] = useState(1);
  const [targetType, setTargetType] = useState('all_users');
  const [receiverType, setReceiverType] = useState('user');

  
  const fetchUserData = useCallback(async() =>{
    setisLoading(true);
    try{
        const data = await  fetchUsers();
        filterBooking(data);
    } catch (error){
        setError(error.message);
    }
    setisLoading(false);
  },[]);

  const fetchHostData = useCallback(async() =>{
    setisHostLoading(true);
    try{
        const hostdata = await fetchHosts();
        setHostData(hostdata);
        console.log(hostdata)
    } catch (error){
        setHostError(error.message);
    }
    setisHostLoading(false);
  },[]);



  const filterBooking = (data) => {
    const filteredUserData = data.filter(item => item.role === 'user' || item.role === 'User');
    setUserData(filteredUserData);
    console.log("Filtered User Data: ", filteredUserData);
  };

  const filteredUserData = useMemo(() => {
    return userData.filter(user => user.id.includes(searchUserQuery));
  }, [userData, searchUserQuery]);
  
  const filteredHostData = useMemo(() => {
    return hostData.filter(host => host.id.includes(searchHostQuery));
  }, [hostData, searchHostQuery]);


  const handleNotificationInputChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setNotificationFormValues({
      ...notificationFormValues,
      [name]: value,
    });
  };

  const handleUserProceed = () => {
    const userIDs = selectedRows.map(user => user.id.toString()); // Assuming userData holds the user data
    setNotificationFormValues(prevState => ({
        ...prevState,
        userIds: [...prevState.userIds, ...userIDs],
    }));
    setUserModalVisible(false); 
    setToggleClearRows(!toggledClearRows); 
  };

const handleHostProceed = () => {
    const hostIds = selectedRows.map(host => host.id.toString()); // Assuming hostData holds the host data
    setNotificationFormValues(prevState => ({
        ...prevState,
        userIds: [...prevState.userIds, ...hostIds],
    }));
    setHostModalVisible(false); 
    setToggleClearRows(!toggledClearRows); 
};

  const handleNotificationSubmit = useCallback(async (e) => {
    e.preventDefault();
    setisLoading(true);
    if (!notificationFormValues.subject || !notificationFormValues.message) {
      alert("Please fill in both subject and message fields.");
      setisLoading(false);
      return; 
    }
    if(!token) {
        console.log('No token Found');
        navigate('/login')
     }
     try{
      let trimmedData = { ...notificationFormValues };
      let finalUserIds = [];
      if (targetType === 'all_users') {
          finalUserIds = ['all'];
          trimmedData.receiverType = 'user';
      } else if (targetType === 'all_hosts') {
          finalUserIds = ['all'];
          trimmedData.receiverType = 'driver';
      } else {
          if (typeof notificationFormValues.userIds === 'string') {
              finalUserIds = notificationFormValues.userIds.split(',').map(id => id.trim()).filter(id => id);
          } else if (Array.isArray(notificationFormValues.userIds)) {
              finalUserIds = notificationFormValues.userIds;
          }
          trimmedData.receiverType = receiverType;
      }

      const apiPayload = {
          receiverIds: finalUserIds,
          receiverType: trimmedData.receiverType,
          text: notificationFormValues.message,
          title: notificationFormValues.subject
      };

      const data = await sendNotification(apiPayload);
      console.log(data);
      setSendConfirmModal(false);
      setSendError(null);
      setActiveAccordionKey(null);
     } catch (error) {
      setSendError(error.message || "Failed to push notification");
     }
     setisLoading(false);
     
  }, [token , navigate, notificationFormValues, targetType, receiverType]);


  const addSelectedBooking = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  const handleSendConfirm = () => {
    setSendConfirmModal(true);
  }

  const handleUserModal = async() => {
    await fetchUserData();
    setUserModalVisible(true);
  }

  const handleHostModal = async() => {
    await fetchHostData();
    setHostModalVisible(true);
  }
  const handleCloseConfirm = () => {
    setSendConfirmModal(false)
    setSendError(null);
  }

  return (
    <div className='container'>
        <CAccordion alwaysOpen activeItemKey={activeAccordionKey}>
            <CAccordionItem itemKey={1}>
                <CAccordionHeader>Send Notification</CAccordionHeader>
                <CAccordionBody>
                <CForm>
                    <CInputGroup className="mb-3">
                    <CFormLabel className='me-3'>Subject</CFormLabel>
                    <CFormInput type="text" name="subject" value={notificationFormValues.subject} onChange={handleNotificationInputChange} required />
                    </CInputGroup>
                    <CInputGroup className="mb-3">
                    <CFormLabel className='me-3'>Message</CFormLabel>
                    <CFormInput type="text" name="message" value={notificationFormValues.message} onChange={handleNotificationInputChange} required />
                    </CInputGroup>
                    <CInputGroup className="mb-3 d-flex flex-column">
                      <CFormLabel className="me-3 fw-bold">Target Audience</CFormLabel>
                      <div className="d-flex gap-4 mt-2">
                        <CFormCheck 
                          type="radio" name="targetAudience" id="targetAllUsers" label="All Users" 
                          checked={targetType === 'all_users'} onChange={() => { setTargetType('all_users'); setReceiverType('user'); }} 
                        />
                        <CFormCheck 
                          type="radio" name="targetAudience" id="targetAllHosts" label="All Hosts/Drivers" 
                          checked={targetType === 'all_hosts'} onChange={() => { setTargetType('all_hosts'); setReceiverType('driver'); }} 
                        />
                        <CFormCheck 
                          type="radio" name="targetAudience" id="targetSpecific" label="Specific Accounts" 
                          checked={targetType === 'specific'} onChange={() => setTargetType('specific')} 
                        />
                      </div>
                    </CInputGroup>

                    {targetType === 'specific' && (
                      <>
                        <CInputGroup className="mb-3">
                          <CFormLabel className='me-3'>Account IDs (comma separated)</CFormLabel>
                          <CFormInput type="text" name="userIds" value={notificationFormValues.userIds} onChange={handleNotificationInputChange} required />
                        </CInputGroup>
                        <CFooter className='mt-3 gap-3 d-flex'>
                            <div>
                                {isLoading ? ( <div> Loading..</div> ) : (
                                    <CButton color="secondary" onClick={() => { setReceiverType('user'); handleUserModal(); }}>Select Users Grid</CButton>
                                )}
                            </div>
                            <div>
                                {isHostLoading ? ( <div> Loading..</div> ) : (
                                    <CButton color="info" className="text-white" onClick={() => { setReceiverType('driver'); handleHostModal(); }}>Select Hosts Grid</CButton>
                                )}
                            </div>
                        </CFooter>
                      </>
                    )}
                    <hr/>
                    <div className='d-flex align-items-center justify-content-end'>
                        <CButton color="primary" onClick={handleSendConfirm} disabled={!notificationFormValues.subject || !notificationFormValues.message}>Send</CButton>
                    </div>
                </CForm>
                </CAccordionBody>
            </CAccordionItem>
        </CAccordion>


        <CModal visible={userModalVisible} onClose={() => setUserModalVisible(false)} alignment="center" size="lg" className = 'user-modal'>
          <CModalHeader>
            <CModalTitle>Send Users</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Search Users</CFormLabel>
              <CFormInput 
                type="text" 
                value={searchUserQuery} 
                onChange={(e) => setSearchUserQuery(e.target.value)} 
                placeholder="Search by ID"
              />
            </CInputGroup>

              <div className='container-fluid h-fit-content '>
              <DataTable  
                  columns={columns}
                  data={filteredUserData.map((row, index) => ({ ...row, uniqueId: `${row.id}-${index}` }))}
                  customStyles={customStyles}
                  responsive={true}
                  title={'User Table'}
                  highlightOnHover={true}
                  pointerOnHover={true}
                  fixedHeader={true}
                  selectableRows
                  onSelectedRowsChange={({ selectedRows }) => addSelectedBooking({ selectedRows })}
                  clearSelectedRows={toggledClearRows}
              />
              </div>
              <CModalFooter>
                <CButton color="primary" type="submit" onClick={handleUserProceed}>Proceed</CButton>
              </CModalFooter>
          
          </CModalBody>
        </CModal>

        <CModal visible={hostModalVisible} onClose={() => setHostModalVisible(false)} alignment="center" size="lg" className = 'user-modal'>
            <CModalHeader>
                <CModalTitle>Send Hosts</CModalTitle>
            </CModalHeader>
            {hostError ? (
                <div>{hostError}</div>
            ) : (
              <CModalBody>
                <CInputGroup className="mb-3">
                  <CFormLabel className='me-3'>Search Hosts</CFormLabel>
                  <CFormInput 
                    type="text" 
                    value={searchHostQuery} 
                    onChange={(e) => setSearchHostQuery(e.target.value)} 
                    placeholder="Search by ID"
                  />
                </CInputGroup>
                <div className='container-fluid h-fit-content '>
                <DataTable  
                    columns={hostColumns}
                    data={filteredHostData.map((row, index) => ({ ...row, uniqueId: `${row.id}-${index}` }))}
                    customStyles={customStyles}
                    responsive={true}
                    title={'Host Table'}
                    highlightOnHover={true}
                    pointerOnHover={true}
                    fixedHeader={true}
                    selectableRows
                  onSelectedRowsChange={({ selectedRows }) => addSelectedBooking({ selectedRows })}
                  clearSelectedRows={toggledClearRows}
                />
                </div>
                <CModalFooter>
                <CButton color="primary" type="submit" onClick={handleHostProceed}>Proceed</CButton>
                </CModalFooter>
            
            </CModalBody>
            )}
        </CModal>


      <CModal visible={sendConfirmModal} onClose={handleCloseConfirm} alignment="center" size="lg">
        <CModalHeader>
          <CModalTitle>Send Notification</CModalTitle>
        </CModalHeader>
        <CModalBody>
        {sendError ? (
          <div className='error-message'> {sendError}</div>
        ) : (
          
          <div>
            <span>Are You sure?</span>
          </div>
        )}
        </CModalBody>
        <CModalFooter>
            <CButton>No</CButton>
            {isLoading ? (
                <div>Loading...</div>
            ) : (
            <CButton onClick={handleNotificationSubmit}>Yes</CButton>
        )}
        </CModalFooter>
      </CModal>

    </div>
  );
};

export default Notification;
