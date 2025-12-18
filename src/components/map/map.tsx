import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  userLocation: GeolocationCoordinates;
  wineryLocation: {
    latitude: number;
    longitude: number;
  };
}

const Map = ({ userLocation, wineryLocation }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    // Note: Replace with your Mapbox token
    mapboxgl.accessToken = 'YOUR_MAPBOX_PUBLIC_TOKEN';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [wineryLocation.longitude, wineryLocation.latitude],
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers
    new mapboxgl.Marker({ color: '#722F37' })
      .setLngLat([wineryLocation.longitude, wineryLocation.latitude])
      .setPopup(new mapboxgl.Popup().setHTML('<h3>Winery Location</h3>'))
      .addTo(map.current);

    if (userLocation) {
      new mapboxgl.Marker({ color: '#1E382A' })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Location</h3>'))
        .addTo(map.current);

      // Fit bounds to include both markers
      const bounds = new mapboxgl.LngLatBounds()
        .extend([wineryLocation.longitude, wineryLocation.latitude])
        .extend([userLocation.longitude, userLocation.latitude]);

      map.current.fitBounds(bounds, {
        padding: 50
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [userLocation, wineryLocation]);

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden mt-4">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;