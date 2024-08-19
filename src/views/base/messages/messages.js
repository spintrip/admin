import React, { useState, useEffect } from 'react';
import { getallmessages } from '../../../api/message';
import {
  CInputGroup,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButton,
  CFormInput,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CPagination,
  CPaginationItem,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import '../../../scss/message.css';
import { FaFlag } from 'react-icons/fa'; // Import the flag icon from react-icons


const Messages = () => {
  const [visible, setVisible] = useState(false);
  const [messageData, setMessageData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null); 
  const token = localStorage.getItem('adminToken');
  const [activeMessage, setActiveMessage] = useState(null);
  const navigate = useNavigate();
  const limit = 20;
  const visiblePages = 3;

  useEffect(() => {
    fetchMessageData();
  }, []);

  const fetchMessageData = async () => {
    try {
      if (!token) {
        console.log('No token Found');
        navigate('/login');
      }
      const data = await getallmessages();
      setMessageData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const filterMessages = () => {
      const groupedBookings = messageData.reduce((acc, message) => {
        const booking = acc.find((item) => item.bookingId === message.bookingId);
        if (booking) {
          // Update the latest updatedAt and createdAt
          if (new Date(message.updatedAt) > new Date(booking.updatedAt)) {
            booking.updatedAt = message.updatedAt;
          }
          if (new Date(message.createdAt) > new Date(booking.createdAt)) {
            booking.createdAt = message.createdAt;
          }
        } else {
          acc.push({
            bookingId: message.bookingId,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt
          });
        }
        return acc;
      }, []);
      setFilteredData(groupedBookings);
      setCurrentPage(1);
    };
    filterMessages();
  }, [messageData]);

  const totalPages = Math.ceil(filteredData.length / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedBookings = filteredData.slice((currentPage - 1) * limit, currentPage * limit);

  const getVisiblePages = () => {
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  const handleBookingClick = (bookingId) => {
    const bookingMessages = messageData.filter((message) => message.bookingId === bookingId);
    setSelectedBooking(bookingMessages);
    fetchMessageData();
    setVisible(true);
  };

  const handleMessageClick = (messageId) => {
    setActiveMessage(activeMessage === messageId ? null : messageId);
  };

  const handleFlagClick = (messageId) => {
    // Implement your flagging logic here
    console.log(`Flagged message ID: ${messageId}`);
  };
  
  

  return (
    <>
      <div className="container-fluid px-4 d-flex align-items-center justify-content-between">
        <div>
          <CInputGroup className="mx-2">
            <CFormInput
              aria-label="Text input with dropdown button"
              placeholder="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <CDropdown alignment="end" variant="input-group">
              <CDropdownToggle color="secondary" variant="outline">
                {selectedSearchOption || 'Select'}
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => setSelectedSearchOption('bookingId')}>Booking ID</CDropdownItem>
                <CDropdownItem onClick={() => setSelectedSearchOption('createdAt')}>Created At</CDropdownItem>
                <CDropdownItem onClick={() => setSelectedSearchOption('updatedAt')}>Updated At</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </CInputGroup>
        </div>
      </div>

      <div className="mt-4 container-fluid">
        <CTable hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              <CTableHeaderCell scope="col">Booking ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {displayedBookings.map((booking, index) => (
              <CTableRow key={index} onClick={() => handleBookingClick(booking.bookingId)}>
                <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                <CTableDataCell>{booking.bookingId}</CTableDataCell>
                <CTableDataCell>{new Date(booking.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{new Date(booking.updatedAt).toLocaleString()}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CPagination aria-label="Page navigation example">
            <CPaginationItem disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
              Previous
            </CPaginationItem>
            {getVisiblePages().map((page) => (
              <CPaginationItem key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                {page}
              </CPaginationItem>
            ))}
            <CPaginationItem disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
              Next
            </CPaginationItem>
          </CPagination>
        </div>
      </div>

      {/* Chat Modal */}
      <CModal visible={visible} onClose={() => setVisible(false)} alignment="center" size="lg">
        <CModalHeader>
          <CModalTitle>Chat Messages</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="chat-container">
            {selectedBooking &&
              selectedBooking.map((message, index) => {
                let messageClass;
                if (index === 0) {
                  messageClass = 'left';
                } else if (message.senderId !== selectedBooking[index - 1].senderId) {
                  // If the senderId is different from the previous message, switch sides
                  messageClass = selectedBooking[index - 1].messageClass === 'left' ? 'right' : 'left';
                } else {
                  // Otherwise, keep the same side as the previous message
                  messageClass = selectedBooking[index - 1].messageClass;
                }
                
                // Save the class on the current message object for future reference
                message.messageClass = messageClass;

                return (
                  <div key={index} className={`chat-messages ${messageClass}`} onClick={() => handleMessageClick(message.id)}>
                    <div className="message-content">{message.message}</div>
                    {activeMessage === message.id && (
                      <div className={`dropup ${messageClass === 'left' ? 'right-side' : 'left-side'}`}>
                        <FaFlag onClick={() => handleFlagClick(message.id)} />
                      </div>
                    )}
                    <div className="message-timestamp">{new Date(message.timestamp).toLocaleString()}</div>
                  </div>
                );
              })}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Messages;
