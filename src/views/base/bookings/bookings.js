import React, { useEffect, useState } from 'react';
import { getBooking, fetchBookingById, updateBooking } from '../../../api/booking';
import UserData from '../controller/userData';
import CarData from '../controller/carData';
import {

  CInputGroup,
  CFormInput,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButton,
  CForm,
  CFormLabel,
  CCol,
  CRow,
  CAccordion,
  CAccordionItem,
  CAccordionBody,
  CAccordionHeader
} from '@coreui/react';
import '../../../scss/booking.css';
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
const tableHeaders = [
  { label: 'Booking ID', value: 'Bookingid' },
  { label: 'Car ID', value: 'carid' },
  { label: 'User Id', value: 'id' },
  { label: 'Status', value: 'status' },
  { label: 'Amount', value: 'amount' },
  { label: 'GST Amount', value: 'GSTAmount' },
  { label: 'Total User Amount', value: 'totalUserAmount' },
  { label: 'TDS Amount', value: 'TDSAmount' },
  { label: 'Total Host Amount', value: 'totalHostAmount' },
  { label: 'Start Trip Date', value: 'startTripDate' },
  { label: 'End Trip Date', value: 'endTripDate' },
  { label: 'Start Trip Time', value: 'startTripTime' },
  { label: 'End Trip Time', value: 'endTripTime' },
  { label: 'Created At', value: 'createdAt' },
  { label: 'Updated At', value: 'updatedAt' },
];
const columns = [
  {
    name: 'Booking ID',
    selector: row => row.Bookingid,
    sortable: true,
  },
  {
    name: 'Car ID',
    selector: row => row.carid,
    sortable: true,
  },
  {
    name: 'User Id',
    selector: row => row.id,
    sortable: true,
  },
  {
    name: 'Status',
    selector: row => {
      switch (row.status) {
        case 1:
          return "Upcoming";
        case 2:
          return "Start Ride";
        case 3:
          return "Requested";
        case 4:
          return "Cancelled";
        default:
          return "Unknown";
      }
    },
    sortable: true,
    cell: row => {
      let statusText;
      let className;
  
      switch (row.status) {
        case 1:
          statusText = "Upcoming";
          className = "p-1 rounded border border-primary text-white bg-primary w-100 text-center";
          break;
        case 2:
          statusText = "In Progress";
          className = "p-1 rounded border border-warning text-white bg-warning w-100 text-center";
          break;
        case 3:
          statusText = "Completed";
          className = "p-1 rounded border border-success text-black bg-success w-100 text-center";
          break;
        case 4:
          statusText = "Cancelled";
          className = "p-1 rounded border border-danger text-white bg-danger w-100 text-center";
          break;
        case 5:
          statusText = "Requested";
          className = "p-1 rounded border border-primary text-primary bg-white w-100 text-center";
          break;
        default:
          statusText = "Unknown";
          className = "";
      }
  
      return <div key={row.Bookingid} className={className}>{statusText}</div>;
    },
  },
  {
    name: 'Amount',
    selector: row => row.amount,
    sortable: true,
    cell: row => {return <div className='text-gray' style={{fontWeight:'700'}}>₹ {row.amount.toFixed(2)}</div>}
  },
  {
    name: 'GST Amount',
    selector: row => row.GSTAmount,
    sortable: true,
  },
  {
    name: 'Total User Amount',
    selector: row => row.totalUserAmount,
    sortable: true,
  },
  {
    name: 'TDS Amount',
    selector: row => row.TDSAmount,
    sortable: true,
  },
  {
    name: 'Total Host Amount',
    selector: row => row.totalHostAmount,
    sortable: true,
  },
  {
    name: 'Start Trip Date',
    selector: row => row.startTripDate,
    sortable: true,
  },
  {
    name: 'End Trip Date',
    selector: row => row.endTripDate,
    sortable: true,
  },
  {
    name: 'Start Trip Time',
    selector: row => row.startTripTime,
    sortable: true,
  },
  {
    name: 'End Trip Time',
    selector: row => row.endTripTime,
    sortable: true,
  },
  {
    name: 'Created At',
    selector: row => new Date(row.createdAt), // Return the Date object for sorting
    sortable: true,
    cell: row => new Date(row.createdAt).toLocaleString(), // Display as a formatted string
  },
  {
    name: 'Updated At',
    selector: row => new Date(row.updatedAt), // Return the Date object for sorting
    sortable: true,
    cell: row => new Date(row.updatedAt).toLocaleString(), // Display as a formatted string
  },
];



const Bookings = () => {
  const [bookingData, setBookingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [bookingById, setBookingById] = useState(null);
  const [originalBookingData, setOriginalBookingData] = useState(null);
  const [isAccordionOpen, setAccordionOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [isCarAccordionOpen, setCarAccordionOpen] = useState(false);
  const [updateBookingData, setUpdateBookingData] = useState({
    status: '',
    amount: '',
    GSTAmount: '',
    totalUserAmount: '',
    TDSAmount: '',
    totalHostAmount: '',
    startTripDate: '',
    endTripDate: '',
    startTripTime: '',
    endTripTime: '',
    cancelDate: null,
    cancelReason: null,
    features: []
  });
  const [accordionStatusOpen, setStatusAccordionOpen] = useState(false);

  const handleAccordionToggle = () => setStatusAccordionOpen(!accordionStatusOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBooking();
        setBookingData(data);
        setFilteredData(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filterBookings = () => {
      let sortedData = [...bookingData];
      sortedData.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

      if(selectedStatus !== null) {
        sortedData = sortedData.filter((status) => status.status === selectedStatus);
      }
      if (!searchInput) {
        setFilteredData(sortedData);
      } else {
        const filtered = sortedData.filter((booking) => {
          if (selectedSearchOption === 'all') {
            return Object.values(booking).some(value =>
              value && value.toString().toLowerCase().includes(searchInput.toLowerCase())
            );
          } else {
            const value = booking[selectedSearchOption];
            return value && value.toString().toLowerCase().includes(searchInput.toLowerCase());
          }
        });
        setFilteredData(filtered);
      }
    };

    filterBookings();
  }, [searchInput, selectedSearchOption, bookingData , selectedStatus]);

  const handleUserIdClick = (id) => {
        if (selectedUserId === id) {
            // If the same ID is clicked again, toggle the accordion
            setAccordionOpen(prevState => !prevState);
        } else {
            setSelectedUserId(id);
            setAccordionOpen(true);
        }
    };
    function formatDate(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB'); // 'en-GB' locale formats the date as dd/mm/yyyy
    }
    
    function formatTime(timeString) {
      if (!timeString) return null;
      const [hour, minute, second] = timeString.split(':');
      const date = new Date();
      date.setHours(hour, minute, second);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    
  const handleAccordionClose = () => {
    setAccordionOpen(false);
    setSelectedUserId(null);
  };
  const handleCarByIdClick = (id) => {
    if (selectedCarId === id) {
        // If the same ID is clicked again, toggle the accordion
        setCarAccordionOpen(prevState => !prevState);
    } else {
        setSelectedCarId(id);
        setCarAccordionOpen(true);
    }
};

const handleCarAccordionClose = () => {
setCarAccordionOpen(false);
setSelectedCarId(null);
};

  const handleBookingByIdClick = async (id) => {
    try {
      const data = await fetchBookingById(id);
      setBookingById(data.booking);
      setOriginalBookingData(data.booking);
      setUpdateBookingData({
        status: data.booking.status || '',
        amount: data.booking.amount || '',
        GSTAmount: data.booking.GSTAmount || '',
        totalUserAmount: data.booking.totalUserAmount || '',
        TDSAmount: data.booking.TDSAmount || '',
        totalHostAmount: data.booking.totalHostAmount || '',
        Transactionid: data.booking.Transactionid || '',
        startTripDate: data.booking.startTripDate || '',
        endTripDate: data.booking.endTripDate || '',
        startTripTime: data.booking.startTripTime || '',
        endTripTime: data.booking.endTripTime || '',
        cancelDate: data.booking.cancelDate || null,
        cancelReason: data.booking.cancelReason || null,
        features: data.booking.features || []
      });
      setModalVisible(true);
    } catch (error) {
      console.log(error);
    }
  };
  

  const handleOpenUpdateForm = () => {
    setUpdateModalVisible(true);
    setModalVisible(false);
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
  
    const updatedFields = {};
    for (let key in updateBookingData) {
      const originalValue = originalBookingData[key];
      const updatedValue = updateBookingData[key];
  
      // Handle null/undefined and empty values specifically
      if (
        (originalValue === null || originalValue === undefined) &&
        updatedValue !== null &&
        updatedValue !== undefined &&
        updatedValue !== '' &&
        !(Array.isArray(updatedValue) && updatedValue.length === 0)
      ) {
        updatedFields[key] = updatedValue;
      } else if (
        originalValue !== updatedValue &&
        updatedValue !== '' &&
        !(Array.isArray(updatedValue) && updatedValue.length === 0)
      ) {
        updatedFields[key] = updatedValue;
      }
    }
  
    if (Object.keys(updatedFields).length > 0) {
      try {
        await updateBooking(bookingById.Bookingid, updatedFields);
        setUpdateModalVisible(false);
        const updatedData = await getBooking();
        setBookingData(updatedData);
        setFilteredData(updatedData);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("No changes detected");
      setUpdateModalVisible(false);
    }
  };
 

  const displayedBookings = filteredData

  console.log(displayedBookings)


  return (
    <>
      <div className='container-fluid px-4 d-flex flex-column flex-md-row flex-column-reverse align-items-center justify-content-between'>
        <div className='crud-group mb-2 d-none d-md-flex'>
          <CButton className={`border border-2 px-3 py-2 mx-2 ${selectedStatus === 5 ? 'border-white' : ''}`} onClick={() => setSelectedStatus(prevStatus => (prevStatus === 5 ? null : 5))}>
            Requested
          </CButton>
          <CButton className={`border border-2 px-3 py-2 mx-2 ${selectedStatus === 1 ? 'border-primary' : ''}`} onClick={() => setSelectedStatus(prevStatus => (prevStatus === 1 ? null : 1))}>
            Upcoming
          </CButton>
          <CButton className={`border border-2 px-3 py-2 mx-2 ${selectedStatus === 2 ? 'border-warning' : ''}`} onClick = {() => setSelectedStatus(prevStatus => (prevStatus === 2 ? null : 2))}>
            Inprogress
          </CButton>
          <CButton className={`border border-2 px-3 py-2 mx-2 ${selectedStatus === 3 ? 'border-success' : ''}`} onClick = {() => setSelectedStatus(prevStatus => (prevStatus === 3 ? null : 3))}>
            Completed
          </CButton>
          <CButton className={`border border-2 px-3 py-2 mx-2 ${selectedStatus === 4 ? 'border-danger' : ''}`} onClick = {() => setSelectedStatus(prevStatus => (prevStatus === 4 ? null : 4))}>
            Cancelled
          </CButton>
        </div>
        <div className='d-block w-100 d-md-none'>
        
          {accordionStatusOpen ? <></> : 
        
        
        <CAccordion flush className='border rounded mx-2'>
            <CAccordionItem>
              <CAccordionHeader>Status</CAccordionHeader>
              <CAccordionBody>
                <CButton className={`w-100 mb-2 ${selectedStatus === 5 ? 'bg-white text-dark' : 'border-white'}`} onClick={() => setSelectedStatus(prevStatus => (prevStatus === 5 ? null : 5))}>
                  Requested
                </CButton>
                <CButton className={`w-100 mb-2 ${selectedStatus === 1 ? 'bg-primary text-white' : 'border-primary'}`} onClick={() => setSelectedStatus(prevStatus => (prevStatus === 1 ? null : 1))}>
                  Upcoming
                </CButton>
                <CButton className={`w-100 mb-2 ${selectedStatus === 2 ? 'bg-warning text-dark' : 'border-warning'}`} onClick={() => setSelectedStatus(prevStatus => (prevStatus === 2 ? null : 2))}>
                  Inprogress
                </CButton>
                <CButton className={`w-100 mb-2 ${selectedStatus === 3 ? 'bg-success text-white' : 'border-success'}`} onClick={() => setSelectedStatus(prevStatus => (prevStatus === 3 ? null : 3))}>
                  Completed
                </CButton>
                <CButton className={`w-100 mb-2 ${selectedStatus === 4 ? 'bg-danger text-white' : 'border-danger'}`} onClick={() => setSelectedStatus(prevStatus => (prevStatus === 4 ? null : 4))}>
                  Cancelled
                </CButton>
              </CAccordionBody>
            </CAccordionItem>
          </CAccordion>
          }
        
        
          
        
        </div>
        <div className='w-100 px-2'>
          
          <CInputGroup className="mx-2 my-2 w-100">
            <CFormInput
              aria-label="Text input with dropdown button"
              placeholder='Search'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <CDropdown alignment="end" variant="input-group">
              <CDropdownToggle color="primary" variant="outline">
                {tableHeaders.find(header => header.value === selectedSearchOption)?.label}
              </CDropdownToggle>
              <CDropdownMenu>
                {tableHeaders.map((header, index) => (
                  <CDropdownItem className='cursor-pointer' key={index} onClick={() => setSelectedSearchOption(header.value)}>
                    {header.label}
                  </CDropdownItem>
                ))}
              </CDropdownMenu>
            </CDropdown>
          </CInputGroup>
        </div>
      </div>
      <div className='container-fluid h-fit-content mt-2 mb-5'>
            <DataTable
              columns={columns}
              data={displayedBookings.map((row, index) => ({ ...row, uniqueId: `${row.Bookingid}-${index}` }))}
              customStyles={customStyles}
              responsive={true}
              title={'Bookings Table'}
              keyField="Bookingid"
              highlightOnHover={true}
              pointerOnHover={true}
              fixedHeader={true}
              onRowClicked={(booking)=>handleBookingByIdClick(booking.Bookingid)}
            />
        </div>
      
      {/* Booking Details Modal */}
      {bookingById && (
          <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="xl" scrollable>
                <CModalHeader>
                    <CModalTitle>Booking Details</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CRow>
                        <CCol className='booking-modal d-flex align-items-center justify-content-between'>
                            <p><strong>Booking ID:</strong> {bookingById.Bookingid || 'N/A'}</p>
                            <p onClick={() => handleUserIdClick(bookingById.id)} className="clickable-info">
                                <span className='text-decoration-underline cursor-pointer'>
                                    <strong className='mx-2'>User ID:</strong> {bookingById.id || 'N/A'}
                                </span>
                            </p>
                            {isAccordionOpen && selectedUserId === bookingById.id && (
                                <UserData id={selectedUserId} onClose={handleCarAccordionClose} />
                            )}
                            <p onClick={() => handleCarByIdClick(bookingById.carid)} className="clickable-info">
                                <span className='text-decoration-underline cursor-pointer'>
                                    <strong>Car ID: </strong> {bookingById.carid || 'N/A'}
                                </span>
                            </p>
                            {isCarAccordionOpen && selectedCarId === bookingById.carid && (
                                <CarData id={selectedCarId} onClose={handleCarAccordionClose} />
                            )}
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol  className='border rounded col-5'>
                          <p><strong>Start Trip Date:</strong> {formatDate(bookingById.startTripDate) || 'N/A'}</p>
                          <p><strong>Start Trip Time:</strong> {formatTime(bookingById.startTripTime) || 'N/A'}</p>
                        </CCol>
                        <CCol className='col-2 d-flex align-items-center justify-content-center'>
                          <div style={{width: '5vw'}}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" style={{maxWidth: '5vw'}}>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                          </svg>

                          </div>
                        </CCol>
                        <CCol className='border rounded col-5'>
                        <p><strong>End Trip Date:</strong> {formatDate(bookingById.endTripDate) || 'N/A'}</p>

                          <p><strong>End Trip Time:</strong> {formatTime(bookingById.endTripTime) || 'N/A'}</p>
                        </CCol>
                      </CRow>

                    <hr/>
                    <CRow>
                        <CCol md={6}>
                            <div className='modalstatus'>
                                <p><strong>Status:</strong> {bookingById.status || 'N/A'}</p>
                                <p>
                                  <strong>Status: </strong>
                                  {bookingById.status === 1 && (
                                    <span className="p-1 status-view rounded border border-primary text-white bg-primary w-100 text-center">
                                      Upcoming
                                    </span>
                                  )}
                                  {bookingById.status === 2 && (
                                    <span className="p-1 status-view rounded border border-success text-white bg-warning w-100 text-center">
                                      In Progress
                                    </span>
                                  )}
                                  {(bookingById.status === 3) && (
                                    <span className="p-1 status-view rounded border border-light text-black bg-success w-100 text-center">
                                      Completed
                                    </span>
                                  )}
                                  {(bookingById.status === 4) && (
                                    <span className="p-1 status-view rounded border border-light text-black bg-danger w-100 text-center">
                                      Cancelled
                                    </span>
                                  )}
                                  {(bookingById.status === 5) && (
                                    <span className="p-1 status-view rounded border border-light text-black bg-white w-100 text-center">
                                      Requested
                                    </span>
                                  )}
                                </p>
                                <p><strong>Amount:</strong> {bookingById.amount || 'N/A'}</p>
                                <p><strong>GST Amount:</strong> {bookingById.GSTAmount || 'N/A'}</p>
                                <p><strong>Total User Amount:</strong> {bookingById.totalUserAmount || 'N/A'}</p>
                                <p><strong>TDS Amount:</strong> {bookingById.TDSAmount || 'N/A'}</p>
                                <p><strong>Total Host Amount:</strong> {bookingById.totalHostAmount || 'N/A'}</p>
                            </div>
                        </CCol>
                        <CCol md={6}>
                            <div className='modalstatus'>
                                {/* <p><strong>Start Trip Date:</strong> {bookingById.startTripDate || 'N/A'}</p>
                                <p><strong>End Trip Date:</strong> {bookingById.endTripDate || 'N/A'}</p>
                                <p><strong>Start Trip Time:</strong> {bookingById.startTripTime || 'N/A'}</p>
                                <p><strong>End Trip Time:</strong> {bookingById.endTripTime || 'N/A'}</p> */}
                                <p><strong>Created At:</strong> {new Date(bookingById.createdAt).toLocaleString()}</p>
                                <p><strong>Updated At:</strong> {new Date(bookingById.updatedAt).toLocaleString()}</p>
                                <p className='clickable-info'><strong >Transaction Id:</strong><span className='text-black text-xs'> {bookingById.Transactionid || 'N/A'}</span></p>
                            </div>
                        </CCol>
                    </CRow>
                </CModalBody>

                <CModalFooter>
                    <CButton color="success" onClick={handleOpenUpdateForm}>Update</CButton>
                </CModalFooter>
          </CModal>
        )}
              
              

      {/* Update Booking Modal */}
        {updateModalVisible && (
          <CModal visible={updateModalVisible} onClose={() => setUpdateModalVisible(false)} size="lg">
            <CModalHeader>
              <CModalTitle>Update Booking</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CForm>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Status</CFormLabel>
                    <CFormInput
                      type="number"
                      value={updateBookingData.status}
                      onChange={(e) => setUpdateBookingData({ ...updateBookingData, status: parseInt(e.target.value) })}
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Amount</CFormLabel>
                    <CFormInput
                      type="number"
                      value={updateBookingData.amount}
                      onChange={(e) => setUpdateBookingData({ ...updateBookingData, amount: parseFloat(e.target.value) })}
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>GST Amount</CFormLabel>
                    <CFormInput
                      type="number"
                      value={updateBookingData.GSTAmount}
                      onChange={(e) => setUpdateBookingData({ ...updateBookingData, GSTAmount: parseFloat(e.target.value) })}
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Total User Amount</CFormLabel>
                    <CFormInput
                      type="number"
                      value={updateBookingData.totalUserAmount}
                      onChange={(e) => setUpdateBookingData({ ...updateBookingData, totalUserAmount: parseFloat(e.target.value) })}
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>TDS Amount</CFormLabel>
                    <CFormInput
                      type="number"
                      value={updateBookingData.TDSAmount}
                      onChange={(e) => setUpdateBookingData({ ...updateBookingData, TDSAmount: parseFloat(e.target.value) })}
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Total Host Amount</CFormLabel>
                    <CFormInput
                      type="number"
                      value={updateBookingData.totalHostAmount}
                      onChange={(e) => setUpdateBookingData({ ...updateBookingData, totalHostAmount: parseFloat(e.target.value) })}
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Transaction ID</CFormLabel>
                    <CFormInput
                      type="text"
                      value={updateBookingData.Transactionid}
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Start Trip Date</CFormLabel>
                    <CFormInput
                      type="date"
                      value={updateBookingData.startTripDate}
                      onChange={(e) => setUpdateBookingData({ ...updateBookingData, startTripDate: e.target.value })}
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>End Trip Date</CFormLabel>
                    <CFormInput
                      type="date"
                      value={updateBookingData.endTripDate}
                      onChange={(e) => setUpdateBookingData({ ...updateBookingData, endTripDate: e.target.value })}
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Start Trip Time</CFormLabel>
                    <CFormInput
                      type="time"
                      value={updateBookingData.startTripTime}
                      onChange={(e) => setUpdateBookingData({ ...updateBookingData, startTripTime: e.target.value })}
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>End Trip Time</CFormLabel>
                    <CFormInput
                      type="time"
                      value={updateBookingData.endTripTime}
                      onChange={(e) => setUpdateBookingData({ ...updateBookingData, endTripTime: e.target.value })}
                    />
                  </CCol>
                </CRow>
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton color="primary" onClick={handleUpdateBooking}>Save changes</CButton>
            </CModalFooter>
          </CModal>
        )}

    </>
  );
};

export default Bookings;
