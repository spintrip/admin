import React, { useState, useEffect, useCallback } from 'react';
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
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import '../../../scss/message.css';
import { FaFlag } from 'react-icons/fa'; // Import the flag icon from react-icons
import DataTable from 'react-data-table-component';
import UserData from '../controller/userData';
import { getBooking } from '../../../api/booking';

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
  const [selectedSearchOption, setSelectedSearchOption] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null); 
  const [messageClasses, setMessageClasses] = useState({});
  const [userMessageId , setUserMessageId] = useState(null);
  const [isAccordionOpen, setAccordionOpen] = useState(false);
  const token = localStorage.getItem('adminToken');
  const [bookingData , setBookingData] = useState([]);
  const [activeMessage, setActiveMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessageData();
    fetchBookingData();
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
  
  const fetchBookingData = useCallback(async () => {
    try {
      if (!token) {
        console.log('No token Found');
        navigate('/login');
      }
      const data = await getBooking();
      setBookingData(data);
    } catch (error) {
      console.log(error);
    }
  },[setBookingData]);

  useEffect(() => {
    const filterMessages = () => {
      let sortedData = [...messageData]
      sortedData.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      let groupedBookings = sortedData.reduce((acc, message) => {
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

      if (searchInput && selectedSearchOption) {
        groupedBookings = groupedBookings.filter(booking => {
          if (selectedSearchOption === 'all') {
            return Object.values(booking).some(value => {
              if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(nestedValue =>
                  nestedValue && nestedValue.toString().toLowerCase().includes(searchInput.toLowerCase())
                );
              }
              return value && value.toString().toLowerCase().includes(searchInput.toLowerCase());
            });
          }
          else{
            const value = booking[selectedSearchOption];
            if (selectedSearchOption === 'createdAt' || selectedSearchOption === 'updatedAt') {
              const formattedDate = new Date(value).toLocaleString();
              return formattedDate && formattedDate.toLowerCase().includes(searchInput.toLowerCase());
            }
            return value && value.toString().toLowerCase().includes(searchInput.toLowerCase());
          }
        })
      }  ;

      setFilteredData(groupedBookings);
    };
    filterMessages();
  }, [messageData, searchInput, selectedSearchOption]);

  const displayedBookings = filteredData

  const handleBookingClick = (bookingId) => {
    const bookingMessages = messageData.filter((message) => message.bookingId === bookingId );
    setSelectedBooking(bookingMessages);
    setVisible(true);
  };

  const handleMessageClick = (messageId) => {
    setActiveMessage(activeMessage === messageId ? null : messageId);
  };

  const handleFlagClick = useCallback(async(messageId) => {
    try {
      await flagmessage(messageId);
  
      setSelectedBooking(prevSelectedBooking =>
        prevSelectedBooking.map(message =>
          message.id === messageId ? { ...message, flagged: true } : message
        )
      );
    } catch (error) {
      console.log(error.message);
    }
    
  },[setSelectedBooking]);

  useEffect(() => {
    if (selectedBooking?.length > 0) {
      const classifiedMessages = selectedBooking.map((message, index) => {
        const booking = bookingData.find((b) => b.Bookingid === message.bookingId);
        const messageClass = booking?.id === message.senderId ? 'left' : 'right';
        return {
          ...message,
          messageClass
        };
      });
  
      setMessageClasses(classifiedMessages.reduce((acc, msg) => {
        acc[msg.id] = msg.messageClass;
        return acc;
      }, {}));
    }
  }, [selectedBooking , bookingData]);
  
  
  
  const handleUserClick = () => {
    const userMessages = Object.keys(messageClasses)
      .filter(id => messageClasses[id] === 'left') // Get only user messages
      .map(id => {
        const message = messageData.find(msg => msg.id === parseInt(id, 10));
        return message ? message.senderId : null; // Return senderId for user messages
      });
  
    const uniqueUserIds = [...new Set(userMessages)]; // Get unique user IDs
    console.log('User Sender IDs:', uniqueUserIds[0]);
    
    if (userMessageId === uniqueUserIds[0]) {
      setAccordionOpen(prevState => !prevState);
    } else {
        setUserMessageId(uniqueUserIds[0]);
        setAccordionOpen(true);
    }
    };
  
  
  const handleHostClick = () => {
    const hostMessages = Object.keys(messageClasses)
      .filter(id => messageClasses[id] === 'right') // Get only host messages
      .map(id => {
        const message = messageData.find(msg => msg.id === parseInt(id, 10));
        return message ? message.senderId : null;
      });

    const uniqueHostIds = [...new Set(hostMessages)]; 
    console.log('Host Sender IDs:', uniqueHostIds[0]);
    if (userMessageId === uniqueHostIds[0]) {
      setAccordionOpen(prevState => !prevState);
    } else {
        setUserMessageId(uniqueHostIds[0]);
        setAccordionOpen(true);
    }
  };

  const handleAccordionClose = () => {
    setAccordionOpen(false);
    setUserMessageId(null);
  };
  
  const handleModalClose = () => {
    setAccordionOpen(false);
    setVisible(false);
  }
  
  const searchHeaders = [
    { label: 'All' , value: 'all'},
    { label: 'Booking Id' , value: 'bookingId'},
    { label: 'Created At' , value: 'createdAt'},
    { label: 'Updated At' , value: 'updatedAt'},
  ]

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
                {searchHeaders.find(header => header.value == selectedSearchOption)?.label || 'all'}
              </CDropdownToggle>
              <CDropdownMenu>
                {searchHeaders.map((header , index) => (
                  <CDropdownItem className='cursor-pointer' key={index} onClick={() => setSelectedSearchOption(header.value)}>
                   {header.label}
                  </CDropdownItem>
                ))}
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
      <CModal visible={visible} onClose={handleModalClose} alignment="center" size="lg">
        <CModalHeader>
          <CModalTitle>Chat Messages</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <div className='messageUsers'>
          <div onClick={handleUserClick}>User</div>
          <div onClick={handleHostClick}>Host</div>
        </div>
        {isAccordionOpen && userMessageId && (
           <UserData id={userMessageId} onClose={handleAccordionClose} />
        )}

        <div className="chat-container">
          {selectedBooking &&
            selectedBooking
            .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((message, index) => {
              let messageClass;
              if (index === 0) {
                const booking = bookingData.find(b => b.Bookingid === message.bookingId);
                messageClass = booking?.id === message.senderId ? 'left' : 'right';
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
                      <FaFlag onClick={() => handleFlagClick(message.id)} style={{color: 'black'}}/>
                    </div>
                  )}
                  <div className="message-timestamp">{new Date(message.createdAt).toLocaleString()}</div>
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
