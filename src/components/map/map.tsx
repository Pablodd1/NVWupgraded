import React, { useState, useEffect } from 'react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';

interface MapProps {
  userLocation: GeolocationCoordinates;
  wineryLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

const Map = ({ userLocation, wineryLocation }: MapProps) => {
  const [openWin, setOpenWin] = useState<boolean>(true);

  // Center logic
  const center = {
    lat: wineryLocation.latitude,
    lng: wineryLocation.longitude
  };

  // Convert user location if available
  const userPos = userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : null;

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden mt-4">
      {/* 
        APIProvider handles the loading of the Google Maps script.
        Ensure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set in your .env.local
      */}
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
        <GoogleMap
          defaultCenter={center}
          defaultZoom={12}
          mapId="DEMO_MAP_ID" // Required for AdvancedMarker, can be replaced with a real Map ID from Google Console
          className="w-full h-full"
        >
          {/* Winery Marker */}
          <AdvancedMarker position={center} onClick={() => setOpenWin(true)}>
            <Pin background={'#722F37'} borderColor={'#4a1e23'} glyphColor={'white'} />
          </AdvancedMarker>

          {openWin && (
            <InfoWindow position={center} onCloseClick={() => setOpenWin(false)}>
              <div className="text-black p-2">
                <h3 className="font-bold text-sm">Winery Location</h3>
                {wineryLocation.address && <p className="text-xs">{wineryLocation.address}</p>}
              </div>
            </InfoWindow>
          )}

          {/* User Location Marker */}
          {userPos && (
            <AdvancedMarker position={userPos}>
              <Pin background={'#1E382A'} borderColor={'#0d1a12'} glyphColor={'white'} />
            </AdvancedMarker>
          )}
        </GoogleMap>
      </APIProvider>
    </div>
  );
};

export default Map;