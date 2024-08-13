import React, { useState, useEffect, useRef } from 'react';
import { getAllSupportTickets, getSupportChat, replySupportChat } from '../../../api/adminSupport';
import {
  CInputGroup,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButton,
  CForm,
  CFormInput,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CLink,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import '../../../scss/support.css';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (!token) {
      console.log('No token found');
      navigate('/login');
    } else {
      fetchSupportTickets();
    }
  }, []);

  const fetchSupportTickets = async () => {
    try {
      const data = await getAllSupportTickets();
      setTickets(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSupportChat = async (id) => {
    try {
      const chatData = await getSupportChat(id);
      setSelectedChat(chatData);
      setSelectedTicketId(id);
      setChatModalVisible(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      
      const updatedChat = await replySupportChat(selectedTicketId , newMessage);
      setSelectedChat((prevChat) => [...prevChat, updatedChat]);
      setNewMessage('');
      fetchSupportChat(selectedTicketId); // Refresh the chat after sending the message
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [selectedChat, chatModalVisible]);

  return (
    <>
      <div className="container-fluid mt-4">
        <CTable hover className= "ticket-Container">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
              <CTableHeaderCell scope="col">Subject</CTableHeaderCell>
              <CTableHeaderCell scope="col">Message</CTableHeaderCell>
              <CTableHeaderCell scope="col">Status</CTableHeaderCell>
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {tickets.map((ticket, index) => (
              <CTableRow key={ticket.id}>
                <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                <CTableDataCell>
                  <CLink
                    onClick={() => fetchSupportChat(ticket.id)}
                    style={{ cursor: 'pointer', color: 'white', textDecoration: 'underline' }}
                  >
                    {ticket.id}
                  </CLink>
                </CTableDataCell>
                <CTableDataCell>{ticket.subject}</CTableDataCell>
                <CTableDataCell>{ticket.message}</CTableDataCell>
                <CTableDataCell className='fw-bold text-uppercase'>{ticket.status ? <span className='p-1 rounded text-white bg-success' style={{fontSize : '12px'}}>{ticket.status}</span>: ticket.status}</CTableDataCell>
                <CTableDataCell>{new Date(ticket.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{new Date(ticket.updatedAt).toLocaleString()}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      {/* Chat Modal */}
      <CModal visible={chatModalVisible} onClose={() => setChatModalVisible(false)} alignment="center" size="xl" >
        <CModalHeader>
          <CModalTitle className='d-flex align-items-center justify-content-between w-100'>
            <h3>Support Chat - Ticket </h3>
            <span className='ticket-no p-1 rounded bg-light text-dark font-sm mx-2'>Ticket No. - {selectedTicketId}</span>
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="chat-box" ref={chatBoxRef}>
            {selectedChat.map((chat) => (
              <div key={chat.id} className={`chat-message ${chat.adminId === chat.senderId ? 'right' : 'left'}`}>
                <div className={`chat-bubble ${chat.adminId === chat.senderId ? 'sent' : 'received'}`}>
                  <strong>{chat.adminId === chat.senderId ? `Admin - (${chat.adminId})` : `User - (${chat.userId || 'Unknown'})`}</strong>
                  <p>{chat.message}</p>
                  <small>{new Date(chat.createdAt).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>
        </CModalBody>
        <CModalFooter >
          <CForm onSubmit={handleSendMessage} className="w-100">
            <CInputGroup className="mb-3">
              <CFormInput 
                type="text" 
                placeholder="Type your message" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                required 
                className='text-2xl'
              />
              <CButton type="submit" color="primary">Send</CButton>
            </CInputGroup>
          </CForm>
         
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Support;
