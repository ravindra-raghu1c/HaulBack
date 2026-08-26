import L from 'leaflet';

/**
 * Creates custom HTML / SVG DivIcons for Leaflet
 */

export const createLoadStatusIcon = (status, weightTons, bidsCount = 0, isSelected = false) => {
  let color = '#0284c7'; // Sky
  let badgeColor = 'bg-sky-600 text-white font-bold';
  let pulseRing = 'rgba(2, 132, 199, 0.4)';
  let iconSvg = `
    <svg class="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
    </svg>
  `;

  if (status === 'BIDDING_OPEN') {
    color = '#d97706'; // Amber / Gold
    badgeColor = 'bg-amber-500 text-slate-950 font-extrabold';
    pulseRing = 'rgba(217, 119, 6, 0.6)';
    iconSvg = `
      <svg class="w-4 h-4 text-amber-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    `;
  } else if (status === 'ASSIGNED') {
    color = '#9333ea'; // Purple
    badgeColor = 'bg-purple-600 text-white font-bold';
    pulseRing = 'rgba(147, 51, 234, 0.4)';
    iconSvg = `
      <svg class="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    `;
  } else if (status === 'IN_TRANSIT') {
    color = '#059669'; // Emerald Green
    badgeColor = 'bg-emerald-600 text-white font-bold';
    pulseRing = 'rgba(5, 150, 105, 0.6)';
    iconSvg = `
      <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
      </svg>
    `;
  } else if (status === 'COMPLETED') {
    color = '#64748b'; // Slate
    badgeColor = 'bg-slate-600 text-white';
    pulseRing = 'rgba(100, 116, 139, 0.3)';
    iconSvg = `
      <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
      </svg>
    `;
  }

  const selectedRing = isSelected ? 'ring-4 ring-amber-500 scale-115 shadow-2xl z-50' : 'hover:scale-110 transition-transform duration-200';

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer ${selectedRing}" style="width: 44px; height: 44px;">
      <!-- Pulsing radar wave -->
      <div class="absolute inset-0 rounded-full animate-ping opacity-50" style="background-color: ${pulseRing}; animation-duration: 2.2s;"></div>
      
      <!-- Core Glass Marker Orb -->
      <div class="relative w-10 h-10 rounded-2xl bg-white border-2 border-slate-300 shadow-xl flex items-center justify-center" style="box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
        ${iconSvg}
      </div>

      <!-- Weight / Bids counter badge -->
      <div class="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[10px] ${badgeColor} shadow-md border border-white whitespace-nowrap">
        ${status === 'BIDDING_OPEN' ? `${bidsCount} bids` : `${weightTons}T`}
      </div>
      
      <!-- Status pill bottom -->
      <div class="absolute -bottom-2 px-1.5 py-0.2 rounded text-[8px] font-mono uppercase font-bold tracking-wider bg-slate-900 text-white shadow-xs">
        ${status.replace('_', ' ')}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-load-div-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
};

export const createTruckMarkerIcon = (vehicleType, speed = 0, driverName = 'Driver', isLiveSimulating = false) => {
  const pulseEffect = isLiveSimulating ? 'animate-pulse' : '';
  
  let truckSvg = `
    <svg class="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 18.5a1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5m1.5-9 1.96 2.5H17V9.5h2.5M6 18.5A1.5 1.5 0 0 1 4.5 17 1.5 1.5 0 0 1 6 15.5 1.5 1.5 0 0 1 7.5 17 1.5 1.5 0 0 1 6 18.5M20 7H17V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4Z"/>
    </svg>
  `;

  if (vehicleType === 'REEFER_COLD') {
    truckSvg = `
      <svg class="w-5 h-5 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 13h-2V7h-4V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-3.5L19 13M6 18.5A1.5 1.5 0 0 1 4.5 17 1.5 1.5 0 0 1 6 15.5 1.5 1.5 0 0 1 7.5 17 1.5 1.5 0 0 1 6 18.5m12 0a1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5M16 11V8.5h2.5l1.96 2.5H16Z"/>
      </svg>
    `;
  }

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer ${pulseEffect}" style="width: 48px; height: 48px;">
      <!-- Glowing outer beacon -->
      <div class="absolute inset-0 rounded-full bg-amber-500/30 animate-ping opacity-75"></div>
      
      <!-- Inner hexagon / truck badge -->
      <div class="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-0.5 shadow-xl flex items-center justify-center">
        <div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center border border-amber-300">
          ${truckSvg}
        </div>
      </div>

      <!-- Live Speed badge -->
      <div class="absolute -top-2 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-bold shadow-md border border-white">
        ${speed > 0 ? `${speed} km/h` : 'LIVE GPS'}
      </div>

      <!-- Driver Tag -->
      <div class="absolute -bottom-2.5 px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 text-[9px] font-bold shadow-md whitespace-nowrap border border-white/20">
        ${driverName.split(' ')[0]}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-truck-div-icon',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24]
  });
};

export const createWaypointIcon = (passed = false, type = 'WAYPOINT', index = 1) => {
  const bg = passed ? 'bg-emerald-600 text-white' : 'bg-white text-slate-800 border-2 border-slate-300';
  const html = `
    <div class="flex items-center justify-center w-6 h-6 rounded-full ${bg} text-[10px] font-bold shadow-md">
      ${passed ? '✓' : index}
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-wp-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};
