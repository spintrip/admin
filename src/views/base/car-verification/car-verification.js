import React, { useEffect, useState } from 'react';
import { getCarVerififcation } from '../../../api/car';
import DocsExample from '../../../components/DocsExample';
import { useNavigate } from 'react-router-dom';
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem,
  CImage,
} from '@coreui/react';

const CarProfiles = () => {
  const [carProfilesData, setCarProfilesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;
  const visiblePages = 3;
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!token) {
      console.log('No token Found');
      navigate('/login');
    }
    try {
      const data = await getCarVerififcation();
      setCarProfilesData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPages = Math.ceil((carProfilesData?.length || 0) / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedCarProfiles = (carProfilesData || []).slice((currentPage - 1) * limit, currentPage * limit);

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
              <CTableHeaderCell scope="col">Car ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Horse Power</CTableHeaderCell>
              <CTableHeaderCell scope="col">AC</CTableHeaderCell>
              <CTableHeaderCell scope="col">Music System</CTableHeaderCell>
              <CTableHeaderCell scope="col">Auto Window</CTableHeaderCell>
              <CTableHeaderCell scope="col">Sunroof</CTableHeaderCell>
              <CTableHeaderCell scope="col">Touchscreen</CTableHeaderCell>
              <CTableHeaderCell scope="col">Images</CTableHeaderCell>
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {displayedCarProfiles.map((profile, index) => (
              <CTableRow key={profile.carid}>
                <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
                <CTableDataCell>{profile.carid.length > 10 ? `${profile.carid.slice(0, 10)}...` : profile.carid}</CTableDataCell>
                <CTableDataCell>{profile.HorsePower}</CTableDataCell>
                <CTableDataCell>{profile.AC ? 'Yes' : 'No'}</CTableDataCell>
                <CTableDataCell>{profile.Musicsystem ? 'Yes' : 'No'}</CTableDataCell>
                <CTableDataCell>{profile.Autowindow ? 'Yes' : 'No'}</CTableDataCell>
                <CTableDataCell>{profile.Sunroof ? 'Yes' : 'No'}</CTableDataCell>
                <CTableDataCell>{profile.Touchscreen ? 'Yes' : 'No'}</CTableDataCell>
                <CTableDataCell>
                  {profile.carimage1 && <CImage src={profile.carimage1} width={50} height={50} />}
                  {profile.carimage2 && <CImage src={profile.carimage2} width={50} height={50} />}
                </CTableDataCell>
                <CTableDataCell>{new Date(profile.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{new Date(profile.updatedAt).toLocaleString()}</CTableDataCell>
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

export default CarProfiles;
