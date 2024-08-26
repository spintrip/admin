import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { Google_Maps_Api_key } from '../../env';

const Map = React.memo(({ locations }) => {
  const containerStyle = {
    width: '100%',
    height: '500px',
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

    // Create and add the custom control button
    const controlButton = document.createElement('button');
    controlButton.style.backgroundColor = '#fff';
    controlButton.style.border = '2px solid #fff';
    controlButton.style.borderRadius = '3px';
    controlButton.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlButton.style.color = 'rgb(25,25,25)';
    controlButton.style.cursor = 'pointer';
    controlButton.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlButton.style.fontSize = '16px';
    controlButton.style.lineHeight = '38px';
    controlButton.style.margin = '8px 0 22px';
    controlButton.style.padding = '2 2px';
    controlButton.style.textAlign = 'center';
    controlButton.textContent = 'Center';
    controlButton.title = 'Click to recenter the map';
    controlButton.type = 'button';

    controlButton.addEventListener('click', () => {
      map.setCenter(center);
    });
    map.controls[window.google.maps.ControlPosition.TOP_CENTER].push(controlButton); // following code creates a new custom control and adds it to the map in the TOP_RIGHT position.
  }, [sortedLocations, center]);

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

      if (polylineRef.current) {
        polylineRef.current.setPath(sortedLocations.map(loc => ({ lat: loc.lat, lng: loc.lng })));
      }

      if (autoCenter && sortedLocations.length > 0) {
        mapRef.current.panTo(center);
      }
    }
  }, [sortedLocations, autoCenter, center]);

  return (
    <div>
      <LoadScript googleMapsApiKey={Google_Maps_Api_key}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={17} onLoad={onLoad} />
      </LoadScript>
    </div>
  );
});

export default Map;
