import React, { useState, useEffect } from 'react';
import { flagmessage, getallmessages } from '../../../api/message';
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
    name: 'Booking ID',
    selector: row => row.bookingId, // Replace with the actual key for Booking ID in your data
    sortable: true,
  },
  {
    name: 'Created At',
    selector: row => new Date(row.createdAt).toLocaleString(), // Converts to a readable date string
    sortable: true,
  },
  {
    name: 'Updated At',
    selector: row => new Date(row.updatedAt).toLocaleString(), // Converts to a readable date string
    sortable: true,
  },
];
const Messages = () => {
  const [visible, setVisible] = useState(false);
  const [messageData, setMessageData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null); 
  const [flagged, setFlagged] = useState(false); 
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
      let sortedData = [...messageData]
      sortedData.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      const groupedBookings = sortedData.reduce((acc, message) => {
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

  const displayedBookings = filteredData

  const handleBookingClick = (bookingId) => {
    const bookingMessages = messageData.filter((message) => message.bookingId === bookingId);
    setSelectedBooking(bookingMessages);
    fetchMessageData();
    setVisible(true);
  };

  const handleMessageClick = (messageId) => {
    setActiveMessage(activeMessage === messageId ? null : messageId);
  };

  const handleFlagClick = async(messageId) => {
    try{
      await flagmessage(messageId);
      fetchMessageData();
    } catch (error) {
      console.log(error.message);
    }
    
  };
  
  

  return (
    <>
      <div className="container-fluid px-4 d-flex align-items-center justify-content-end">
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
      <div className='container-fluid h-fit-content mt-3'>
          <DataTable
                  columns={columns}
                  data={displayedBookings}
                  customStyles={customStyles}
                  responsive={true}
                  title={'Messages Table'}
                  highlightOnHover={true}
                  pointerOnHover={true}
                  fixedHeader={true}
                  onRowClicked={(booking)=>handleBookingClick(booking.bookingId)}
          />
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
                messageClass = selectedBooking[index - 1].messageClass === 'left' ? 'right' : 'left';
              } else {
                messageClass = selectedBooking[index - 1].messageClass;
              }
              
              message.messageClass = messageClass;

              return (
                <div key={index} className={`chat-messages ${messageClass}`} onClick={() => handleMessageClick(message.id)}>
                  {messageClass === 'left' && message.flagged && (
                    <div className="red-dot right-side"></div>  
                  )}
                  <div className="message-content">{message.message}</div>
                  {messageClass === 'right' && message.flagged && (
                    <div className="red-dot left-side"></div> 
                  )}
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
