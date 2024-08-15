import React, { useEffect, useState } from 'react';
import { getBrand, putBrand, updateBrand } from '../../../api/brand';
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButton,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
} from '@coreui/react';

const Brand = () => {
  const [brands, setBrands] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBrand, setNewBrand] = useState({
    type: 'Compact suv',
    brand: '',
    carmodel: '',
    brand_value: '',
    base_price: '',
  });
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const data = await getBrand();
      setBrands(data.brands);
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBrand({
      ...newBrand,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      await putBrand({ data: [newBrand] });
      setModalVisible(false);
      fetchBrands();
    } catch (error) {
      console.log(error);
    }
  };
  const handleView = (brand) => {
    setSelectedBrand(brand);
    setUpdateModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const { id, brand_value, base_price } = selectedBrand;
      await updateBrand({ id, brand_value, base_price });
      setUpdateModalVisible(false);
      fetchBrands();
    } catch (error) {
      console.log(error);
    }
  };
  

  return (
    <div className="container-fluid">
      <CButton color="primary" onClick={() => setModalVisible(true)}>
        Create Brand
      </CButton>
      <CTable color="dark" hover className="mt-3">
        {brands.length === 0 ? (
          <CTableRow>
          <CTableDataCell colSpan="8" className="text-center">
            No brands available
          </CTableDataCell>
        </CTableRow>
        ) : (
        <>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Type</CTableHeaderCell>
            <CTableHeaderCell>Brand</CTableHeaderCell>
            <CTableHeaderCell>Car Model</CTableHeaderCell>
            <CTableHeaderCell>Brand Value</CTableHeaderCell>
            <CTableHeaderCell>Base Price</CTableHeaderCell>
            <CTableHeaderCell>Created At</CTableHeaderCell>
            <CTableHeaderCell>Updated At</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {brands.map((brand, index) => (
            <CTableRow key={brand.id} onClick={() => handleView(brand)}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{brand.type}</CTableDataCell>
              <CTableDataCell>{brand.brand}</CTableDataCell>
              <CTableDataCell>{brand.carmodel}</CTableDataCell>
              <CTableDataCell>{brand.brand_value}</CTableDataCell>
              <CTableDataCell>{brand.base_price}</CTableDataCell>
              <CTableDataCell>{new Date(brand.createdAt).toLocaleString()}</CTableDataCell>
              <CTableDataCell>{new Date(brand.updatedAt).toLocaleString()}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
        </>
        )}
      </CTable>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Create New Brand</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormSelect id="type" name="type" value={newBrand.type} onChange={handleInputChange}>
                <option value="MUV">Compact suv</option>
                <option value="MUV">MUV</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
              </CFormSelect>
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="brand">Brand</CFormLabel>
              <CFormInput id="brand" name="brand" value={newBrand.brand} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="carmodel">Car Model</CFormLabel>
              <CFormInput id="carmodel" name="carmodel" value={newBrand.carmodel} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="brand_value">Brand Value</CFormLabel>
              <CFormInput id="brand_value" name="brand_value" value={newBrand.brand_value} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="base_price">Base Price</CFormLabel>
              <CFormInput id="base_price" name="base_price" value={newBrand.base_price} onChange={handleInputChange} />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleSubmit}>Create</CButton>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancel</CButton>
        </CModalFooter>
      </CModal>
       <CModal visible={updateModalVisible} onClose={() => setUpdateModalVisible(false)}>
            <CModalHeader>
                <CModalTitle>Update Brand</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CForm>
                <div className="mb-3">
                    <CFormLabel htmlFor="brand_value">Brand Value</CFormLabel>
                    <CFormInput id="brand_value" name="brand_value" value={selectedBrand?.brand_value || ''} onChange={(e) => setSelectedBrand({ ...selectedBrand, brand_value: e.target.value })} />
                </div>
                <div className="mb-3">
                    <CFormLabel htmlFor="base_price">Base Price</CFormLabel>
                    <CFormInput id="base_price" name="base_price" value={selectedBrand?.base_price || ''} onChange={(e) => setSelectedBrand({ ...selectedBrand, base_price: e.target.value })} />
                </div>
                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton color="primary" onClick={() => handleUpdate()}>Update</CButton>
                <CButton color="secondary" onClick={() => setUpdateModalVisible(false)}>Cancel</CButton>
            </CModalFooter>
        </CModal>

    </div>
  );
};

export default Brand;
