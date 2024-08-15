import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Google_Maps_Api_key } from '../../env';

const Map = React.memo(({ locations }) => {
  const containerStyle = {
    width: '100%',
    height: '800px',
  };

  const defaultCenter = {
    lat: 0,
    lng: 0,
  };

  const maxWaypoints = 21; // Maximum waypoints allowed in one segment

  // Sort locations by updatedAt to ensure proper order
  const sortedLocations = locations.sort(
    (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
  ); // Ascending order, oldest to newest

  const center = sortedLocations.length > 0
    ? {
        lat: sortedLocations[sortedLocations.length - 1].lat,
        lng: sortedLocations[sortedLocations.length - 1].lng,
      }
    : defaultCenter;

  const [directionsResponses, setDirectionsResponses] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);

  const calculateRouteSegment = useCallback((segmentLocations) => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps) {
        reject('Google Maps API is not loaded yet');
        return;
      }
  
      const directionsService = new window.google.maps.DirectionsService();
      const startLocation = {
        lat: segmentLocations[0].lat,
        lng: segmentLocations[0].lng,
      };
      const endLocation = {
        lat: segmentLocations[segmentLocations.length - 1].lat,
        lng: segmentLocations[segmentLocations.length - 1].lng,
      };
      const waypoints = segmentLocations.slice(1, -1).map(location => ({
        location: { lat: location.lat, lng: location.lng },
        stopover: true,
      }));
  
      directionsService.route(
        {
          origin: startLocation,
          destination: endLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
          waypoints: waypoints,
          optimizeWaypoints: true,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            resolve(result);
          } else {
            reject(`Directions request failed due to ${status}`);
          }
        }
      );
    });
  }, []);

  const calculateFullRoute = useCallback(async (locationsToCalculate) => {
    const segments = [];

    for (let i = 0; i < locationsToCalculate.length - 1; i += maxWaypoints) {
      const segmentLocations = locationsToCalculate.slice(i, i + maxWaypoints + 1);
      try {
        const segment = await calculateRouteSegment(segmentLocations);
        segments.push(segment);
      } catch (error) {
        console.error(error);
      }
    }

    setDirectionsResponses(segments);
  }, [calculateRouteSegment]);

  const appendNewLocation = useCallback(async () => {
    const newLocations = sortedLocations.slice(allLocations.length);
    if (newLocations.length === 0) return;

    const lastKnownLocation = allLocations[allLocations.length - 1];
    const segmentLocations = [lastKnownLocation, ...newLocations].slice(0, maxWaypoints + 1);

    try {
      const newSegment = await calculateRouteSegment(segmentLocations);
      setDirectionsResponses(prevResponses => [...prevResponses, newSegment]);
      setAllLocations(prevLocations => [...prevLocations, ...newLocations]); // Update state to include new locations
    } catch (error) {
      console.error(error);
    }
  }, [sortedLocations, allLocations, calculateRouteSegment]);

  const onLoad = useCallback(() => {
    setAllLocations(sortedLocations); // Set all locations initially
    setInitialLoad(false);
  }, [sortedLocations]);

  useEffect(() => {
    if (initialLoad && allLocations.length > 0) {
      calculateFullRoute(allLocations); // Initial calculation for the full route
    }
  }, [initialLoad, allLocations, calculateFullRoute]);

  useEffect(() => {
    if (!initialLoad && allLocations.length < sortedLocations.length) {
      appendNewLocation();
    }
  }, [sortedLocations, allLocations, appendNewLocation, initialLoad]);

  return (
    <LoadScript googleMapsApiKey={Google_Maps_Api_key}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={17} onLoad={onLoad}>
        {/* Start marker */}
        {allLocations.length > 0 && (
          <Marker
            position={{
              lat: allLocations[0].lat,
              lng: allLocations[0].lng,
            }}
            label="Start"
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png', // Green marker for start
            }}
          />
        )}

        {/* Latest marker */}
        {allLocations.length > 1 && (
          <Marker
            position={{
              lat: allLocations[allLocations.length - 1].lat,
              lng: allLocations[allLocations.length - 1].lng,
            }}
            label="Latest"
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png', // Red marker for the latest
            }}
          />
        )}

        {/* Render all segments */}
        {directionsResponses.map((response, index) => (
          <DirectionsRenderer key={index} directions={response}  suppressMarkers={true} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
});

export default Map;
