import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { Google_Maps_Api_key } from '../../env';
import { CButton } from '@coreui/react';

const Map = React.memo(({ locations }) => {
  const containerStyle = {
    width: '100%',
    height: '800px',
  };

  const defaultCenter = {
    lat: 0,
    lng: 0,
  };

  const sortedLocations = locations.sort(
    (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
  );

  const [autoCenter, setAutoCenter] = useState(false);
  const mapRef = useRef(null);
  const markersRef = useRef({ start: null, latest: null });
  const polylineRef = useRef(null);

  const center = sortedLocations.length > 0
    ? {
        lat: sortedLocations[sortedLocations.length - 1].lat,
        lng: sortedLocations[sortedLocations.length - 1].lng,
      }
    : defaultCenter;

  const onLoad = useCallback((map) => {
    mapRef.current = map;

    // Initialize start marker
    if (sortedLocations.length > 0) {
      markersRef.current.start = new window.google.maps.Marker({
        position: { lat: sortedLocations[0].lat, lng: sortedLocations[0].lng },
        map,
        label: "Start",
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      });
    }

    // Initialize latest marker
    if (sortedLocations.length > 1) {
      markersRef.current.latest = new window.google.maps.Marker({
        position: { lat: sortedLocations[sortedLocations.length - 1].lat, lng: sortedLocations[sortedLocations.length - 1].lng },
        map,
        label: "Latest",
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      });
    }

    // Initialize polyline
    polylineRef.current = new window.google.maps.Polyline({
      path: sortedLocations.map(loc => ({ lat: loc.lat, lng: loc.lng })),
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map,
    });
  }, [sortedLocations]);

  useEffect(() => {
    if (mapRef.current) {
      // Update markers
      if (markersRef.current.start) {
        markersRef.current.start.setPosition({
          lat: sortedLocations[0].lat,
          lng: sortedLocations[0].lng,
        });
      }

      if (markersRef.current.latest) {
        markersRef.current.latest.setPosition({
          lat: sortedLocations[sortedLocations.length - 1].lat,
          lng: sortedLocations[sortedLocations.length - 1].lng,
        });
      }

      // Update polyline
      if (polylineRef.current) {
        polylineRef.current.setPath(sortedLocations.map(loc => ({ lat: loc.lat, lng: loc.lng })));
      }

      // Handle auto-centering
      if (autoCenter && sortedLocations.length > 0) {
        mapRef.current.panTo(center);
      }
    }
  }, [sortedLocations, autoCenter, center]);

  const handleCenter = () => {
    if (sortedLocations.length > 0) {
      mapRef.current.panTo(center);
      setAutoCenter(true);
    }
  };

  return (
    <div>
      <CButton className='mx-2 py-2' color="secondary" onClick={handleCenter}>
        Center
      </CButton>

      <LoadScript googleMapsApiKey={Google_Maps_Api_key}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={17} onLoad={onLoad} />
      </LoadScript>
    </div>
  );
});

export default Map;
