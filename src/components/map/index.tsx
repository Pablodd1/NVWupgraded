"use client";

import React, { useEffect, useState } from "react";
import L, { LatLngBoundsLiteral } from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FaSpinner, FaRoute, FaCar, FaMapMarked } from "react-icons/fa";
import { Button } from "@/components/buttons/button";

type MapProps = {
  userLocation: GeolocationCoordinates;
  wineryLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
};

// Free routing API options available
type RoutingService = "osrm" | "google" | "apple" | "waze";

const Map: React.FC<MapProps> = ({ userLocation, wineryLocation }) => {
  const [loading, setLoading] = useState(true);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<[number, number]>>([]);
  const [routeDistance, setRouteDistance] = useState<string>("");
  const [routeDuration, setRouteDuration] = useState<string>("");
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [showRouteInfo, setShowRouteInfo] = useState(false);

  useEffect(() => {
    if (userLocation && wineryLocation) {
      setLoading(false);
    }
  }, [userLocation, wineryLocation]);

  useEffect(() => {
    // Fix for marker icon issue with Leaflet in React
    const defaultIcon = new L.Icon({
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
    });
    L.Marker.prototype.options.icon = defaultIcon;
  }, []);

  // Fetch route from OSRM (Open Source Routing Machine) - FREE
  const fetchRoute = async () => {
    setLoadingRoute(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.longitude},${userLocation.latitude};${wineryLocation.longitude},${wineryLocation.latitude}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Extract coordinates from the route geometry
        const coordinates: Array<[number, number]> = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] // Swap lon,lat to lat,lon for Leaflet
        );
        
        setRouteCoordinates(coordinates);
        
        // Format distance and duration
        const distanceKm = (route.distance / 1000).toFixed(1);
        const distanceMiles = (route.distance / 1609.34).toFixed(1);
        const durationMinutes = Math.round(route.duration / 60);
        
        setRouteDistance(`${distanceMiles} miles (${distanceKm} km)`);
        setRouteDuration(`${durationMinutes} minutes`);
        setShowRouteInfo(true);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      // Fallback to straight line if routing fails
      setRouteCoordinates([
        [userLocation.latitude, userLocation.longitude],
        [wineryLocation.latitude, wineryLocation.longitude]
      ]);
    } finally {
      setLoadingRoute(false);
    }
  };

  // Open navigation in external apps
  const openInNavigationApp = (service: RoutingService) => {
    const origin = `${userLocation.latitude},${userLocation.longitude}`;
    const destination = `${wineryLocation.latitude},${wineryLocation.longitude}`;
    const destinationAddress = wineryLocation.address ? encodeURIComponent(wineryLocation.address) : destination;

    let url = "";
    
    switch (service) {
      case "google":
        // Google Maps - Works on all platforms
        url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
        break;
      
      case "apple":
        // Apple Maps - Works on iOS/macOS
        url = `http://maps.apple.com/?saddr=${origin}&daddr=${destination}&dirflg=d`;
        break;
      
      case "waze":
        // Waze - Popular navigation app
        url = `https://waze.com/ul?ll=${destination}&navigate=yes&from=${origin}`;
        break;
      
      case "osrm":
        // OpenStreetMap - Free and open source
        url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${origin};${destination}`;
        break;
    }

    window.open(url, "_blank");
  };

  // Adjust map zoom and center on user and winery location
  const MapAdjuster = () => {
    const map = useMap();
    useEffect(() => {
      if (userLocation && wineryLocation) {
        if (routeCoordinates.length > 2) {
          // Fit bounds to the route
          const bounds: LatLngBoundsLiteral = routeCoordinates as any;
          map.fitBounds(bounds, { padding: [50, 50] });
        } else {
          // Fit bounds to markers only
          const bounds: LatLngBoundsLiteral = [
            [userLocation.latitude, userLocation.longitude],
            [wineryLocation.latitude, wineryLocation.longitude],
          ];
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }, [userLocation, wineryLocation, map, routeCoordinates]);

    return null;
  };

  // Auto-fetch route when component loads
  useEffect(() => {
    if (userLocation && wineryLocation && !loadingRoute && routeCoordinates.length === 0) {
      fetchRoute();
    }
  }, [userLocation, wineryLocation]);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
          <FaSpinner className="animate-spin text-2xl text-gray-500" />
        </div>
      )}

      {/* Route Information Card */}
      {showRouteInfo && (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 border-2 border-wine-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FaRoute className="text-wine-primary" />
              Route Information
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Distance:</span>
              <p className="font-semibold text-wine-primary">{routeDistance}</p>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <p className="font-semibold text-wine-primary">{routeDuration}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Options */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <FaCar className="text-wine-primary" />
          Open in Navigation App:
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button
            onClick={() => openInNavigationApp("google")}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            🗺️ Google Maps
          </Button>
          <Button
            onClick={() => openInNavigationApp("apple")}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            🍎 Apple Maps
          </Button>
          <Button
            onClick={() => openInNavigationApp("waze")}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            🚗 Waze
          </Button>
          <Button
            onClick={() => openInNavigationApp("osrm")}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            🌍 OpenStreetMap
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={[userLocation.latitude, userLocation.longitude]}
        zoom={13}
        style={{ height: "500px", width: "100%", borderRadius: "0.5rem" }}
        scrollWheelZoom={false}
      >
        <MapAdjuster />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Marker for user's location */}
        <Marker position={{ lat: userLocation.latitude, lng: userLocation.longitude }}>
          <Popup>
            <div className="text-center">
              <strong>📍 Your Location</strong>
            </div>
          </Popup>
        </Marker>

        {/* Marker for winery's location */}
        <Marker position={{ lat: wineryLocation.latitude, lng: wineryLocation.longitude }}>
          <Popup>
            <div className="text-center">
              <strong>🍷 Winery Location</strong>
              {wineryLocation.address && (
                <p className="text-sm text-gray-600 mt-1">{wineryLocation.address}</p>
              )}
            </div>
          </Popup>
        </Marker>

        {/* Polyline representing the route */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color="#722F37" // Wine color
            weight={4}
            opacity={0.8}
          />
        )}
      </MapContainer>

      {/* Reload Route Button */}
      <div className="mt-4 text-center">
        <Button
          onClick={fetchRoute}
          variant="outline"
          size="sm"
          disabled={loadingRoute}
          className="text-sm"
        >
          {loadingRoute ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Loading Route...
            </>
          ) : (
            <>
              <FaMapMarked className="mr-2" />
              Refresh Route
            </>
          )}
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Powered by OSRM (Open Source Routing Machine)
        </p>
      </div>
    </div>
  );
};

export default Map;
