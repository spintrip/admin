import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Google_Maps_Api_key } from '../../env';

const Map = ({ locations }) => {
  const containerStyle = {
    width: '100%',
    height: '400px'
  };

  const defaultCenter = {
    lat: 0,
    lng: 0 ,
  }

  const center = locations.length > 0 ? { lat : locations[0].lat , lng : locations[0].lng } : defaultCenter;

  return(
    <LoadScript googleMapsApiKey = {Google_Maps_Api_key}>
      <GoogleMap 
       mapContainerStyle = {containerStyle}
       center = {center}
       zoom = {30}
      >
        {locations.map((locations , index) => (
          <Marker
            key = {index}
            position= {{lat : locations.lat , lng : locations.lng}}
            label={location.label || `${index + 1}`}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  ) ;
};

export default Map;