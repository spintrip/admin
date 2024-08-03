import React, { useState, useEffect } from 'react';
import { getAllSupportTickets, getSupportChat } from '../../../api/adminSupport';
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
import '../../../scss/blog.css';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();

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
    // try {
    //   const updatedChat = await sendSupportChatMessage(selectedTicketId, newMessage);
    //   setSelectedChat(updatedChat);
    //   setNewMessage('');
    // } catch (error) {
    //   console.log(error);
    // }
  };

  return (
    <>
      <div className="container-fluid mt-4">
        <CTable hover>
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
                <CTableDataCell>{ticket.status}</CTableDataCell>
                <CTableDataCell>{new Date(ticket.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{new Date(ticket.updatedAt).toLocaleString()}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      {/* Chat Modal */}
      <CModal visible={chatModalVisible} onClose={() => setChatModalVisible(false)} alignment="center" size="xl">
        <CModalHeader>
          <CModalTitle>Support Chat - Ticket {selectedTicketId}</CModalTitle>
        </CModalHeader>
        <CModalBody>
            <div className="chat-box" style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
            {selectedChat.map((chat) => (
                <div key={chat.id} className={`chat-message ${chat.senderId === token ? 'right' : 'left'}`}>
                    <div className={`chat-bubble ${chat.senderId === token ? 'sent' : 'received'}`}>
                    <strong>{chat.senderId}</strong>
                    <p>{chat.message}</p>
                    <small>{new Date(chat.createdAt).toLocaleString()}</small>
                    </div>
                </div>
            ))}
        </div>
        </CModalBody>
        <CModalFooter>
          <CForm onSubmit={handleSendMessage} className="w-100">
            <CInputGroup className="mb-3">
              <CFormInput 
                type="text" 
                placeholder="Type your message" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                required 
              />
              <CButton type="submit" color="primary">Send</CButton>
            </CInputGroup>
          </CForm>
          <CButton color="secondary" onClick={() => setChatModalVisible(false)}>Close</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Support;
