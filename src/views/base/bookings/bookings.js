import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getBooking, fetchBookingById, updateBooking, createBooking, getSelfDriveBookings, getCabBookings, cancelCabBooking, sendCabInvoice } from '../../../api/booking';
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
  CAccordionHeader,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CBadge,
  useColorModes,
  CCard,
  CCardBody
} from '@coreui/react';
import '../../../scss/booking.css';
import DataTable from 'react-data-table-component';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Autocomplete } from '@react-google-maps/api';
import { Google_Maps_Api_key } from '../../../env';

const LIBRARIES = ['places'];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
};

// removed customStyles
const tableHeaders = [
  { label: 'Booking ID', value: 'Bookingid' },
  { label: 'Vehicle Name', value: 'carname' }, // Added
  { label: 'Customer', value: 'customerName' },

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
    name: 'Type',
    selector: row => row.bookingType || row.type || (row.isCab ? 'Cab' : 'Rental'),
    sortable: true,
    cell: row => (
      <div className="text-muted fw-bold text-capitalize">
        {row.bookingType || row.type || (row.isCab ? 'Cab' : 'Rental')}
        {row.bookingType === 'Outstation' && (
          <div className="small text-info">
            ({row.days || 1} Days, {row.isRoundTrip ? 'Round Trip' : 'One Way'})
          </div>
        )}
      </div>
    )
  },
  {
    name: 'Vehicle',
    selector: row => row.carname || 'N/A',
    sortable: true,
    cell: row => <div className="fw-bold text-info">{row.carname || 'N/A'}</div>
  },
  {
    name: 'Customer',
    selector: row => row.customerName || 'N/A',
    sortable: true,
    cell: row => (
      <div>
        <div className="fw-bold">{row.customerName || 'N/A'}</div>
        <div className="small text-muted">{row.customerPhone || ''}</div>
      </div>
    )
  },

  {
    name: 'Status',
    selector: row => {
      switch (row.status) {
        case 1: return "Upcoming";
        case 2: return "Ongoing";
        case 3: return "Complete";
        case 4: return "Cancelled";
        case 5: return "Requested";
        case 6: return "Completed with review";
        default: return "Unknown";
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
          statusText = "Ongoing";
          className = "p-1 rounded border border-warning text-white bg-warning w-100 text-center";
          break;
        case 3:
          statusText = "Complete";
          className = "p-1 rounded border border-success text-white bg-success w-100 text-center";
          break;
        case 4:
          statusText = "Cancelled";
          className = "p-1 rounded border border-danger text-white bg-danger w-100 text-center";
          break;
        case 5:
          statusText = "Requested";
          className = "p-1 rounded border border-info text-white bg-info w-100 text-center";
          break;
        case 6:
          statusText = "Completed with review";
          className = "p-1 rounded border border-success text-white bg-success w-100 text-center";
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
  const { colorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const isDark = colorMode === 'dark' || (colorMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const location = useLocation();
  const isSelfDriveMode = location.pathname.includes('self-drive');
  const isCabMode = location.pathname.includes('cab-bookings');
  
  const [bookingData, setBookingData] = useState([]);

  const [cabs, setCabs] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [activeTab, setActiveTab] = useState('general');
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
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newBookingData, setNewBookingData] = useState({
    customerPhone: '',
    customerName: '',
    cabType: 'mini eco',
    bookingType: 'Local',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    amount: '',
    startLocation: { address: '', latitude: null, longitude: null },
    endLocation: { address: '', latitude: null, longitude: null }
  });
  const [pickupAutocomplete, setPickupAutocomplete] = useState(null);
  const [dropAutocomplete, setDropAutocomplete] = useState(null);
  const [accordionStatusOpen, setStatusAccordionOpen] = useState(false);
  const { isLoaded } = useJsApiLoader({ 
    id: 'google-map-script', 
    googleMapsApiKey: Google_Maps_Api_key,
    libraries: LIBRARIES
  });
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [activeDriverWindow, setActiveDriverWindow] = useState(null);
  const defaultCenter = { lat: 20.5937, lng: 78.9629 };

  const handleAccordionToggle = () => setStatusAccordionOpen(!accordionStatusOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let dataFetchMethod = getBooking;
        if (isSelfDriveMode) dataFetchMethod = getSelfDriveBookings;
        if (isCabMode) dataFetchMethod = getCabBookings;

        const [data, cabsData, driversData] = await Promise.all([
          dataFetchMethod(),
          fetchCabs(),
          fetchDrivers()
        ]);
        setBookingData(data);
        setFilteredData(data);
        setCabs(cabsData || []);
        setDrivers(driversData || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [isSelfDriveMode, isCabMode]);


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

  const handleCancelBooking = async () => {
    if (!cancelReason) {
      alert("Please enter a reason for cancellation.");
      return;
    }
    try {
      await cancelCabBooking(bookingById.Bookingid, cancelReason);
      setCancelModalVisible(false);
      setModalVisible(false);
      setCancelReason('');
      const updatedData = await getBooking();
      setBookingData(updatedData);
      setFilteredData(updatedData);
      alert('Booking cancelled successfully.');
    } catch (error) {
      console.error(error);
      alert('Failed to cancel booking: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSendInvoice = async () => {
    if (!window.confirm("Send invoice email/SMS to customer?")) return;
    try {
      await sendCabInvoice(bookingById.Bookingid);
      alert('Invoice sent successfully.');
    } catch (error) {
      console.error(error);
      alert('Failed to send invoice: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCreateBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBooking(newBookingData);
      setCreateModalVisible(false);
      setNewBookingData({
        customerPhone: '',
        customerName: '',
        cabType: 'mini eco',
        bookingType: 'Local',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        amount: '',
        startLocation: { address: '', latitude: null, longitude: null },
        endLocation: { address: '', latitude: null, longitude: null }
      });
      const updatedData = await getBooking();
      setBookingData(updatedData);
      setFilteredData(updatedData);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking: ' + (error.response?.data?.message || error.message));
    }
  };

  const onPickupPlaceChanged = () => {
    if (pickupAutocomplete !== null) {
      const place = pickupAutocomplete.getPlace();
      if (place.geometry) {
        setNewBookingData(prev => ({
          ...prev,
          startLocation: {
            address: place.formatted_address || place.name || prev.startLocation.address,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng()
          }
        }));
      }
    }
  };

  const onDropPlaceChanged = () => {
    if (dropAutocomplete !== null) {
      const place = dropAutocomplete.getPlace();
      if (place.geometry) {
        setNewBookingData(prev => ({
          ...prev,
          endLocation: {
            address: place.formatted_address || place.name || prev.endLocation.address,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng()
          }
        }));
      }
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
        <div className='w-100 px-2 d-flex align-items-center'>
          <CButton color="success" className="text-white me-2" style={{minWidth: '150px'}} onClick={() => setCreateModalVisible(true)}>
             + New Booking
          </CButton>
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
          <CCard className="mb-4">
            <CCardBody>
              <DataTable
                columns={columns}
                data={displayedBookings.map((row, index) => ({ ...row, uniqueId: `${row.Bookingid}-${index}` }))}
                theme={isDark ? 'dark' : 'default'}
                responsive={true}
                title={'Bookings Table'}
                keyField="Bookingid"
                highlightOnHover={true}
                pointerOnHover={true}
                fixedHeader={true}
                onRowClicked={(booking)=>handleBookingByIdClick(booking.Bookingid)}
              />
            </CCardBody>
          </CCard>
        </div>
      
      {/* Booking Details Modal */}
      {bookingById && (
          <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="xl" scrollable>
                <CModalHeader>
                    <CModalTitle>Booking Details: {bookingById.Bookingid}</CModalTitle>
                </CModalHeader>
                <CModalBody className="p-0">
                  <CNav variant="tabs" role="tablist" className="px-3 pt-2 border-bottom">
                    <CNavItem>
                      <CNavLink active={activeTab === 'general'} onClick={() => setActiveTab('general')} style={{ cursor: 'pointer' }}>
                        General Info
                      </CNavLink>
                    </CNavItem>
                    <CNavItem>
                      <CNavLink active={activeTab === 'financials'} onClick={() => setActiveTab('financials')} style={{ cursor: 'pointer' }}>
                        Financials
                      </CNavLink>
                    </CNavItem>
                  </CNav>
                  <CTabContent className="p-4">
                    <CTabPane visible={activeTab === 'general'}>
                      <CRow className="mb-4">
                        <CCol md={6}>
                          <div className="p-3 border rounded h-100">
                            <h6 className="fw-bold mb-3 border-bottom pb-2">Customer & Trip</h6>
                            <p><strong>Status:</strong> <CBadge color={bookingById.status === 3 || bookingById.status === 6 ? 'success' : bookingById.status === 4 ? 'danger' : bookingById.status === 2 ? 'warning' : bookingById.status === 5 ? 'info' : 'primary'}>{bookingById.status === 1 ? 'Upcoming' : bookingById.status === 2 ? 'Ongoing' : bookingById.status === 3 ? 'Complete' : bookingById.status === 4 ? 'Cancelled' : bookingById.status === 5 ? 'Requested' : bookingById.status === 6 ? 'Completed with review' : 'Unknown'}</CBadge></p>
                            <p className="clickable-info m-0" onClick={() => handleUserIdClick(bookingById.id)}>
                                <strong>Customer: </strong> 
                                <span className='text-decoration-underline cursor-pointer text-primary'>
                                    {bookingById.customerName || 'N/A'} ({bookingById.customerPhone || 'N/A'})
                                </span>
                            </p>
                            {isAccordionOpen && selectedUserId === bookingById.id && (
                                <div className="mt-2"><UserData id={selectedUserId} onClose={handleAccordionClose} /></div>
                            )}
                            <p className="mt-2"><strong>Trip Type:</strong> <span className="text-capitalize fw-bold">{bookingById.bookingType || 'Cab'}</span></p>
                            {bookingById.bookingType === 'Outstation' && (
                              <>
                                <p><strong>Duration:</strong> {bookingById.days || 1} Days</p>
                                <p><strong>Round Trip:</strong> {bookingById.isRoundTrip ? 'Yes' : 'No (One Way)'}</p>
                              </>
                            )}
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <div className="p-3 border rounded h-100">
                            <h6 className="fw-bold mb-3 border-bottom pb-2">Vehicle & Route</h6>
                            <p><strong>Requested Vehicle:</strong> <span className='text-primary fw-bold'>{bookingById.carname || 'N/A'}</span></p>
                            {bookingById.isCab && (
                              <>
                                <p><strong>Pick-Up:</strong> {bookingById.pickUpLocation || 'N/A'}</p>
                                <p><strong>Drop-Off:</strong> {bookingById.dropOffLocation || 'N/A'}</p>
                                <p><strong>Est. Distance:</strong> {bookingById.distance || 'N/A'}</p>
                              </>
                            )}
                          </div>
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol className='border rounded p-3 text-center'>
                          <p className="text-muted mb-1">Start Trip Date & Time</p>
                          <h6 className="fw-bold m-0">{formatDate(bookingById.startTripDate) || formatDate(bookingById.pointAToBDate) || 'N/A'} at {formatTime(bookingById.startTripTime) || formatTime(bookingById.pointAToBTime) || 'N/A'}</h6>
                        </CCol>
                        <CCol className='col-2 d-flex align-items-center justify-content-center'>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="text-muted" style={{maxWidth: '3vw'}}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                          </svg>
                        </CCol>
                        <CCol className='border rounded p-3 text-center'>
                          <p className="text-muted mb-1">End Trip Date & Time</p>
                          <h6 className="fw-bold m-0">{formatDate(bookingById.endTripDate) || 'N/A'} at {formatTime(bookingById.endTripTime) || 'N/A'}</h6>
                        </CCol>
                      </CRow>
                    </CTabPane>

                    <CTabPane visible={activeTab === 'financials'}>
                      <CRow className="g-4">
                        <CCol md={6}>
                          <div className="p-4 border rounded-3 h-100 bg-light-subtle shadow-sm">
                            <h6 className="fw-bold mb-4 border-bottom pb-2 d-flex align-items-center">
                              <span className="bg-primary p-1 rounded me-2"></span>
                              Platform Revenue
                            </h6>
                            <div className="d-flex justify-content-between mb-3">
                              <span className="text-muted">Total Collected:</span> 
                              <span className="fw-bold text-dark">Rs. {bookingById.totalUserAmount || '0.00'}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                              <span className="text-muted">Platform Commission:</span> 
                              <span className="fw-bold text-primary">Rs. {bookingById.commissionAmount || '0.00'}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                              <span className="text-muted">GST Collected (5%):</span> 
                              <span className="fw-bold">Rs. {bookingById.GSTAmount || '0.00'}</span>
                            </div>
                            {bookingById.discountAmount > 0 && (
                              <div className="d-flex justify-content-between mb-3 text-danger">
                                <span className="small">Platform Discount:</span> 
                                <span className="fw-bold small">- Rs. {bookingById.discountAmount}</span>
                              </div>
                            )}
                            <div className="d-flex justify-content-between mb-0 pt-3 border-top mt-2">
                              <span className="text-dark fw-bold">Net Platform Gain:</span> 
                              <span className="text-primary fw-bold fs-4">Rs. {(parseFloat(bookingById.commissionAmount) - parseFloat(bookingById.discountAmount || 0)).toFixed(2)}</span>
                            </div>
                            {bookingById.offerCode && (
                              <div className="small text-muted mt-2 text-end italic">Promo: {bookingById.offerCode}</div>
                            )}
                          </div>
                        </CCol>

                        <CCol md={6}>
                          <div className="p-4 border rounded-3 h-100 bg-light-subtle shadow-sm">
                            <h6 className="fw-bold mb-4 border-bottom pb-2 d-flex align-items-center">
                              <span className="bg-success p-1 rounded me-2"></span>
                              Partner Payout
                            </h6>
                            <div className="d-flex justify-content-between mb-3">
                              <span className="text-muted">Gross Driver Pay:</span> 
                              <span className="fw-bold">Rs. {(parseFloat(bookingById.totalHostAmount) + parseFloat(bookingById.TDSAmount || 0)).toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 text-warning">
                              <span className="text-muted">TDS Deduction (1%):</span> 
                              <span className="fw-bold">- Rs. {bookingById.TDSAmount || '0.00'}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-0 pt-3 border-top mt-auto">
                              <span className="text-dark fw-bold">Net Payout to Driver:</span> 
                              <span className="text-success fw-bold fs-4">Rs. {bookingById.totalHostAmount || '0.00'}</span>
                            </div>
                            <div className="small text-muted mt-3 p-2 bg-white rounded border border-dashed">
                              Payment Mode: <span className="text-capitalize fw-bold">{bookingById.paymentMethod || 'Wallet/Cash'}</span>
                            </div>
                          </div>
                        </CCol>
                      </CRow>
                      <CRow className="mt-4">
                        <CCol>
                          <div className="p-3 border rounded text-muted small">
                            <p className="mb-1"><strong>Created At:</strong> {new Date(bookingById.createdAt).toLocaleString()}</p>
                            <p className="mb-1"><strong>Updated At:</strong> {new Date(bookingById.updatedAt).toLocaleString()}</p>
                            <p className="mb-0"><strong>Transaction ID:</strong> {bookingById.Transactionid || 'N/A'}</p>
                          </div>
                        </CCol>
                      </CRow>
                    </CTabPane>
                  </CTabContent>
                </CModalBody>

                <CModalFooter className="justify-content-between border-top">
                    <div>
                      {bookingById?.status !== 4 && (
                        <CButton color="danger" variant="outline" className="me-2" onClick={() => setCancelModalVisible(true)}>
                          Cancel Booking
                        </CButton>
                      )}
                      <CButton color="info" variant="outline" onClick={handleSendInvoice}>
                        Send Invoice
                      </CButton>
                    </div>
                    <div>
                      <CButton color="secondary" className="me-2" onClick={() => setModalVisible(false)}>Close</CButton>
                      {bookingById?.status === 5 && bookingById?.isCab && bookingById?.pickUpLat && (
                        <CButton color="info" className="text-white me-2" onClick={() => setMapModalVisible(true)}> Assign via Map </CButton>
                      )}
                      <CButton color="success" className="text-white" onClick={handleOpenUpdateForm}>Edit details</CButton>
                    </div>
                </CModalFooter>
          </CModal>
        )}
              
        {/* Cancel Reason Modal */}
        <CModal visible={cancelModalVisible} onClose={() => setCancelModalVisible(false)}>
          <CModalHeader>
            <CModalTitle>Cancel Booking {bookingById?.Bookingid}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CFormLabel>Reason for cancellation</CFormLabel>
            <CFormInput 
              type="text" 
              placeholder="e.g. Customer requested, No driver available..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setCancelModalVisible(false)}>Go Back</CButton>
            <CButton color="danger" className="text-white" onClick={handleCancelBooking}>Confirm Cancellation</CButton>
          </CModalFooter>
        </CModal>
              
              

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
                    <CFormSelect
                      value={updateBookingData.status}
                      onChange={(e) => setUpdateBookingData({ ...updateBookingData, status: parseInt(e.target.value) })}
                    >
                      <option value={5}>Requested</option>
                      <option value={1}>Upcoming</option>
                      <option value={2}>Ongoing</option>
                      <option value={3}>Complete</option>
                      <option value={4}>Cancelled</option>
                      <option value={6}>Completed with review</option>
                    </CFormSelect>
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

      {/* Create Booking Modal */}
      {isLoaded && (
        <CModal visible={createModalVisible} onClose={() => setCreateModalVisible(false)} size="lg" backdrop="static">
          <CModalHeader closeButton>
            <CModalTitle>Create New Manual Booking</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm onSubmit={handleCreateBookingSubmit}>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Customer Phone</CFormLabel>
                  <CFormInput
                    required
                    type="text"
                    placeholder="Enter phone number"
                    value={newBookingData.customerPhone}
                    onChange={(e) => setNewBookingData({ ...newBookingData, customerPhone: e.target.value })}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Customer Name (Optional)</CFormLabel>
                  <CFormInput
                    type="text"
                    placeholder="Enter full name"
                    value={newBookingData.customerName}
                    onChange={(e) => setNewBookingData({ ...newBookingData, customerName: e.target.value })}
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Trip Type</CFormLabel>
                  <CFormSelect
                    value={newBookingData.bookingType}
                    onChange={(e) => setNewBookingData({ ...newBookingData, bookingType: e.target.value })}
                  >
                    <option value="Local">Local (Point-to-Point)</option>
                    <option value="Airport">Airport Transfer</option>
                    <option value="Outstation">Outstation (Intercity)</option>
                    <option value="Rentals">Rentals (Hourly)</option>
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Cab Category</CFormLabel>
                  <CFormSelect
                    value={newBookingData.cabType}
                    onChange={(e) => setNewBookingData({ ...newBookingData, cabType: e.target.value })}
                  >
                    <option value="mini eco">Mini ECO</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="luxury">Luxury</option>
                  </CFormSelect>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormLabel>Pickup Location (Search)</CFormLabel>
                  <Autocomplete
                    onLoad={(autocomplete) => setPickupAutocomplete(autocomplete)}
                    onPlaceChanged={onPickupPlaceChanged}
                    options={{ types: ['geocode', 'establishment'] }}
                  >
                    <CFormInput 
                      required 
                      type="text" 
                      placeholder="Search pickup address..." 
                      value={newBookingData.startLocation.address}
                      onChange={(e) => setNewBookingData({ 
                        ...newBookingData, 
                        startLocation: { ...newBookingData.startLocation, address: e.target.value, latitude: null, longitude: null } 
                      })}
                    />
                  </Autocomplete>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormLabel>Drop-off Location (Search)</CFormLabel>
                  <Autocomplete
                    onLoad={(autocomplete) => setDropAutocomplete(autocomplete)}
                    onPlaceChanged={onDropPlaceChanged}
                    options={{ types: ['geocode', 'establishment'] }}
                  >
                    <CFormInput 
                      required={newBookingData.bookingType !== 'Rentals'} 
                      type="text" 
                      placeholder="Search drop-off address..." 
                      value={newBookingData.endLocation.address}
                      onChange={(e) => setNewBookingData({ 
                        ...newBookingData, 
                        endLocation: { ...newBookingData.endLocation, address: e.target.value, latitude: null, longitude: null } 
                      })}
                    />
                  </Autocomplete>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Date</CFormLabel>
                  <CFormInput
                    required
                    type="date"
                    value={newBookingData.date}
                    onChange={(e) => setNewBookingData({ ...newBookingData, date: e.target.value })}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Time</CFormLabel>
                  <CFormInput
                    required
                    type="time"
                    value={newBookingData.time}
                    onChange={(e) => setNewBookingData({ ...newBookingData, time: e.target.value })}
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Total Fare (Amt to show customer)</CFormLabel>
                  <CFormInput
                    required
                    type="number"
                    placeholder="Enter total amount"
                    value={newBookingData.amount}
                    onChange={(e) => setNewBookingData({ ...newBookingData, amount: e.target.value })}
                  />
                  <small className="text-muted">GST, Commission, and Driver pay will be auto-calculated.</small>
                </CCol>
              </CRow>

              <CModalFooter>
                <CButton color="secondary" onClick={() => setCreateModalVisible(false)}>
                  Cancel
                </CButton>
                <CButton color="success" type="submit" className="text-white">
                  Confirm Booking
                </CButton>
              </CModalFooter>
            </CForm>
          </CModalBody>
        </CModal>
      )}
    </>
  );
};

export default Bookings;
