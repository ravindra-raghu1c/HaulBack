import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedLoad, toggleAIDispatchModal } from '../../store/slices/loadsSlice.js';
import { toggleBidModal, setSelectedLoadForBid } from '../../store/slices/bidsSlice.js';
import { createLoadStatusIcon, createTruckMarkerIcon, createWaypointIcon } from './CustomMarkers.jsx';
import { 
  Layers, 
  Navigation, 
  Maximize2, 
  Compass, 
  Eye, 
  Sparkles, 
  DollarSign, 
  ShieldCheck,
  Radio,
  Truck
} from 'lucide-react';
import soundFx from '../../services/soundFx.js';

// Leaflet loaded via window.L or package
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LiveMap({ height = 'h-[500px]' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routePolylineRef = useRef(null);
  const truckMarkerRef = useRef(null);

  const dispatch = useDispatch();
  const loads = useSelector((state) => state.loads?.items || []);
  const selectedLoad = useSelector((state) => state.loads?.selectedLoad || null);
  const telemetry = useSelector((state) => state.telemetry || {});
  const activeRole = useSelector((state) => state.auth?.activeRole || 'DRIVER');

  const [mapTheme, setMapTheme] = useState('voyager'); // 'voyager' | 'osm' | 'dark'

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [23.1428, 77.5255], // Central India / Bhopal hub
        zoom: 6,
        zoomControl: false,
        attributionControl: false
      });

      // Zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Create tile layer
      const getTileUrl = (theme) => {
        if (theme === 'dark') {
          return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        } else if (theme === 'osm') {
          return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        }
        // CartoDB Voyager Light (crisp clean light maps)
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      };

      const tileLayer = L.tileLayer(getTileUrl(mapTheme), {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      mapInstanceRef.current = map;
      mapInstanceRef.current.tileLayer = tileLayer;

      // Layer groups for markers
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      // Cleanup on unmount if needed
    };
  }, []);

  // Update map tiles when mapTheme changes
  useEffect(() => {
    if (mapInstanceRef.current && mapInstanceRef.current.tileLayer) {
      let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      if (mapTheme === 'dark') {
        url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      } else if (mapTheme === 'osm') {
        url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      }
      mapInstanceRef.current.tileLayer.setUrl(url);
    }
  }, [mapTheme]);

  // Render Load Markers & Corridors
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // Render each load's pickup & drop point
    loads.forEach((load) => {
      if (!load.pickupLocation?.coordinates) return;
      const [lng, lat] = load.pickupLocation.coordinates;
      const isSelected = selectedLoad?._id === load._id;

      const marker = L.marker([lat, lng], {
        icon: createLoadStatusIcon(load.status, load.weightInTons, load.bidsCount, isSelected),
        riseOnHover: true
      });

      // Custom Popup HTML in light mode
      const popupHtml = `
        <div class="p-4 rounded-2xl bg-white text-slate-900 space-y-2.5 font-['Plus_Jakarta_Sans',sans-serif] min-w-[240px]">
          <div class="flex items-center justify-between border-b border-slate-200 pb-2">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              ${load.status.replace('_', ' ')}
            </span>
            <span class="text-xs font-mono font-extrabold text-slate-900">
              ₹${load.basePrice.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <h4 class="text-sm font-bold text-slate-900 line-clamp-1">${load.title}</h4>
            <p class="text-xs text-slate-600 font-medium">
              ${load.pickupLocation.city} ➔ ${load.dropLocation.city}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200">
            <div>
              <span class="text-slate-500 block">Weight</span>
              <span class="font-bold font-mono text-slate-800">${load.weightInTons} Tons</span>
            </div>
            <div>
              <span class="text-slate-500 block">Distance</span>
              <span class="font-bold font-mono text-slate-800">${load.distanceKm} KM</span>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <button 
              id="map-popup-inspect-${load._id}"
              class="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center transition cursor-pointer shadow-xs"
            >
              Inspect Load
            </button>
            <button 
              id="map-popup-bid-${load._id}"
              class="py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold text-center transition cursor-pointer shadow-xs"
            >
              Bid ₹
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300 });

      marker.on('popupopen', () => {
        const inspectBtn = document.getElementById(`map-popup-inspect-${load._id}`);
        if (inspectBtn) {
          inspectBtn.onclick = () => {
            soundFx.radarPing();
            dispatch(setSelectedLoad(load));
          };
        }
        const bidBtn = document.getElementById(`map-popup-bid-${load._id}`);
        if (bidBtn) {
          bidBtn.onclick = () => {
            soundFx.radarPing();
            dispatch(setSelectedLoadForBid(load));
            dispatch(toggleBidModal(true));
          };
        }
      });

      marker.on('click', () => {
        soundFx.radarPing();
        dispatch(setSelectedLoad(load));
      });

      markersGroup.addLayer(marker);
    });

    // Render Truck Live Location Marker
    let truckLat = null;
    let truckLng = null;
    if (telemetry?.currentCoordinates && Array.isArray(telemetry.currentCoordinates)) {
      truckLng = telemetry.currentCoordinates[0];
      truckLat = telemetry.currentCoordinates[1];
    } else if (telemetry?.currentLocation?.lat && telemetry?.currentLocation?.lng) {
      truckLat = telemetry.currentLocation.lat;
      truckLng = telemetry.currentLocation.lng;
    }

    if (truckLat !== null && truckLng !== null) {
      if (truckMarkerRef.current) {
        truckMarkerRef.current.setLatLng([truckLat, truckLng]);
        truckMarkerRef.current.setIcon(
          createTruckMarkerIcon(
            telemetry?.vehicleType || 'HEAVY_TRAILER',
            telemetry?.speedKmH || 0,
            telemetry?.driverName || 'Vikram',
            telemetry?.isSimulating
          )
        );
      } else {
        const truckMarker = L.marker([truckLat, truckLng], {
          icon: createTruckMarkerIcon(
            telemetry?.vehicleType || 'HEAVY_TRAILER',
            telemetry?.speedKmH || 0,
            telemetry?.driverName || 'Vikram',
            telemetry?.isSimulating
          ),
          zIndexOffset: 1000
        });
        markersGroup.addLayer(truckMarker);
        truckMarkerRef.current = truckMarker;
      }
    }

    // Render Corridor Route Polyline
    if (selectedLoad && selectedLoad.pickupLocation && selectedLoad.dropLocation) {
      const p1 = [selectedLoad.pickupLocation.coordinates[1], selectedLoad.pickupLocation.coordinates[0]];
      const p2 = [selectedLoad.dropLocation.coordinates[1], selectedLoad.dropLocation.coordinates[0]];

      if (routePolylineRef.current) {
        routePolylineRef.current.setLatLngs([p1, p2]);
      } else {
        const poly = L.polyline([p1, p2], {
          color: '#d97706',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 12',
          className: 'animated-polyline'
        }).addTo(map);
        routePolylineRef.current = poly;
      }
    }
  }, [loads, selectedLoad, telemetry, dispatch]);

  const handleRecenter = () => {
    soundFx.radarPing();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([23.1428, 77.5255], 6, { duration: 1.2 });
    }
  };

  const handleFocusTruck = () => {
    soundFx.radarPing();
    const lat = telemetry?.currentLocation?.lat || telemetry?.currentCoordinates?.[1] || 23.1428;
    const lng = telemetry?.currentLocation?.lng || telemetry?.currentCoordinates?.[0] || 77.5255;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 10, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xl bg-white">
      {/* Map Header Floating Overlay */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2">
        {/* Layer Theme Switcher */}
        <div className="flex items-center bg-white/95 p-1 rounded-2xl border border-slate-300 shadow-md backdrop-blur-md">
          <button
            onClick={() => setMapTheme('voyager')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mapTheme === 'voyager'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Voyager Light
          </button>
          <button
            onClick={() => setMapTheme('osm')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mapTheme === 'osm'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Street Map
          </button>
          <button
            onClick={() => setMapTheme('dark')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mapTheme === 'dark'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Night Radar
          </button>
        </div>

        {/* Focus Truck CTA */}
        <button
          id="map-focus-truck-btn"
          onClick={handleFocusTruck}
          className="px-3.5 py-2 rounded-2xl bg-white/95 hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold shadow-md backdrop-blur-md flex items-center gap-1.5 transition cursor-pointer"
        >
          <Truck className="w-4 h-4 text-amber-600" />
          <span>Follow Rig (MP-04)</span>
        </button>

        <button
          onClick={handleRecenter}
          className="p-2 rounded-2xl bg-white/95 hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 shadow-md backdrop-blur-md transition cursor-pointer"
          title="Reset Map View"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend (Bottom Left Floating) */}
      <div className="absolute bottom-4 left-4 z-[400] hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/95 border border-slate-200 shadow-md backdrop-blur-md text-[11px] font-semibold text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Bidding Open</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
          <span>Posted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>In Transit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <span>Assigned</span>
        </div>
      </div>

      {/* Actual Leaflet DOM container */}
      <div ref={mapContainerRef} className={`w-full ${height} z-0`} />
    </div>
  );
}
