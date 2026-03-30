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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCloudDownload,
  cilPeople,
  cilUser,
} from '@coreui/icons'

import { getBooking, updateBooking } from '../../api/booking'
import { fetchDrivers } from '../../api/driver'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { Google_Maps_Api_key } from '../../env'
import { CModal, CModalHeader, CModalTitle, CModalBody } from '@coreui/react'

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
import { fetchUsers } from '../../api/user'

const Dashboard = () => {
  const [recentUsers, setRecentUsers] = React.useState([])
  const role = localStorage.getItem('adminRole') || 'SUPER_ADMIN'

  const [requestedBookings, setRequestedBookings] = React.useState([])
  const [allBookings, setAllBookings] = React.useState([])
  const [drivers, setDrivers] = React.useState([])
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: Google_Maps_Api_key })
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
      await updateBooking(bookingById.Bookingid, { driverid: driverId, status: 1 });
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
            <CCardHeader>
              <strong>Active Requested Bookings</strong>
            </CCardHeader>
            <CCardBody>
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap text-body-secondary bg-body-tertiary">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary">Booking ID</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Customer</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Pick-Up</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Drop-Off</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Date & Time</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {requestedBookings.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>
                        <div className="text-truncate" style={{ maxWidth: '150px' }}>{item.Bookingid || 'N/A'}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>{item.id || 'N/A'}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>{item.pickUpLocation || 'N/A'}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>{item.dropOffLocation || 'N/A'}</div>
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
                  {drivers.filter(d => parseFloat(d.latitude) && parseFloat(d.longitude)).map((driver) => (
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
                  ))}
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
              <CCardBody>
                <CTable align="middle" className="mb-0 border" hover responsive>
                  <CTableHead className="text-nowrap text-body-secondary bg-body-tertiary">
                    <CTableRow>
                      <CTableHeaderCell className="bg-body-tertiary text-center">
                        <CIcon icon={cilPeople} />
                      </CTableHeaderCell>
                      <CTableHeaderCell className="bg-body-tertiary">User</CTableHeaderCell>
                      <CTableHeaderCell className="bg-body-tertiary text-center">Role</CTableHeaderCell>
                      <CTableHeaderCell className="bg-body-tertiary">Email</CTableHeaderCell>
                      <CTableHeaderCell className="bg-body-tertiary">Joined</CTableHeaderCell>
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
    </div>
  )
}

export default Dashboard
