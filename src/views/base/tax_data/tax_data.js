// UpdateTaxModal.js
import React, { useState } from 'react';
import { createTax } from '../../../api/tax';
import {
  CInputGroup,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButton,
  CForm,
  CFormLabel,
} from '@coreui/react';

const UpdateTaxModal = () => {
  const [taxModalVisible, setTaxModalVisible] = useState(false);
  const [taxFormValues, setTaxFormValues] = useState({
    GST: '',
    TDS: '',
    HostGST: '',
    Commission: ''
  });

  const handleTaxInputChange = (e) => {
    const { name, value } = e.target;
    setTaxFormValues({
      ...taxFormValues,
      [name]: value,
    });
  };

  const handleTaxSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTax(taxFormValues);
      setTaxModalVisible(false);
      setTaxFormValues({
        GST: '',
        TDS: '',
        HostGST: '',
        Commission: ''
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className='container-fluid px-4 d-flex align-items-center'>
        <CButton className="fw-bolder bg-light text-black mx-2" onClick={() => setTaxModalVisible(true)}>Update Tax</CButton>
      </div>

      <CModal visible={taxModalVisible} onClose={() => setTaxModalVisible(false)} alignment="center" size="lg">
        <CModalHeader>
          <CModalTitle>Update Tax Information</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleTaxSubmit}>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>GST</CFormLabel>
              <CFormInput type="text" name="GST" value={taxFormValues.GST} onChange={handleTaxInputChange} required />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>TDS</CFormLabel>
              <CFormInput type="text" name="TDS" value={taxFormValues.TDS} onChange={handleTaxInputChange} required />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>HostGST</CFormLabel>
              <CFormInput type="text" name="HostGST" value={taxFormValues.HostGST} onChange={handleTaxInputChange} required />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Commission</CFormLabel>
              <CFormInput type="text" name="Commission" value={taxFormValues.Commission} onChange={handleTaxInputChange} required />
            </CInputGroup>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setTaxModalVisible(false)}>Close</CButton>
              <CButton color="primary" type="submit">Upload</CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
    </>
  );
};

export default UpdateTaxModal;
