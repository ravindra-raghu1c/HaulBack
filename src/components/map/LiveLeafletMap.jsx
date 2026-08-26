import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedLoad, stepTelemetry, toggleAutoSimulation } from '../../store/store.js';
import L from 'leaflet';
import { 
  Navigation2, 
  Truck, 
  MapPin, 
  Maximize2, 
  Sparkles, 
  Layers, 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingDown, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Fuel, 
  Compass,
  Zap,
  Info
} from 'lucide-react';

// Status colors and badges configuration
const STATUS_STYLES = {
  POSTED: {
    bg: 'bg-cyan-500',
    border: 'border-cyan-400',
    text: 'text-cyan-300',
    glow: 'rgba(6, 182, 212, 0.6)',
    label: 'POSTED',
    iconText: '📦'
  },
  BIDDING_OPEN: {
    bg: 'bg-amber-500',
    border: 'border-amber-400',
    text: 'text-amber-300',
    glow: 'rgba(245, 158, 11, 0.7)',
    label: 'BIDDING OPEN',
    iconText: '⚡'
  },
  ASSIGNED: {
    bg: 'bg-indigo-500',
    border: 'border-indigo-400',
    text: 'text-indigo-300',
    glow: 'rgba(99, 102, 241, 0.6)',
    label: 'ASSIGNED',
    iconText: '🔒'
  },
  IN_TRANSIT: {
    bg: 'bg-emerald-500',
    border: 'border-emerald-400',
    text: 'text-emerald-300',
    glow: 'rgba(16, 185, 129, 0.7)',
    label: 'IN TRANSIT',
    iconText: '🚛'
  },
  COMPLETED: {
    bg: 'bg-slate-600',
    border: 'border-slate-500',
    text: 'text-slate-300',
    glow: 'rgba(100, 116, 139, 0.4)',
    label: 'COMPLETED',
    iconText: '✓'
  }
};

const VEHICLE_ICONS = {
  HEAVY_TRAILER: '🚛 25T Trailer',
  REEFER_COLD: '❄️ Reefer Cold',
  CONTAINER_TRUCK: '📦 32T Container',
  FLATBED: '🚚 Flatbed'
};

export default function LiveLeafletMap({ onOpenBidModal, onOpenAiModal }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const truckMarkerRef = useRef(null);

  const dispatch = useDispatch();
  const { items: loads, selectedLoad, statusFilter, vehicleFilter } = useSelector((state) => state.loads);
  const { data: telemetry, waypoints, autoSimulating } = useSelector((state) => state.telemetry);

  const [mapLayerType, setMapLayerType] = useState('dark'); // 'dark' | 'satellite' | 'streets'
  const [showWaypoints, setShowWaypoints] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center over central India (Bhopal / Indore / MP / UP Corridor)
    const map = L.map(mapContainerRef.current, {
      center: [23.1428, 77.5255],
      zoom: 6,
      zoomControl: false,
      attributionControl: false
    });

    // Dark sleek CartoDB tile layer
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Create feature groups for clean layering
    const routeGroup = L.featureGroup().addTo(map);
    const markersGroup = L.featureGroup().addTo(map);

    routeLayerRef.current = routeGroup;
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Polylines when loads or telemetry change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !routeLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    const routeGroup = routeLayerRef.current;

    markersGroup.clearLayers();
    routeGroup.clearLayers();

    // 1. Render all Freight Load Markers (Pickup & Drop)
    loads.forEach((load) => {
      const isSelected = selectedLoad?._id === load._id;
      const statusStyle = STATUS_STYLES[load.status] || STATUS_STYLES.POSTED;
      
      const pickupLng = load.pickupLocation?.coordinates[0];
      const pickupLat = load.pickupLocation?.coordinates[1];

      const dropLng = load.dropLocation?.coordinates[0];
      const dropLat = load.dropLocation?.coordinates[1];

      if (!pickupLat || !pickupLng) return;

      // Custom HTML Marker Pin for Pickup
      const customPickupHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transform transition-all duration-300 hover:scale-125 ${isSelected ? 'scale-125 z-50' : 'z-20'}">
          <!-- Outer Pulsing Glow Halo -->
          <div class="absolute -inset-2 rounded-full blur-sm opacity-80" style="background-color: ${statusStyle.glow};"></div>
          
          <!-- Inner Hex Capsule Pin -->
          <div class="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0f172a] border-2 ${statusStyle.border} shadow-2xl text-white font-bold text-xs">
            <span class="w-2.5 h-2.5 rounded-full ${statusStyle.bg} ${load.status === 'BIDDING_OPEN' ? 'animate-ping' : ''}"></span>
            <span class="font-mono text-[11px] text-slate-100">₹${(load.currentLowestBid / 1000).toFixed(0)}k</span>
            <span class="text-[10px] text-slate-400 font-normal">| ${load.pickupLocation.city}</span>
          </div>

          <!-- Downward Pointer Triangle -->
          <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${statusStyle.border.replace('border-', 'border-t-')}"></div>
        </div>
      `;

      const pickupIcon = L.divIcon({
        className: 'custom-leaflet-load-icon',
        html: customPickupHtml,
        iconSize: [120, 36],
        iconAnchor: [60, 36]
      });

      const pickupMarker = L.marker([pickupLat, pickupLng], { icon: pickupIcon }).addTo(markersGroup);

      // Interactive Popup for Marker
      const popupContent = `
        <div class="p-3.5 max-w-[280px] bg-[#0f172a] text-slate-100 rounded-xl border border-white/10 font-sans">
          <div class="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle.bg} text-slate-950">${statusStyle.label}</span>
            <span class="text-xs font-mono font-bold text-amber-400">₹${load.currentLowestBid.toLocaleString('en-IN')}</span>
          </div>
          <p class="font-bold text-sm text-white line-clamp-1">${load.title}</p>
          <div class="mt-2 text-xs text-slate-300 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Route:</span>
              <span class="font-medium">${load.pickupLocation.city} ➔ ${load.dropLocation.city}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Distance:</span>
              <span class="font-mono text-emerald-400 font-semibold">${load.distanceKm} KM</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Deadhead Saved:</span>
              <span class="font-mono text-amber-300 font-bold">${load.deadheadSavingsKm} KM</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Vehicle:</span>
              <span class="font-medium text-slate-200">${VEHICLE_ICONS[load.vehicleTypeRequired] || load.vehicleTypeRequired}</span>
            </div>
          </div>
        </div>
      `;

      pickupMarker.bindPopup(popupContent, { offset: [0, -25] });

      pickupMarker.on('click', () => {
        dispatch(setSelectedLoad(load));
      });

      // 2. Render Destination Pin
      if (dropLat && dropLng) {
        const dropHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transform hover:scale-110">
            <div class="w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-400 flex items-center justify-center text-[10px] text-slate-200 shadow-lg">
              🎯
            </div>
          </div>
        `;
        const dropIcon = L.divIcon({
          className: 'custom-drop-icon',
          html: dropHtml,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const dropMarker = L.marker([dropLat, dropLng], { icon: dropIcon }).addTo(markersGroup);
        dropMarker.bindTooltip(`Dropoff: ${load.dropLocation.city} (${load.dropLocation.address})`, { direction: 'top' });

        // Draw Route Line
        const polyline = L.polyline(
          [[pickupLat, pickupLng], [dropLat, dropLng]],
          {
            color: isSelected ? '#f59e0b' : '#38bdf8',
            weight: isSelected ? 4 : 2,
            opacity: isSelected ? 0.9 : 0.4,
            dashArray: isSelected ? '8, 12' : '4, 8',
            className: isSelected ? 'animated-polyline' : ''
          }
        ).addTo(routeGroup);

        if (isSelected) {
          polyline.bringToFront();
        }
      }
    });

    // 3. Render Waypoint Markers if active
    if (showWaypoints && waypoints && waypoints.length > 0) {
      waypoints.forEach((wp) => {
        const wpIconHtml = `
          <div class="flex items-center justify-center w-5 h-5 rounded-full ${
            wp.passed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 border border-white/20 text-slate-400'
          } text-[9px] font-bold shadow-md">
            ${wp.passed ? '✓' : '•'}
          </div>
        `;
        const wpIcon = L.divIcon({
          className: 'custom-wp-icon',
          html: wpIconHtml,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const wpMarker = L.marker([wp.lat, wp.lng], { icon: wpIcon }).addTo(markersGroup);
        wpMarker.bindTooltip(`<b>${wp.name}</b><br/>${wp.city} • ${wp.type} (${wp.kmFromStart} KM)`, { direction: 'top' });
      });
    }

    // 4. Render Real-Time Moving GPS Driver Truck Marker
    if (telemetry?.currentLocation) {
      const truckLat = telemetry.currentLocation.lat;
      const truckLng = telemetry.currentLocation.lng;

      const truckHtml = `
        <div class="relative flex items-center justify-center cursor-pointer z-50">
          <!-- Dynamic moving radar circle -->
          <div class="absolute -inset-3 rounded-full bg-emerald-500/30 animate-ping"></div>
          <div class="absolute -inset-4 rounded-full border border-emerald-400/40 animate-pulse"></div>
          
          <!-- Truck Vessel Pin -->
          <div class="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 border-2 border-white shadow-2xl transform rotate-${telemetry.heading || 0}">
            <span class="text-base font-black">🚛</span>
          </div>

          <!-- Speed Bubble Pill -->
          <div class="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#0f172a] border border-emerald-400/50 text-[10px] font-mono font-bold text-emerald-300 shadow-xl whitespace-nowrap">
            ${telemetry.speedKmH} km/h
          </div>
        </div>
      `;

      const truckIcon = L.divIcon({
        className: 'custom-truck-telemetry-icon',
        html: truckHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      truckMarkerRef.current = L.marker([truckLat, truckLng], { icon: truckIcon }).addTo(markersGroup);
      truckMarkerRef.current.bindPopup(`
        <div class="p-3 bg-[#0f172a] text-slate-100 rounded-xl border border-emerald-500/30">
          <div class="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            LIVE DRIVER TELEMETRY
          </div>
          <p class="font-bold text-sm text-white">${telemetry.driverName} (${telemetry.vehicleReg})</p>
          <p class="text-xs text-slate-300 mt-1">📍 ${telemetry.currentLocation.address}</p>
          <div class="mt-2 grid grid-cols-2 gap-2 text-xs font-mono">
            <div class="p-1.5 rounded bg-slate-900/80 border border-white/5">
              <span class="text-slate-400 text-[10px]">Speed:</span>
              <p class="text-emerald-300 font-bold">${telemetry.speedKmH} KM/H</p>
            </div>
            <div class="p-1.5 rounded bg-slate-900/80 border border-white/5">
              <span class="text-slate-400 text-[10px]">Progress:</span>
              <p class="text-amber-300 font-bold">${telemetry.progressPercent}%</p>
            </div>
          </div>
        </div>
      `);
    }

  }, [loads, selectedLoad, telemetry, waypoints, showWaypoints]);

  // Focus map when selectedLoad changes
  const handleFocusSelectedLoad = () => {
    if (!mapInstanceRef.current || !selectedLoad) return;
    const lat = selectedLoad.pickupLocation.coordinates[1];
    const lng = selectedLoad.pickupLocation.coordinates[0];
    mapInstanceRef.current.flyTo([lat, lng], 9, { duration: 1.2 });
  };

  const handleFitAllCorridors = () => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const bounds = markersLayerRef.current.getBounds();
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] lg:h-[680px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0b0f17]">
      
      {/* Leaflet Map Target Div */}
      <div ref={mapContainerRef} className="w-full h-full clean-dark-tiles" />

      {/* Floating Top-Left Status Filter & Map Control Bar */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2 max-w-[calc(100%-80px)]">
        <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-xl">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Freight Map</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        </div>

        <button
          id="map-fit-all-btn"
          onClick={handleFitAllCorridors}
          className="bg-[#0f172a]/90 hover:bg-slate-800 backdrop-blur-xl border border-white/10 text-slate-300 hover:text-white rounded-2xl px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 shadow-xl transition-all active:scale-95"
          title="Fit all cargo corridors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Fit All</span>
        </button>

        <button
          id="map-toggle-waypoints-btn"
          onClick={() => setShowWaypoints(!showWaypoints)}
          className={`backdrop-blur-xl border rounded-2xl px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 shadow-xl transition-all ${
            showWaypoints 
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
              : 'bg-[#0f172a]/90 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Milestones</span>
        </button>
      </div>

      {/* Floating Bottom-Left Telemetry Cockpit Mini-Controller */}
      <div className="absolute bottom-4 left-4 z-[400] max-w-sm sm:max-w-md w-full pr-8">
        <div className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5 shadow-2xl">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
              <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">Real-Time Telemetry</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id="telemetry-step-btn"
                onClick={() => dispatch(stepTelemetry(1))}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-semibold flex items-center gap-1 transition-all"
                title="Advance driver GPS along corridor"
              >
                <Play className="w-3 h-3" />
                <span>Simulate GPS Move</span>
              </button>
            </div>
          </div>

          {telemetry && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-900/90 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-mono">DRIVER / TRUCK</span>
                <span className="font-bold text-white text-[11px] truncate block">{telemetry.driverName}</span>
                <span className="text-[10px] text-emerald-400 font-mono">{telemetry.vehicleReg}</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/90 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-mono">GPS CORRIDOR</span>
                <span className="font-bold text-amber-300 text-[11px] truncate block">{telemetry.currentLocation?.address?.split(',')[0]}</span>
                <span className="text-[10px] text-slate-300 font-mono">{telemetry.speedKmH} km/h • {telemetry.progressPercent}%</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/90 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-mono">DEADHEAD CUT</span>
                <span className="font-bold text-teal-300 text-[11px] truncate block">+{telemetry.deadheadSavedKm} KM</span>
                <span className="text-[10px] text-slate-400 font-mono">₹34.5k Fuel Saved</span>
              </div>
            </div>
          )}

          {/* Progress bar along route */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
              <span>Origin: Bhopal</span>
              <span className="text-amber-400 font-bold">{telemetry?.progressPercent || 0}% Completed</span>
              <span>Dest: Delhi NCR</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-300 transition-all duration-500"
                style={{ width: `${telemetry?.progressPercent || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Top-Right Map Legend */}
      <div className="absolute top-4 right-4 z-[400] hidden sm:flex flex-col gap-1.5 p-3 rounded-2xl bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 text-[11px] shadow-xl">
        <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">Status Legend</span>
        {Object.entries(STATUS_STYLES).slice(0, 4).map(([key, item]) => (
          <div key={key} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${item.bg}`}></span>
            <span className="text-slate-300 font-medium">{item.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
