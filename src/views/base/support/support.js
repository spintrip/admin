import React, { useState, useEffect, useRef } from 'react';
import { getAllSupportTickets, getSupportChat, replySupportChat, resolveSupport, escalationSupport } from '../../../api/adminSupport';
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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import '../../../scss/support.css';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [escalatedTickets, setEscalatedTickets] = useState([]);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [escalateModalVisible, setEscalateModalVisible] = useState(false);
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [escalatedTicketId, setEscalatedTicketId] = useState('');
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
      setEscalatedTickets(data.filter(ticket => ticket.status == 'escalated'));
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
      const updatedChat = await replySupportChat(selectedTicketId, newMessage);
      setSelectedChat((prevChat) => [...prevChat, updatedChat]);
      setNewMessage('');
      fetchSupportChat(selectedTicketId);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEscalate = async () => {
    const ticketId = {
      supportId : escalatedTicketId,
    }
    console.log("escalatedTicketId: ",escalatedTicketId);
    try {
      await escalationSupport(ticketId);
      setEscalateModalVisible(false);
      fetchSupportTickets();
    } catch (error) {
      console.log(error);
    }
  };

  const handleResolve = async () => {
    const ResolveId = {
      supportId : escalatedTicketId,
    }
    console.log(escalatedTicketId);
    try {
      await resolveSupport(ResolveId);
      setResolveModalVisible(false);
      fetchSupportTickets();
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

        {/* Escalated Issues Table */}
        <div className="escalated-issues">
          {escalatedTickets.length > 0 ? (
            <CTable hover className="ticket-Container">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Support Id</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Subject</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Message</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Priority</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Escalation</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {escalatedTickets.map((ticket, index) => (
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
                    <CTableDataCell className="fw-bold text-uppercase">{ticket.status ? <span className="p-1 rounded text-white bg-danger" style={{ fontSize: '12px' }}>{ticket.status}</span> : ticket.status}</CTableDataCell>
                    <CTableDataCell>{new Date(ticket.createdAt).toLocaleString()}</CTableDataCell>
                    <CTableDataCell>{new Date(ticket.updatedAt).toLocaleString()}</CTableDataCell>
                    <CTableDataCell>{ticket.priority}</CTableDataCell>
                    <CTableDataCell>{ticket.escalations}</CTableDataCell>
                    <CTableDataCell>
                    <CDropdown>
                      <CDropdownToggle className="actions-dropdown" caret>
                        
                      </CDropdownToggle>
                      <CDropdownMenu>
                        <CDropdownItem 
                          onClick={() => {
                            setEscalatedTicketId(ticket.id); 
                            setEscalateModalVisible(true);
                          }}
                        >
                          Escalate
                        </CDropdownItem>
                        <CDropdownItem 
                          onClick={() => {
                            setEscalatedTicketId(ticket.id); 
                            setResolveModalVisible(true);
                          }}
                        >
                          Resolve
                      </CDropdownItem>
                      </CDropdownMenu>
                    </CDropdown>
                  </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          ) : (
            <div className="no-issues text-center p-5">No issue</div>
          )}
        </div>
        <hr/>
        {/* Main Tickets Table */}
        <CTable hover className="ticket-Container">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              <CTableHeaderCell scope="col">Support Id</CTableHeaderCell>
              <CTableHeaderCell scope="col">Subject</CTableHeaderCell>
              <CTableHeaderCell scope="col">Message</CTableHeaderCell>
              <CTableHeaderCell scope="col">Status</CTableHeaderCell>
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Priority</CTableHeaderCell>
              <CTableHeaderCell scope="col">Escalation</CTableHeaderCell>
              <CTableHeaderCell scope="col">Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {tickets
             .filter(ticket => ticket.status !== 'escalated')
             .map((ticket, index) => (
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
                <CTableDataCell className="fw-bold text-uppercase">
                  {ticket.status ? (
                    <span
                      className={`p-1 rounded text-white ${
                        ticket.status === 'Open'
                          ? 'bg-primary'
                          : ticket.status === 'Replied'
                          ? 'bg-warning'
                          : ticket.status === 'resolved'
                          ? 'bg-success'
                          : ''
                      }`}
                      style={{ fontSize: '12px' }}
                    >
                      {ticket.status}
                    </span>
                  ) : null}
                </CTableDataCell>

                <CTableDataCell>{new Date(ticket.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{new Date(ticket.updatedAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{ticket.priority}</CTableDataCell>
                <CTableDataCell>{ticket.escalations}</CTableDataCell>
                <CTableDataCell>
                  <CDropdown>
                    <CDropdownToggle className="actions-dropdown" caret>
                      
                    </CDropdownToggle>
                    <CDropdownMenu>
                      <CDropdownItem 
                          onClick={() => {
                            setEscalatedTicketId(ticket.id); 
                            setEscalateModalVisible(true);
                          }}
                        >
                          Escalate
                      </CDropdownItem>
                      <CDropdownItem 
                          onClick={() => {
                            setEscalatedTicketId(ticket.id); 
                            setResolveModalVisible(true);
                          }}
                        >
                          Resolve
                      </CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      {/* Chat Modal */}
      <CModal visible={chatModalVisible} onClose={() => setChatModalVisible(false)} alignment="center" size="xl">
        <CModalHeader>
          <CModalTitle className="d-flex align-items-center justify-content-between w-100">
            <h3>Support Chat - Ticket </h3>
            <span className="ticket-no p-1 rounded bg-light text-dark font-sm mx-2">Support Id - {selectedTicketId}</span>
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
        <CModalFooter>
          <CForm onSubmit={handleSendMessage} className="w-100">
            <CInputGroup className="mb-3">
              <CFormInput
                type="text"
                placeholder="Type your message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                required
                className="text-2xl"
              />
              <CButton type="submit" color="primary">Send</CButton>
            </CInputGroup>
          </CForm>
        </CModalFooter>
      </CModal>

      {/* Escalate Modal */}
      <CModal visible={escalateModalVisible} onClose={() => setEscalateModalVisible(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Escalate Issue</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Do you want to escalate the issue?</p>
        </CModalBody>
        <CModalFooter className='d-flex align-items-center justify-content-center'>
          <CButton color="secondary" onClick={() => setEscalateModalVisible(false)}>No</CButton>
          <CButton color="primary" onClick={handleEscalate}>Yes</CButton>
        </CModalFooter>
      </CModal>

      {/* Resolve Modal */}
      <CModal visible={resolveModalVisible} onClose={() => setResolveModalVisible(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Resolve Issue</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Do you want to resolve the issue?</p>
        </CModalBody>
        <CModalFooter className='d-flex align-items-center justify-content-center'>
          <CButton color="secondary" onClick={() => setResolveModalVisible(false)}>No</CButton>
          <CButton color="primary" onClick={handleResolve}>Yes</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Support;
