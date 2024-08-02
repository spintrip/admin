import React, { useState, useEffect } from 'react';
import { createFeature, getFeatures, deleteFeatures } from '../../../api/feature';
import {
  CInputGroup,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButton,
  CForm,
  CFormLabel,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormSelect
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import '../../../scss/blog.css';

const Features = () => {
  const [visible, setVisible] = useState(false);
  const [features, setFeatures] = useState([]);
  const [selectedFeatureName, setSelectedFeatureName] = useState('');
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeatureData();
  }, []);

  const fetchFeatureData = async () => {
    try {
        if (!token) {
            console.log('No token Found');
            navigate('/login');
          }
      const data = await getFeatures();
      setFeatures(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFeatureSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFeature(selectedFeatureName);
      fetchFeatureData();
      setSelectedFeatureName('');
      setVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFeatureDelete = async (id) => {
    try {
      await deleteFeatures(id);
      fetchFeatureData();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className='container-fluid px-4 d-flex align-items-center '>
        <CButton className="fw-bolder bg-light text-black mx-2" onClick={() => setVisible(true)}>Create</CButton>
      </div>

      <div className="mt-4">
        <CTable hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              <CTableHeaderCell scope="col">Feature Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {features.map((feature, index) => (
              <CTableRow key={feature.id}>
                <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                <CTableDataCell>{feature.featureName}</CTableDataCell>
                <CTableDataCell>{new Date(feature.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{new Date(feature.updatedAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="danger" size="sm" onClick={() => handleFeatureDelete(feature.id)}>Delete</CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      {/* Feature Creation Modal */}
      <CModal visible={visible} onClose={() => setVisible(false)} alignment="center" size="lg">
        <CModalHeader>
          <CModalTitle>Create Feature</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleFeatureSubmit}>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Select Feature</CFormLabel>
              <CFormSelect 
                value={selectedFeatureName} 
                onChange={(e) => setSelectedFeatureName(e.target.value)} 
                required
              >
                <option value="">Choose...</option>
                <option value="cleaning">Cleaning</option>
                <option value="pick/up">Pick/Up</option>
              </CFormSelect>
            </CInputGroup>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
              <CButton color="primary" type="submit">Save changes</CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
    </>
  );
};

export default Features;
