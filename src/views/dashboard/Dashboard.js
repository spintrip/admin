import React from 'react'
import classNames from 'classnames'

import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCloudDownload,
  cilPeople,
  cilUser,
} from '@coreui/icons'

import { getBooking, updateBooking, createBooking } from '../../api/booking'
import { fetchDrivers } from '../../api/driver'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Autocomplete } from '@react-google-maps/api'
import { Google_Maps_Api_key } from '../../env'
import { 
  CModal, 
  CModalHeader, 
  CModalTitle, 
  CModalBody, 
  CForm, 
  CFormInput, 
  CFormLabel, 
  CFormSelect, 
  CButton as CBtn,
  CModalFooter
} from '@coreui/react'
import toast from 'react-hot-toast'

const LIBRARIES = ['places'];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
};

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import '../../scss/booking.css'
import { fetchUsers } from '../../api/user'

const Dashboard = () => {
  const [recentUsers, setRecentUsers] = React.useState([])
  const role = localStorage.getItem('adminRole') || 'SUPER_ADMIN'

  const [requestedBookings, setRequestedBookings] = React.useState([])
  const [allBookings, setAllBookings] = React.useState([])
  const [drivers, setDrivers] = React.useState([])
  const { isLoaded } = useJsApiLoader({ 
    id: 'google-map-script', 
    googleMapsApiKey: Google_Maps_Api_key,
    libraries: LIBRARIES
  });
  const [createModalVisible, setCreateModalVisible] = React.useState(false)
  const [newBookingData, setNewBookingData] = React.useState({
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
  const [pickupAutocomplete, setPickupAutocomplete] = React.useState(null);
  const [dropAutocomplete, setDropAutocomplete] = React.useState(null);

  const [mapModalVisible, setMapModalVisible] = React.useState(false)
  const [activeDriverWindow, setActiveDriverWindow] = React.useState(null)
  const [bookingById, setBookingById] = React.useState(null)
  const [trackerActiveDriver, setTrackerActiveDriver] = React.useState(null)
  const [citySearch, setCitySearch] = React.useState('')
  const [mapCenter, setMapCenter] = React.useState({ lat: 20.5937, lng: 78.9629 })
  const [mapZoom, setMapZoom] = React.useState(5)
  const defaultCenter = { lat: 20.5937, lng: 78.9629 }

  const fetchDashboardData = async () => {
    try {
      const [data, driversData] = await Promise.all([getBooking(), fetchDrivers()]);
      setDrivers(driversData || []);
      setAllBookings(data || []);
      const pending = (data || []).filter(b => (b.status === 5 || b.status === "pending") && b.isCab);
      pending.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequestedBookings(pending);
    } catch (err) {
      console.error('Dashboard Fetch Error', err);
    }
  }

  React.useEffect(() => {
    fetchDashboardData();
  }, [])

  const handleAssignDriver = async (driverId) => {
    try {
      const selectedDriver = drivers.find(d => d.id === driverId);
      // Backend includes Cab model which has vehicleid
      const vehicleId = selectedDriver?.Cab?.vehicleid || selectedDriver?.vehicleId;

      await updateBooking(bookingById.Bookingid, { 
        driverid: driverId, 
        vehicleid: vehicleId,
        status: 1 
      });
      setMapModalVisible(false);
      setActiveDriverWindow(null);
      setBookingById(null);
      await fetchDashboardData();
    } catch (error) {
      console.error(error);
    }
  }

  React.useEffect(() => {
    if (role === 'SUPER_ADMIN') {
      const getRecentUsers = async () => {
        try {
          const users = await fetchUsers()
          // Sort by newest and take top 5
          const sortedUsers = (users || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          setRecentUsers(sortedUsers.slice(0, 5))
        } catch (error) {
          console.error('Failed to fetch recent users for dashboard:', error)
        }
      }
      getRecentUsers()
    }
  }, [role])

  const handleCitySearch = () => {
    if (!citySearch || !isLoaded) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: citySearch }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const { lat, lng } = results[0].geometry.location;
        setMapCenter({ lat: lat(), lng: lng() });
        setMapZoom(12);
      } else {
        alert('City not found: ' + status);
      }
    });
  }

  const handleCreateBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBooking(newBookingData);
      toast.success("Booking created successfully!");
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
      fetchDashboardData();
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking.");
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

  const getDriverMarkerIcon = (driver) => {
    // Base64 SVGs for reliability
    const carIcons = {
        red: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjZmYwMDAwIiBkPSJNMTguOTIgNi4wMUMxOC43MiA1LjQyIDE4LjE2IDUgMTcuNSA1aC0xMWMtLjY2IDAtMS4yMS40Mi0xLjQyIDEuMDFMMyAxMnY4YzAgLjU1LjQ1IDEgMSAxaDFjLjU1IDAgMS0uNDUgMS0xdi0xaDEydjFjMCAuNTUuNDUgMSAxIDFoMWMuNTUgMCAxLS40NSAxLTF2LThsLTIuMDgtNS45OXpNNi41IDE2Yy0uODMgMC0xLjUtLjY3LTEuNS0xLjVTNS42NyAxMyA2LjUgMTNzMS41LjY3IDEuNSAxLjVTNy4zMyAxNiA2LjUgMTZ6bTExIDBjLS44MyAwLTEuNS0uNjctMS41LTEuNXMuNjctMS41IDEuNS0xLjVzMS41LjY3IDEuNSAxLjVzLS42NyAxLjUtMS41IDEuNXpNNSAxMWwxLjUtNC41aDExTDE5IDExSDV6Ii8+PC9zdmc+',
        orange: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjZmZhNTAwIiBkPSJNMTguOTIgNi4wMUMxOC43MiA1LjQyIDE4LjE2IDUgMTcuNSA1aC0xMWMtLjY2IDAtMS4yMS40Mi0xLjQyIDEuMDFMMyAxMnY4YzAgLjU1LjQ1IDEgMSAxaDFjLjU1IDAgMS0uNDUgMS0xdi0xaDEydjFjMCAuNTUuNDUgMSAxIDFoMWMuNTUgMCAxLS40NSAxLTF2LThsLTIuMDgtNS45OXpNNi41IDE2Yy0uODMgMC0xLjUtLjY3LTEuNS0xLjVTNS42NyAxMyA2LjUgMTNzMS41LjY3IDEuNSAxLjVTNy4zMyAxNiA2LjUgMTZ6bTExIDBjLS44MyAwLTEuNS0uNjctMS41LTEuNXMuNjctMS41IDEuNS0xLjVzMS41LjY3IDEuNSAxLjVzLS42NyAxLjUtMS41IDEuNXpNNSAxMWwxLjUtNC41aDExTDE5IDExSDV6Ii8+PC9zdmc+',
        green: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjMDBmZjAwIiBkPSJNMTguOTIgNi4wMUMxOC43MiA1LjQyIDE4LjE2IDUgMTcuNSA1aC0xMWMtLjY2IDAtMS4yMS40Mi0xLjQyIDEuMDFMMyAxMnY4YzAgLjU1LjQ1IDEgMSAxaDFjLjU1IDAgMS0uNDUgMS0xdi0xaDEydjFjMCAuNTUuNDUgMSAxIDFoMWMuNTUgMCAxLS40NSAxLTF2LThsLTIuMDgtNS45OXpNNi41IDE2Yy0uODMgMC0xLjUtLjY3LTEuNS0xLjVTNS42NyAxMyA2LjUgMTNzMS41LjY3IDEuNSAxLjVTNy4zMyAxNiA2LjUgMTZ6bTExIDBjLS44MyAwLTEuNS0uNjctMS41LTEuNXMuNjctMS41IDEuNS0xLjVzMS41LjY3IDEuNSAxLjVzLS42NyAxLjUtMS41IDEuNXpNNSAxMWwxLjUtNC41aDExTDE5IDExSDV6Ii8+PC9zdmc+'
    };

    if (!driver.isActive) {
        return carIcons.red;
    }
    
    const isBusy = allBookings.some(b => 
        (b.driverid === driver.id || b.driverId === driver.id) && 
        (b.status === 1 || b.status === "accepted" || b.status === "started" || b.status === "active")
    );

    if (isBusy) {
        return carIcons.orange;
    }

    return carIcons.green;
  }
  return (
    <div className='container-fluid'>
      <WidgetsDropdown className="mb-4" />
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Active Requested Bookings</strong>
              <CButton color="success" size="sm" className="text-white" onClick={() => setCreateModalVisible(true)}>
                + New Booking
              </CButton>
            </CCardHeader>
            <CCardBody className="p-0">
              <CTable align="middle" className="mb-0" hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Booking ID</CTableHeaderCell>
                    <CTableHeaderCell>Customer</CTableHeaderCell>
                    <CTableHeaderCell>Pick-Up</CTableHeaderCell>
                    <CTableHeaderCell>Drop-Off</CTableHeaderCell>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                    <CTableHeaderCell>Date & Time</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {requestedBookings.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>
                        <div className="text-truncate" style={{ maxWidth: '150px' }}>{item.Bookingid || 'N/A'}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>{item.customerName || item.id || 'N/A'}</div>
                        <div className="small text-body-secondary">{item.customerPhone || 'N/A'}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>{item.pickUpLocation || 'N/A'}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>{item.dropOffLocation || 'N/A'}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="info" className="text-capitalize">
                          {item.bookingType || 'Local'}
                          {item.bookingType === 'Outstation' && ` (${item.days || 1}d, ${item.isRoundTrip ? 'RT' : 'OW'})`}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>{item.pointAToBDate || 'N/A'}</div>
                        <div className="small text-body-secondary">{item.pointAToBTime || 'N/A'}</div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {item.pickUpLat ? (
                          <CButton color="info" size="sm" className="text-white" onClick={() => { setBookingById(item); setMapModalVisible(true); }}>
                            Assign via Map
                          </CButton>
                        ) : (
                          <span className="text-muted small">No GPS</span>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {requestedBookings.length === 0 && (
                    <CTableRow>
                      <CTableDataCell colSpan="6" className="text-center">
                        No requested cab bookings pending assignment.
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Live Driver Tracking Map</strong>
              <div className="d-flex gap-2">
                <input 
                  type="text" 
                  className="form-control form-control-sm" 
                  placeholder="Enter city..." 
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCitySearch()}
                  style={{ width: '200px' }}
                />
                <CButton color="primary" size="sm" onClick={handleCitySearch}>
                  Search
                </CButton>
                <CButton color="secondary" size="sm" onClick={() => { setMapCenter(defaultCenter); setMapZoom(5); setCitySearch(''); }}>
                  Reset
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody style={{ height: '450px', padding: 0 }}>
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  zoom={mapZoom}
                  center={mapCenter}
                >
                  {(() => {
                    const seenIds = new Set();
                    return drivers
                      .filter(d => d.latitude !== null && d.longitude !== null)
                      .filter(d => {
                        if (seenIds.has(d.id)) return false;
                        seenIds.add(d.id);
                        return true;
                      })
                      .map((driver) => (
                        <Marker
                          key={driver.id}
                          position={{ lat: parseFloat(driver.latitude), lng: parseFloat(driver.longitude) }}
                      icon={{
                        url: getDriverMarkerIcon(driver),
                        scaledSize: new window.google.maps.Size(40, 40)
                      }}
                      onClick={() => setTrackerActiveDriver(driver)}
                    >
                      {trackerActiveDriver?.id === driver.id && (
                        <InfoWindow onCloseClick={() => setTrackerActiveDriver(null)}>
                          <div style={{ color: '#000', padding: '10px', minWidth: '150px', backgroundColor: '#fff' }}>
                            <h6 className='m-0 p-0 mb-1 fw-bold' style={{ color: '#000' }}>{driver.name || 'Unknown Driver'}</h6>
                            <p className='m-0 p-0 mb-1 fw-bold' style={{ color: '#d32f2f' }}>
                                Phone: {driver.phone || driver.phoneNumber || driver.User?.phone || driver.User?.phoneNumber || 'N/A'}
                            </p>
                            <p className='m-0 p-0 small' style={{ color: '#333' }}>
                                Status: <span className="fw-bold">{driver.isActive ? (allBookings.some(b => (b.driverid === driver.id || b.driverId === driver.id) && (b.status === 1 || b.status === "accepted" || b.status === "started" || b.status === "active")) ? 'In Booking' : 'Active') : 'Inactive'}</span>
                            </p>
                            {driver.updatedAt && (
                                <p className='m-0 p-0 mt-1 small' style={{ color: '#666' }}>
                                    Last Updated: {new Date(driver.updatedAt).toLocaleString()}
                                </p>
                            )}
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                    ));
                  })()}
                </GoogleMap>
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <span>Loading Map Tracker...</span>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="bookings" className="card-title mb-0">
                Bookings
              </h4>
              <div className="small text-body-secondary">January - July 2023</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" className="float-end">
                <CIcon icon={cilCloudDownload} />
              </CButton>
              <CButtonGroup className="float-end me-3">
                {['Day', 'Month', 'Year'].map((value) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    
                  >
                    {value}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>
          <MainChart />
        </CCardBody>
      </CCard>

      {role === 'SUPER_ADMIN' && (
        <CRow>
          <CCol xs>
            <CCard className="mb-4">
              <CCardHeader>
                <strong>Recent Users</strong>
              </CCardHeader>
              <CCardBody className="p-0">
                <CTable align="middle" className="mb-0" hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell className="text-center">
                        <CIcon icon={cilPeople} />
                      </CTableHeaderCell>
                      <CTableHeaderCell>User</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Role</CTableHeaderCell>
                      <CTableHeaderCell>Email</CTableHeaderCell>
                      <CTableHeaderCell>Joined</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {recentUsers.map((item, index) => (
                      <CTableRow v-for="item in tableItems" key={index}>
                        <CTableDataCell className="text-center">
                          <CAvatar
                            size="md"
                            color={item.profilePic ? '' : 'primary'}
                            src={item.profilePic ? item.profilePic : undefined}
                            textColor="white"
                          >
                            {!item.profilePic && <CIcon icon={cilUser} />}
                          </CAvatar>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{item.name || 'N/A'}</div>
                          <div className="small text-body-secondary text-nowrap">
                            <span>{item.phoneNumber || 'N/A'}</span>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          {item.role || 'User'}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="text-truncate" style={{ maxWidth: '200px' }}>
                            {item.email || '-'}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                          <div className="small text-body-secondary text-nowrap">
                            {new Date(item.createdAt).toLocaleTimeString()}
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                    {recentUsers.length === 0 && (
                      <CTableRow>
                        <CTableDataCell colSpan="5" className="text-center">
                          No recent users found.
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
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
                  <Marker key={driver.id} position={{ lat: parseFloat(driver.latitude), lng: parseFloat(driver.longitude) }} icon={{ url: "http://maps.google.com/mapfiles/kml/shapes/cabs.png", scaledSize: new window.google.maps.Size(32, 32) }} onClick={() => setActiveDriverWindow(driver.id)}>
                    {activeDriverWindow === driver.id && (
                      <InfoWindow onCloseClick={() => setActiveDriverWindow(null)}>
                        <div style={{ color: '#000', padding: '10px', minWidth: '150px', backgroundColor: '#fff' }}>
                          <h6 className='m-0 p-0 mb-1 fw-bold' style={{ color: '#000' }}>{driver.name || 'Unknown Driver'}</h6>
                          <p className='m-0 p-0 mb-1 fw-bold' style={{ color: '#d32f2f' }}>
                                Phone: {driver.phone || driver.phoneNumber || driver.User?.phone || driver.User?.phoneNumber || 'N/A'}
                          </p>
                          <p className='m-0 p-0 small' style={{ color: '#333' }}>Distance: <span className="fw-bold">{dist ? dist + ' km' : 'Unknown'}</span></p>
                          <CButton size="sm" color="info" className="text-white mt-2 w-100" onClick={() => handleAssignDriver(driver.id)}>
                            Assign Driver
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
          <CForm onSubmit={handleCreateBookingSubmit}>
            <CModalBody>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Customer Phone</CFormLabel>
                  <CFormInput 
                    required 
                    type="tel" 
                    placeholder="e.g. 9988776655" 
                    value={newBookingData.customerPhone}
                    onChange={(e) => setNewBookingData({ ...newBookingData, customerPhone: e.target.value })}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Customer Name (Optional)</CFormLabel>
                  <CFormInput 
                    type="text" 
                    placeholder="Guest Name" 
                    value={newBookingData.customerName}
                    onChange={(e) => setNewBookingData({ ...newBookingData, customerName: e.target.value })}
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Cab Type</CFormLabel>
                  <CFormSelect 
                    value={newBookingData.cabType}
                    onChange={(e) => setNewBookingData({ ...newBookingData, cabType: e.target.value })}
                  >
                    <option value="mini eco">Mini Eco</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="12 seater">12 Seater</option>
                    <option value="luxury">Luxury</option>
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Type of Trip</CFormLabel>
                  <CFormSelect 
                    value={newBookingData.bookingType}
                    onChange={(e) => setNewBookingData({ ...newBookingData, bookingType: e.target.value })}
                  >
                    <option value="Local">Local</option>
                    <option value="Daily">Daily</option>
                    <option value="Rentals">Rentals</option>
                    <option value="Outstation">Outstation</option>
                    <option value="Airport">Airport</option>
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
                <CCol md={4}>
                  <CFormLabel>Date</CFormLabel>
                  <CFormInput 
                    required 
                    type="date" 
                    value={newBookingData.date}
                    onChange={(e) => setNewBookingData({ ...newBookingData, date: e.target.value })}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Time</CFormLabel>
                  <CFormInput 
                    required 
                    type="time" 
                    value={newBookingData.time}
                    onChange={(e) => setNewBookingData({ ...newBookingData, time: e.target.value })}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Total Fare (₹)</CFormLabel>
                  <CFormInput 
                    required 
                    type="number" 
                    placeholder="Fixed Price"
                    value={newBookingData.amount}
                    onChange={(e) => setNewBookingData({ ...newBookingData, amount: e.target.value })}
                  />
                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter>
              <CBtn color="secondary" onClick={() => setCreateModalVisible(false)}>Cancel</CBtn>
              <CBtn color="success" type="submit" className="text-white">Confirm Booking</CBtn>
            </CModalFooter>
          </CForm>
        </CModal>
      )}
    </div>
  )
}

export default Dashboard
