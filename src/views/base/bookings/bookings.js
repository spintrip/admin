import React, { useEffect, useState } from 'react';
import { getBooking } from '../../../api/booking';
import DocsExample from '../../../components/DocsExample';
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem,
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
  CButton
} from '@coreui/react';

const Bookings = () => {
  const [bookingData, setBookingData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('Booking ID');
  const [currentPage, setCurrentPage] = useState(1);
  const [visible, setVisible] = useState(false); // State for modal visibility
  const limit = 20;
  const visiblePages = 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBooking();
        setBookingData(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const totalPages = Math.ceil(bookingData.length / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedBookings = bookingData.slice((currentPage - 1) * limit, currentPage * limit);

  const getVisiblePages = () => {
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  const tableHeaders = [
    'Booking ID', 'Car ID', 'Status', 'Amount', 'GST Amount',
    'Total User Amount', 'TDS Amount', 'Total Host Amount',
    'Start Trip Date', 'End Trip Date', 'Start Trip Time', 'End Trip Time',
    'Created At', 'Updated At'
  ];

  return (
    <>
      {/* Top Bar Component */}
      <div className='container-fluid px-4 d-flex align-items-center justify-content-between'>
        <div className='crud-group d-flex mx-2'>
          <CButton className="fw-bolder bg-light text-black mx-2" onClick={() => setVisible(true)}>Create</CButton>
          <CButton className="fw-bolder bg-light text-black mx-2">Update</CButton>
        </div>
        <div>
          <CInputGroup className="mx-2">
            <CFormInput aria-label="Text input with dropdown button" placeholder='Search' />
            <CDropdown alignment="end" variant="input-group">
              <CDropdownToggle color="secondary" variant="outline">{selectedSearchOption}</CDropdownToggle>
              <CDropdownMenu>
                {tableHeaders.map((header, index) => (
                  <CDropdownItem key={index} onClick={() => setSelectedSearchOption(header)}>
                    {header}
                  </CDropdownItem>
                ))}
              </CDropdownMenu>
            </CDropdown>
          </CInputGroup>
        </div>
      </div>

      <DocsExample href="components/table#hoverable-rows">
        <CTable color="lightdark border rounded-md" hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              {tableHeaders.map((header, index) => (
                <CTableHeaderCell key={index} scope="col">{header}</CTableHeaderCell>
              ))}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {displayedBookings.map((booking, index) => (
              <CTableRow key={booking.Bookingid}>
                <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
                <CTableDataCell>{booking.Bookingid.length > 10 ? `${booking.Bookingid.slice(0, 10)}...` : booking.Bookingid}</CTableDataCell>
                <CTableDataCell>{booking.carid.length > 10 ? `${booking.carid.slice(0, 10)}...` : booking.carid}</CTableDataCell>
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
      </DocsExample>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
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
      </div>

      {/* Modal Component */}
      <CModal visible={visible} onClose={() => setVisible(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Create booking</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Content goes here.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary">Save changes</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Bookings;
