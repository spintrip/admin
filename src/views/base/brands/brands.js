import React, { useEffect, useState, useCallback } from 'react';
import { getBrand, putBrand, updateBrand } from '../../../api/brand';
import {
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


const columns = [
  
  {
    name: 'Type',
    selector: row => row.type ? row.type : '--', 
    sortable: true,
  },
  {
    name: 'Brand',
    selector: row => row.brand, 
    sortable: true,
  },
  
  {
    name: 'Brand Value',
    selector: row => row.brand_value,
    sortable: true,
  },
  {
    name: 'Base Price',
    selector: row => row.base_price, // Replace with the actual key for Base Price in your data
    sortable: true,
  },
  {
    name: 'Created At',
    selector: row => new Date(row.createdAt).toLocaleString(), // Converts to a readable date string
    sortable: true,
  },
  {
    name: 'Updated At',
    selector: row => new Date(row.updatedAt).toLocaleString(), // Converts to a readable date string
    sortable: true,
  },
];

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

  const fetchBrands = useCallback(async () => {
    try {
      const data = await getBrand();
      setBrands(data.brands);
    } catch (error) {
      console.log(error);
    }
  } ,[setBrands]);

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
  
  console.log('brands', brands)
  return (
    <div className="container-fluid">
      <div className='d-flex align-items-center justify-content-end w-full px-4'>
        <CButton color="primary" onClick={() => setModalVisible(true)}>
        Create Brand
        </CButton>
      </div>
     

      <div className='container-fluid h-fit-content mt-3 '>
          <DataTable
            columns={columns}
            data={brands}
            customStyles={customStyles}
            responsive={true}
            title={'Brands Table'}
            highlightOnHover={true}
            pointerOnHover={true}
            fixedHeader={true}
            onRowClicked={(brand)=>handleView(brand)}
          />
        </div>
      
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
