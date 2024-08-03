import React, { useEffect, useState } from 'react';
import { getCars } from '../../../api/car';
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
} from '@coreui/react';

const Cars = () => {
  const [carData, setCarData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;
  const visiblePages = 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCars();
        setCarData(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const totalPages = Math.ceil(carData.length / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedCars = carData.slice((currentPage - 1) * limit, currentPage * limit);

  const getVisiblePages = () => {
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  return (
    <>
      <DocsExample href="components/table#hoverable-rows">
        <CTable color="dark" hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              <CTableHeaderCell scope="col">Car Model</CTableHeaderCell>
              <CTableHeaderCell scope="col">Type</CTableHeaderCell>
              <CTableHeaderCell scope="col">Brand</CTableHeaderCell>
              <CTableHeaderCell scope="col">Chassis No</CTableHeaderCell>
              <CTableHeaderCell scope="col">RC Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Engine Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Registration Year</CTableHeaderCell>
              <CTableHeaderCell scope="col">Body Type</CTableHeaderCell>
              <CTableHeaderCell scope="col">Car ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Rating</CTableHeaderCell>
              <CTableHeaderCell scope="col">Host ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
          {displayedCars.map((car, index) => (
            <CTableRow key={car.carid}>
              <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
              <CTableDataCell>{car.carmodel}</CTableDataCell>
              <CTableDataCell>{car.type}</CTableDataCell>
              <CTableDataCell>{car.brand}</CTableDataCell>
              <CTableDataCell>
                {car.chassisno && car.chassisno.length > 10 ? `${car.chassisno.slice(0, 10)}...` : car.chassisno}
              </CTableDataCell>
              <CTableDataCell>{car.Rcnumber}</CTableDataCell>
              <CTableDataCell>
                {car.Enginenumber && car.Enginenumber.length > 10 ? `${car.Enginenumber.slice(0, 10)}...` : car.Enginenumber}
              </CTableDataCell>
              <CTableDataCell>{car.Registrationyear}</CTableDataCell>
              <CTableDataCell>{car.bodytype}</CTableDataCell>
              <CTableDataCell>
                {car.carid && car.carid.length > 10 ? `${car.carid.slice(0, 10)}...` : car.carid}
              </CTableDataCell>
              <CTableDataCell>
                {car.rating !== null && car.rating !== undefined ? car.rating.toFixed(2) : 'N/A'}
              </CTableDataCell>
              <CTableDataCell>
                {car.hostId ? (car.hostId.length > 10 ? `${car.hostId.slice(0, 10)}...` : car.hostId) : 'N/A'}
              </CTableDataCell>
              <CTableDataCell>{new Date(car.createdAt).toLocaleString()}</CTableDataCell>
              <CTableDataCell>{new Date(car.updatedAt).toLocaleString()}</CTableDataCell>
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
    </>
  );
};

export default Cars;
