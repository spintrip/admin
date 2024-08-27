import React, { useEffect, useState } from 'react';
import { getBooking, fetchBookingById, updateBooking } from '../../../api/booking';

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
  CRow
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
const columns = tableHeaders.map(header => ({
  name: header.label,
  selector: row => row[header.value],
  sortable: false,
}));

const Bookings = () => {
  const [bookingData, setBookingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [bookingById, setBookingById] = useState(null);
  const [originalBookingData, setOriginalBookingData] = useState(null);
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
      if (!searchInput) {
        setFilteredData(bookingData);
      } else {
        const filtered = bookingData.filter((booking) => {
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
  }, [searchInput, selectedSearchOption, bookingData]);

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
      <div className='container-fluid px-4 d-flex align-items-center justify-content-end'>
        <div className='crud-group d-flex mx-2'>
          
        </div>
        <div>
          <CInputGroup className="mx-2">
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
                  data={displayedBookings}
                  customStyles={customStyles}
                  responsive={true}
                  title={'Bookings Table'}
                  highlightOnHover={true}
                  pointerOnHover={true}
                  fixedHeader={true}
                  onRowClicked={(booking)=>handleBookingByIdClick(booking.Bookingid)}
          />
        </div>
      {/* <DocsExample href="components/table#hoverable-rows">
        <CTable color="lightdark border rounded-md booking-table" hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              {tableHeaders.map((header, index) => (
                <CTableHeaderCell key={index} scope="col">{header.label}</CTableHeaderCell>
              ))}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {displayedBookings.map((booking, index) => (
              <CTableRow key={booking.Bookingid} onClick={() => handleBookingByIdClick(booking.Bookingid)}>
                <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
                <CTableDataCell>{booking.Bookingid ? booking.Bookingid : 'N/A'}</CTableDataCell>
                <CTableDataCell>{booking.carid}</CTableDataCell>
                <CTableDataCell>{booking.status}</CTableDataCell>
                <CTableDataCell>{booking.amount}</CTableDataCell>
                <CTableDataCell>{booking.GSTAmount}</CTableDataCell>
                <CTableDataCell>{booking.totalUserAmount}</CTableDataCell>
                <CTableDataCell>{booking.TDSAmount}</CTableDataCell>
                <CTableDataCell>{booking.totalHostAmount}</CTableDataCell>
                <CTableDataCell>{booking.startTripDate}</CTableDataCell>
                <CTableDataCell>{booking.endTripDate}</CTableDataCell>
                <CTableDataCell>{booking.startTripTime}</CTableDataCell>
                <CTableDataCell>{booking.endTripTime}</CTableDataCell>
                <CTableDataCell>{new Date(booking.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{new Date(booking.updatedAt).toLocaleString()}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </DocsExample> */}

      {/* <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <CPagination aria-label="Page navigation example">
          <CPaginationItem
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </CPaginationItem>
          {getVisiblePages().map((page) => (
            <CPaginationItem
              key={page}
              active={page === currentPage}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </CPaginationItem>
          ))}
          <CPaginationItem
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </CPaginationItem>
        </CPagination>
      </div> */}

      {/* Booking Details Modal */}
      {bookingById && (
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg" scrollable>
          <CModalHeader>
            <CModalTitle>Booking Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow>
              <CCol className='booking-modal'>
                <p><strong>Booking ID:</strong> {bookingById.Bookingid || 'N/A'}</p>
                <p><strong>Car ID:</strong> {bookingById.carid || 'N/A'}</p>
                <p><strong>Status:</strong> {bookingById.status || 'N/A'}</p>
                <p><strong>Amount:</strong> {bookingById.amount || 'N/A'}</p>
                <p><strong>GST Amount:</strong> {bookingById.GSTAmount || 'N/A'}</p>
                <p><strong>Total User Amount:</strong> {bookingById.totalUserAmount || 'N/A'}</p>
                <p><strong>TDS Amount:</strong> {bookingById.TDSAmount || 'N/A'}</p>
                <p><strong>Total Host Amount:</strong> {bookingById.totalHostAmount || 'N/A'}</p>
                <p><strong>Start Trip Date:</strong> {bookingById.startTripDate || 'N/A'}</p>
                <p><strong>End Trip Date:</strong> {bookingById.endTripDate || 'N/A'}</p>
                <p><strong>Start Trip Time:</strong> {bookingById.startTripTime || 'N/A'}</p>
                <p><strong>End Trip Time:</strong> {bookingById.endTripTime || 'N/A'}</p>
                <p><strong>Created At:</strong> {new Date(bookingById.createdAt).toLocaleString()}</p>
                <p><strong>Updated At:</strong> {new Date(bookingById.updatedAt).toLocaleString()}</p>
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
