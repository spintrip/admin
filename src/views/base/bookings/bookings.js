import React, { useEffect, useState } from 'react';
import { getBooking, fetchBookingById, updateBooking } from '../../../api/booking';
import { fetchCabs } from '../../../api/cab';
import { fetchDrivers } from '../../../api/driver';
import UserData from '../controller/userData';
import vehicleData from '../controller/vehicleData';
import {

  CInputGroup,
  CFormInput,
  CFormSelect,
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
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Google_Maps_Api_key } from '../../../env';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
};

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
  { label: 'vehicle Id', value: 'vehicleid' },
  { label: 'User Id', value: 'id' },
  { label: 'Status', value: 'status' },
  { label: 'Amount', value: 'amount' },
  { label: 'GST Amount', value: 'GSTAmount' },
  { label: 'Total User Amount', value: 'totalUserAmount' },
  { label: 'TDS Amount', value: 'TDSAmount' },
  { label: 'Total Host Amount', value: 'totalHostAmount' },
  { label: 'Pick-Up Location', value: 'pickUpLocation' },
  { label: 'Drop-Off Location', value: 'dropOffLocation' },
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
    name: 'vehicle Id',
    selector: row => row.vehicleid,
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
    cell: row => {return <div className='text-gray' style={{fontWeight:'700'}}>Rs. {row && typeof row.amount === 'number' ? row.amount.toFixed(2) : (row && row.amount ? Number(row.amount).toFixed(2) : '0.00')}</div>}
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
    name: 'Pick-Up Location',
    selector: row => row.pickUpLocation || 'N/A',
    sortable: true,
  },
  {
    name: 'Drop-Off Location',
    selector: row => row.dropOffLocation || 'N/A',
    sortable: true,
  },
  {
    name: 'Start Trip Date',
    selector: row => row.startTripDate || row.pointAToBDate || row.Date || row.date || 'N/A',
    sortable: true,
    cell: row => <div>{row.startTripDate || row.pointAToBDate || row.Date || row.date || 'N/A'}</div>
  },
  {
    name: 'End Trip Date',
    selector: row => row.endTripDate || 'N/A',
    sortable: true,
    cell: row => <div>{row.endTripDate || 'N/A'}</div>
  },
  {
    name: 'Start Trip Time',
    selector: row => row.startTripTime || row.pointAToBTime || row.time,
    sortable: true,
    cell: row => {
       const timeStr = row.startTripTime || row.pointAToBTime || row.time;
       if (!timeStr) return <div>N/A</div>;
       if (timeStr.includes('T')) {
          const d = new Date(timeStr);
          const parsed = Number.isNaN(d.getTime()) ? timeStr.substring(0, 5) : d.toTimeString().substring(0, 5);
          return <div>{parsed}</div>;
       }
       return <div>{timeStr.substring(0, 5)}</div>;
    }
  },
  {
    name: 'End Trip Time',
    selector: row => row.endTripTime || 'N/A',
    sortable: true,
    cell: row => {
       if (!row.endTripTime) return <div>N/A</div>;
       return <div>{row.endTripTime.substring(0, 5)}</div>;
    }
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
  const [cabs, setCabs] = useState([]);
  const [drivers, setDrivers] = useState([]);
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
  const [selectedvehicleid, setSelectedvehicleid] = useState(null);
  const [isvehicleAccordionOpen, setvehicleAccordionOpen] = useState(false);
  const [updateBookingData, setUpdateBookingData] = useState({
    status: '',
    amount: '',
    vehicleid: '',
    driverid: '',
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
    features: [],
    pickUpLocation: '',
    dropOffLocation: '',
    distance: '',
    carname: '',
    paymentMethod: '',
    isCab: false
  });
  const [accordionStatusOpen, setStatusAccordionOpen] = useState(false);
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: Google_Maps_Api_key });
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [activeDriverWindow, setActiveDriverWindow] = useState(null);
  const defaultCenter = { lat: 20.5937, lng: 78.9629 };

  const handleAccordionToggle = () => setStatusAccordionOpen(!accordionStatusOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, cabsData, driversData] = await Promise.all([getBooking(), fetchCabs(), fetchDrivers()]);
        setBookingData(data);
        setFilteredData(data);
        setCabs(cabsData || []);
        setDrivers(driversData || []);
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
      if (typeof timeString === 'string' && timeString.includes('T')) {
          const d = new Date(timeString);
          if (!Number.isNaN(d.getTime())) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      }
      const parts = String(timeString).split(':');
      const hour = parseInt(parts[0], 10) || 0;
      const minute = parseInt(parts[1], 10) || 0;
      const second = parts.length > 2 ? parseInt(parts[2], 10) || 0 : 0;
      const date = new Date();
      date.setHours(hour, minute, second);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    
  const handleAccordionClose = () => {
    setAccordionOpen(false);
    setSelectedUserId(null);
  };
  const handlevehicleByIdClick = (id) => {
    if (selectedvehicleid === id) {
        // If the same ID is clicked again, toggle the accordion
        setvehicleAccordionOpen(prevState => !prevState);
    } else {
        setSelectedvehicleid(id);
        setvehicleAccordionOpen(true);
    }
};

const handlevehicleAccordionClose = () => {
setvehicleAccordionOpen(false);
setSelectedvehicleid(null);
};

  const handleBookingByIdClick = async (id) => {
    try {
      const data = await fetchBookingById(id);
      
      const extractTime = (timeStr) => {
        if (!timeStr) return '';
        if (timeStr.includes('T')) {
          const d = new Date(timeStr);
          return Number.isNaN(d.getTime()) ? timeStr.substring(0, 5) : d.toTimeString().substring(0, 5);
        }
        return timeStr.substring(0, 5);
      };

      setBookingById(data.booking);
      setOriginalBookingData(data.booking);
      setUpdateBookingData({
        status: data.booking.status || '',
        amount: data.booking.amount || '',
        vehicleid: data.booking.vehicleid || '',
        driverid: data.booking.driverid || '',
        GSTAmount: data.booking.GSTAmount || '',
        totalUserAmount: data.booking.totalUserAmount || '',
        TDSAmount: data.booking.TDSAmount || '',
        totalHostAmount: data.booking.totalHostAmount || '',
        Transactionid: data.booking.Transactionid || '',
        startTripDate: data.booking.startTripDate || data.booking.pointAToBDate || data.booking.Date || data.booking.date || '',
        endTripDate: data.booking.endTripDate || '',
        startTripTime: extractTime(data.booking.startTripTime || data.booking.pointAToBTime || data.booking.time),
        endTripTime: extractTime(data.booking.endTripTime),
        cancelDate: data.booking.cancelDate || null,
        cancelReason: data.booking.cancelReason || null,
        features: data.booking.features || [],
        pickUpLocation: data.booking.pickUpLocation || '',
        dropOffLocation: data.booking.dropOffLocation || '',
        pickUpLat: data.booking.pickUpLat || null,
        pickUpLng: data.booking.pickUpLng || null,
        distance: data.booking.distance || '',
        carname: data.booking.carname || '',
        paymentMethod: data.booking.paymentMethod || '',
        isCab: data.booking.isCab || false
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
 
  const handleAssignDriver = async (driverId) => {
    try {
      await updateBooking(bookingById.Bookingid, { driverid: driverId, status: 1 });
      setMapModalVisible(false);
      setModalVisible(false);
      const updatedData = await getBooking();
      setBookingData(updatedData);
      setFilteredData(updatedData);
    } catch (error) {
      console.error(error);
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
                                <UserData id={selectedUserId} onClose={handlevehicleAccordionClose} />
                            )}
                            <p onClick={() => handlevehicleByIdClick(bookingById.vehicleid)} className="clickable-info">
                                <span className='text-decoration-underline cursor-pointer'>
                                    <strong>vehicle Id: </strong> {bookingById.vehicleid || 'N/A'}
                                </span>
                            </p>
                            {isvehicleAccordionOpen && selectedvehicleid === bookingById.vehicleid && (
                                <vehicleData id={selectedvehicleid} onClose={handlevehicleAccordionClose} />
                            )}
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol  className='border rounded col-5'>
                          <p><strong>Start Trip Date:</strong> {formatDate(bookingById.startTripDate) || formatDate(bookingById.pointAToBDate) || 'N/A'}</p>
                          <p><strong>Start Trip Time:</strong> {formatTime(bookingById.startTripTime) || formatTime(bookingById.pointAToBTime) || 'N/A'}</p>
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
                                {bookingById.isCab && (
                                  <>
                                    <p><strong>Pick-Up Location:</strong> {bookingById.pickUpLocation || 'N/A'}</p>
                                    <p><strong>Drop-Off Location:</strong> {bookingById.dropOffLocation || 'N/A'}</p>
                                    <p><strong>Requested Car Model:</strong> {bookingById.carname || 'N/A'}</p>
                                    <p><strong>Est. Distance:</strong> {bookingById.distance || 'N/A'}</p>
                                    <hr className='my-2'/>
                                  </>
                                )}
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
                    {bookingById?.status === 5 && bookingById?.isCab && bookingById?.pickUpLat && (
                      <CButton color="info" className="text-white" onClick={() => setMapModalVisible(true)}> Assign via Map </CButton>
                    )}
                    <CButton color="secondary" onClick={() => setModalVisible(false)}>Close</CButton>
                    <CButton color="success" onClick={handleOpenUpdateForm}>Update</CButton>
                </CModalFooter>
          </CModal>
        )}
              
              

      {/* Update Booking Modal */}
        {updateModalVisible && (
          <CModal backdrop="static" visible={updateModalVisible} onClose={() => setUpdateModalVisible(false)} size="lg">
            <CModalHeader closeButton>
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
                      value={updateBookingData.Transactionid || ''}
                      onChange={(e) => setUpdateBookingData({ ...updateBookingData, Transactionid: e.target.value })}
                    />
                  </CCol>
                </CRow>
                {updateBookingData.isCab && (
                  <>
                    <CRow className="mb-3">
                      <CCol>
                        <CFormLabel>Pick-Up Location</CFormLabel>
                        <CFormInput type="text" value={updateBookingData.pickUpLocation} readOnly disabled />
                      </CCol>
                    </CRow>
                    <CRow className="mb-3">
                      <CCol>
                        <CFormLabel>Drop-Off Location</CFormLabel>
                        <CFormInput type="text" value={updateBookingData.dropOffLocation} readOnly disabled />
                      </CCol>
                    </CRow>
                    <CRow className="mb-3">
                      <CCol>
                        <CFormLabel>Requested Car Model</CFormLabel>
                        <CFormInput type="text" value={updateBookingData.carname} readOnly disabled />
                      </CCol>
                      <CCol>
                        <CFormLabel>Est. Distance</CFormLabel>
                        <CFormInput type="text" value={updateBookingData.distance} readOnly disabled />
                      </CCol>
                    </CRow>
                  </>
                )}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Assign Cab (Vehicle ID)</CFormLabel>
                    <CFormSelect
                      value={updateBookingData.vehicleid || ''}
                      onChange={(e) => setUpdateBookingData({ ...updateBookingData, vehicleid: e.target.value })}
                    >
                      <option value="">Select a Cab...</option>
                      {cabs.map(cab => (
                        <option key={cab.vehicleid} value={cab.vehicleid}>
                          {cab.brand} {cab.variant} ({cab.Vehicle?.Rcnumber || 'No RC'})
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Assign Driver</CFormLabel>
                    <CFormSelect
                      value={updateBookingData.driverid || ''}
                      onChange={(e) => {
                         const selectedDriverId = e.target.value;
                         const associatedCab = cabs.find(cab => String(cab.driverId || cab.driverid) === String(selectedDriverId));
                         setUpdateBookingData({ 
                             ...updateBookingData, 
                             driverid: selectedDriverId,
                             vehicleid: associatedCab ? associatedCab.vehicleid : updateBookingData.vehicleid,
                             status: 1 // Auto-progress Cab status to 'Upcoming' (Accepted) on Driver Assignment
                         });
                      }}
                    >
                      <option value="">Select a Driver...</option>
                      {drivers.map(driver => (
                        <option key={driver.id} value={driver.id}>
                          {driver.DriverAdditional?.FullName || driver.name || 'Unknown'} (Ph: {driver.User?.phone || 'N/A'})
                        </option>
                      ))}
                    </CFormSelect>
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
              <CButton color="secondary" onClick={() => setUpdateModalVisible(false)}>Close</CButton>
              {bookingById?.status === 5 && bookingById?.isCab && bookingById?.pickUpLat && (
                <CButton color="info" className="text-white" onClick={() => setMapModalVisible(true)}> Assign via Map </CButton>
              )}
              <CButton color="primary" onClick={handleUpdateBooking}>Save changes</CButton>
            </CModalFooter>
          </CModal>
        )}

      {/* Map Assignment Modal */}
      {mapModalVisible && isLoaded && (
        <CModal backdrop="static" visible={mapModalVisible} onClose={() => { setMapModalVisible(false); setActiveDriverWindow(null); }} size="xl">
          <CModalHeader closeButton><CModalTitle>Assign Online Driver via Map</CModalTitle></CModalHeader>
          <CModalBody style={{ height: '600px', padding: 0 }}>
            <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} zoom={12} center={bookingById?.pickUpLat ? { lat: parseFloat(bookingById.pickUpLat), lng: parseFloat(bookingById.pickUpLng) } : defaultCenter}>
              {bookingById?.pickUpLat && (
                <Marker position={{ lat: parseFloat(bookingById.pickUpLat), lng: parseFloat(bookingById.pickUpLng) }} icon={{ url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" }} title="Pickup Location" />
              )}
              {drivers.filter(d => Boolean(d.isActive) && d.latitude !== null).map((driver) => {
                const dist = calculateDistance(bookingById?.pickUpLat, bookingById?.pickUpLng, driver.latitude, driver.longitude);
                return (
                  <Marker key={driver.id} position={{ lat: parseFloat(driver.latitude), lng: parseFloat(driver.longitude) }} icon={{ url: "https://maps.google.com/mapfiles/kml/shapes/cabs.png", scaledSize: new window.google.maps.Size(32, 32) }} onClick={() => setActiveDriverWindow(driver.id)}>
                    {activeDriverWindow === driver.id && (
                      <InfoWindow onCloseClick={() => setActiveDriverWindow(null)}>
                        <div style={{ color: 'black', padding: '5px' }}>
                          <h6 className='m-0 p-0 mb-1 fw-bold'>{driver.name || 'Unknown Driver'}</h6>
                          <p className='m-0 p-0 text-muted'>Distance: {dist ? dist + ' km' : 'Unknown'}</p>
                          <CButton size="sm" color="info" className="text-white mt-2 w-100" onClick={() => handleAssignDriver(driver.id)}>
                            Assign
                          </CButton>
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                );
              })}
            </GoogleMap>
          </CModalBody>
        </CModal>
      )}

    </>
  );
};

export default Bookings;
