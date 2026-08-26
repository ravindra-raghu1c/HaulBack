import { INITIAL_USERS, INITIAL_LOADS, INITIAL_BIDS, INITIAL_TRIP_WAYPOINTS } from './mockDb.js';
import { optimizeDispatchWithGemini, generateRouteInsightsWithGemini } from './geminiDispatcher.js';

// In-memory active stores
let users = [...INITIAL_USERS];
let loads = [...INITIAL_LOADS];
let bids = [...INITIAL_BIDS];
let waypoints = [...INITIAL_TRIP_WAYPOINTS];
let locks = new Map(); // Simulated Redis SETNX lock store for atomic bids

// Current simulated driver telemetry
let telemetryState = {
  currentLoadId: 'load_001',
  driverId: 'carrier_01',
  driverName: 'Assigned Corridor Carrier',
  vehicleReg: 'MH-12-AB-1234',
  vehicleType: 'HEAVY_TRAILER',
  currentLocation: {
    lat: 23.1428,
    lng: 77.5255,
    address: 'Mandideep Industrial Hub, Bhopal'
  },
  pickup: {
    lat: 23.1428,
    lng: 77.5255,
    address: 'Mandideep, Bhopal'
  },
  destination: {
    lat: 28.5355,
    lng: 77.2715,
    address: 'ICD Tughlakabad / Okhla, New Delhi'
  },
  totalDistanceKm: 785,
  completedDistanceKm: 0,
  speedKmH: 0,
  heading: 32,
  status: 'AT_PICKUP',
  progressPercent: 0,
  etaMinutes: 870,
  currentWaypointIndex: 0,
  isSimulating: false,
  batteryTempC: 38,
  fuelLevelPercent: 94,
  deadheadSavedKm: 785
};

export function handleApiRequest(req, res, next) {
  const url = req.url || '';
  const method = req.method || 'GET';

  // Robust helper to parse JSON body across Connect/Vite/Express middleware
  const getBody = () => {
    return new Promise((resolve) => {
      if (req.body && typeof req.body === 'object') return resolve(req.body);
      if (typeof req.body === 'string') {
        try { return resolve(JSON.parse(req.body)); } catch { return resolve({}); }
      }
      
      let data = '';
      let isResolved = false;
      const finish = (result) => {
        if (!isResolved) {
          isResolved = true;
          resolve(result);
        }
      };

      req.on('data', chunk => { 
        data += chunk.toString(); 
      });

      req.on('end', () => {
        try {
          finish(data ? JSON.parse(data) : {});
        } catch {
          finish({});
        }
      });

      req.on('error', () => {
        finish({});
      });

      // Stream may already be finished or empty
      if (req.readableEnded || req.complete) {
        try {
          finish(data ? JSON.parse(data) : {});
        } catch {
          finish({});
        }
      }

      // Safety timeout so request never hangs
      setTimeout(() => {
        try {
          finish(data ? JSON.parse(data) : {});
        } catch {
          finish({});
        }
      }, 1000);
    });
  };

  const sendJson = (statusCode, data) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  // Only handle /api/* requests
  if (!url.startsWith('/api/')) {
    return next();
  }

  (async () => {
    try {
      // 1. Auth endpoints
      if (url === '/api/auth/me' && method === 'GET') {
        const authHeader = req.headers?.authorization || '';
        let matchedUser = users[0];
        if (authHeader.startsWith('Bearer ')) {
          const token = authHeader.replace('Bearer ', '');
          const found = users.find(u => token.includes(u._id) || (u.email && token.includes(encodeURIComponent(u.email))));
          if (found) matchedUser = found;
        }
        return sendJson(200, { success: true, user: matchedUser });
      }

      if (url === '/api/auth/users' && method === 'GET') {
        return sendJson(200, { success: true, users });
      }

      if (url === '/api/auth/login' && method === 'POST') {
        const body = await getBody();
        const { email, password, role } = body;
        
        if (!email) {
          return sendJson(400, {
            success: false,
            message: 'Email is required to sign in.'
          });
        }

        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase().trim());
        
        if (!user) {
          return sendJson(404, {
            success: false,
            message: `No account found for "${email}". Please register or check your email address.`
          });
        }

        // Validate password
        const validPassword = user.password || 'password123';
        if (password && password !== validPassword) {
          return sendJson(401, {
            success: false,
            message: 'Invalid password. Please verify your credentials and try again.'
          });
        }

        // Verify role constraints if a specific role is requested
        if (role && user.role !== role) {
          return sendJson(403, {
            success: false,
            message: `Access restricted: Account "${user.name}" is registered as a ${user.role}. You cannot enter the ${role} Portal without a valid ${role} account.`
          });
        }

        const token = `jwt_haulback_${user._id}_${Date.now()}`;
        return sendJson(200, {
          success: true,
          token,
          user,
          message: `Logged in successfully as ${user.name} (${user.role})`
        });
      }

      if (url === '/api/auth/sync' && method === 'POST') {
        const body = await getBody();
        const { registeredUsers } = body;
        if (Array.isArray(registeredUsers)) {
          registeredUsers.forEach(ru => {
            if (ru && ru.email && !users.some(u => u.email?.toLowerCase() === ru.email?.toLowerCase())) {
              users.push(ru);
            }
          });
        }
        return sendJson(200, { success: true, count: users.length });
      }

      if (url === '/api/auth/register' && method === 'POST') {
        const body = await getBody();
        const {
          name,
          email,
          password = 'password123',
          role = 'DRIVER',
          phone,
          vehicleReg,
          vehicleType,
          capacityTons,
          homeCity,
          company,
          cargoType,
          hubCity,
          gstin
        } = body;

        // Check if user with same email exists
        const existing = users.find(u => u.email?.toLowerCase() === (email || '').toLowerCase().trim());
        if (existing) {
          return sendJson(409, {
            success: false,
            message: 'An account with this email address already exists. Please log in with your password.'
          });
        }

        const newUserId = role === 'DRIVER' ? `usr_driver_${Date.now()}` : `usr_shipper_${Date.now()}`;
        
        let newUser = {
          _id: newUserId,
          name: name || (role === 'DRIVER' ? 'New Commercial Driver' : 'New Shipper Enterprise'),
          email: (email || `${newUserId}@haulback.io`).toLowerCase().trim(),
          password: password || 'password123',
          role: role.toUpperCase(),
          phone: phone || '+91 98000 00000',
          rating: 5.0,
          createdAt: new Date().toISOString()
        };

        if (role === 'DRIVER') {
          newUser = {
            ...newUser,
            totalTrips: 0,
            deadheadKmSaved: 0,
            earningsThisMonth: 0,
            vehicle: {
              regNumber: vehicleReg || 'MH-12-HB-2026',
              type: vehicleType || 'HEAVY_TRAILER',
              capacityTons: Number(capacityTons) || 25,
              make: `${vehicleType?.replace('_', ' ') || 'Heavy Rig'} Commercial`,
              cargoTypes: ['General Freight', 'Industrial', 'Agricultural'],
              status: 'AVAILABLE_FOR_RETURN',
              currentLocation: {
                type: 'Point',
                coordinates: [77.5255, 23.1428],
                address: homeCity || 'Mandideep Logistics Hub, Bhopal, MP'
              },
              homeBase: {
                coordinates: [77.2090, 28.6139],
                address: homeCity ? `${homeCity} Logistics Hub` : 'Delhi NCR Terminal'
              }
            }
          };
        } else if (role === 'SHIPPER') {
          newUser = {
            ...newUser,
            company: company || name || 'Enterprise Freight Shipper',
            gstin: gstin || '23AABCA1234F1Z5',
            cargoType: cargoType || 'General Freight',
            address: hubCity ? `${hubCity} Logistics Hub` : 'Central Logistics Terminal',
            escrowBalance: 500000,
            totalShipments: 0
          };
        } else if (role === 'FLEET_MANAGER') {
          newUser = {
            ...newUser,
            company: company || 'Regional Logistics Fleet',
            fleetSize: 12,
            activeOnRoute: 4
          };
        }

        users.unshift(newUser);
        const token = `jwt_haulback_${newUser._id}_${Date.now()}`;

        return sendJson(201, {
          success: true,
          token,
          user: newUser,
          message: `Account created successfully for ${newUser.name}!`
        });
      }

      if (url === '/api/auth/logout' && method === 'POST') {
        return sendJson(200, { success: true, message: 'Logged out successfully.' });
      }

      // 2. Loads endpoints
      if (url.startsWith('/api/loads') && method === 'GET') {
        const urlObj = new URL(url, 'http://localhost:3000');
        const statusFilter = urlObj.searchParams.get('status');
        const vehicleFilter = urlObj.searchParams.get('vehicleType');
        const search = urlObj.searchParams.get('search')?.toLowerCase();

        let filtered = [...loads];
        if (statusFilter && statusFilter !== 'ALL') {
          filtered = filtered.filter(l => l.status === statusFilter);
        }
        if (vehicleFilter && vehicleFilter !== 'ALL') {
          filtered = filtered.filter(l => l.vehicleTypeRequired === vehicleFilter);
        }
        if (search) {
          filtered = filtered.filter(l => 
            l.title.toLowerCase().includes(search) || 
            l.pickupLocation.city.toLowerCase().includes(search) ||
            l.dropLocation.city.toLowerCase().includes(search)
          );
        }

        return sendJson(200, { success: true, count: filtered.length, loads: filtered });
      }

      if (url === '/api/loads' && method === 'POST') {
        const body = await getBody();
        const newLoad = {
          _id: `load_${Date.now()}`,
          shipperId: body.shipperId || 'usr_shipper_01',
          shipperName: body.shipperName || 'Adani Agri Logistics',
          title: body.title || 'General Cargo Shipment',
          cargoType: body.cargoType || 'Industrial Goods',
          vehicleTypeRequired: body.vehicleTypeRequired || 'HEAVY_TRAILER',
          weightInTons: Number(body.weightInTons) || 15,
          basePrice: Number(body.basePrice) || 45000,
          currentLowestBid: Number(body.basePrice) || 45000,
          totalBidsCount: 0,
          status: 'POSTED',
          urgency: body.urgency || 'HIGH',
          pickupLocation: body.pickupLocation || {
            type: 'Point',
            coordinates: [77.5255, 23.1428],
            address: 'Industrial Hub, Mandideep, Bhopal',
            city: 'Bhopal'
          },
          dropLocation: body.dropLocation || {
            type: 'Point',
            coordinates: [77.2715, 28.5355],
            address: 'Okhla Logistics Terminal, New Delhi',
            city: 'Delhi NCR'
          },
          distanceKm: Number(body.distanceKm) || 785,
          estimatedDurationHours: 14.5,
          deadheadSavingsKm: Number(body.distanceKm) || 785,
          fuelSavingsEstimatedInr: Math.round((Number(body.distanceKm) || 785) * 44),
          co2ReductionKg: Math.round((Number(body.distanceKm) || 785) * 1.15),
          assignedDriverId: null,
          assignedDriver: null,
          notes: body.notes || 'Handle with care. GPS monitoring required.',
          createdAt: new Date().toISOString()
        };

        loads.unshift(newLoad);
        return sendJson(201, { success: true, load: newLoad });
      }

      if (url.match(/^\/api\/loads\/[^/]+$/) && method === 'GET') {
        const id = url.split('/')[3];
        const load = loads.find(l => l._id === id);
        if (!load) return sendJson(404, { success: false, message: 'Load not found' });
        const loadBids = bids.filter(b => b.loadId === id);
        return sendJson(200, { success: true, load, bids: loadBids });
      }

      if (url.match(/^\/api\/loads\/[^/]+\/status$/) && method === 'PATCH') {
        const id = url.split('/')[3];
        const body = await getBody();
        const loadIndex = loads.findIndex(l => l._id === id);
        if (loadIndex === -1) return sendJson(404, { success: false, message: 'Load not found' });

        loads[loadIndex] = {
          ...loads[loadIndex],
          status: body.status || loads[loadIndex].status,
          assignedDriverId: body.assignedDriverId !== undefined ? body.assignedDriverId : loads[loadIndex].assignedDriverId,
          assignedDriver: body.assignedDriver !== undefined ? body.assignedDriver : loads[loadIndex].assignedDriver,
          currentProgressPercent: body.currentProgressPercent !== undefined ? body.currentProgressPercent : loads[loadIndex].currentProgressPercent
        };

        return sendJson(200, { success: true, load: loads[loadIndex] });
      }

      // 3. Bids endpoints
      if (url.startsWith('/api/bids') && method === 'GET') {
        const urlObj = new URL(url, 'http://localhost:3000');
        const loadId = urlObj.searchParams.get('loadId');
        let filtered = bids;
        if (loadId) filtered = bids.filter(b => b.loadId === loadId);
        return sendJson(200, { success: true, bids: filtered });
      }

      if (url === '/api/bids' && method === 'POST') {
        const body = await getBody();
        const load = loads.find(l => l._id === body.loadId);
        if (!load) return sendJson(404, { success: false, message: 'Load not found' });

        const newBid = {
          _id: `bid_${Date.now()}`,
          loadId: body.loadId,
          driverId: body.driverId || 'usr_driver_01',
          driverName: body.driverName || 'Vikram Sharma',
          driverRating: 4.92,
          vehicleReg: body.vehicleReg || 'MP-04-HE-8821',
          vehicleType: body.vehicleType || 'HEAVY_TRAILER',
          bidAmount: Number(body.bidAmount),
          originalBasePrice: load.basePrice,
          discountPercentage: Number(((load.basePrice - body.bidAmount) / load.basePrice * 100).toFixed(1)),
          deadheadReductionKm: load.distanceKm,
          driverProximityKm: Number(body.driverProximityKm) || 4.2,
          etaPickupMins: Number(body.etaPickupMins) || 25,
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        };

        bids.unshift(newBid);

        // Update load current lowest bid
        if (newBid.bidAmount < load.currentLowestBid) {
          load.currentLowestBid = newBid.bidAmount;
        }
        load.totalBidsCount = (load.totalBidsCount || 0) + 1;
        if (load.status === 'POSTED') load.status = 'BIDDING_OPEN';

        return sendJson(201, { success: true, bid: newBid, load });
      }

      // Accept bid with simulated Redis atomic lock (SETNX)
      if (url.match(/^\/api\/bids\/[^/]+\/accept$/) && method === 'POST') {
        const bidId = url.split('/')[3];
        const bid = bids.find(b => b._id === bidId);
        if (!bid) return sendJson(404, { success: false, message: 'Bid not found' });

        const lockKey = `lock:load:${bid.loadId}`;
        const lockHeld = locks.get(lockKey);
        const now = Date.now();

        // Check if atomic lock is active
        if (lockHeld && lockHeld.expiresAt > now) {
          return sendJson(409, {
            success: false,
            message: 'Load is currently locked by another concurrent dispatch transaction. Please retry in seconds.'
          });
        }

        // Acquire lock for 10 seconds
        locks.set(lockKey, { lockedBy: bid._id, expiresAt: now + 10000 });

        const load = loads.find(l => l._id === bid.loadId);
        if (load) {
          load.status = 'ASSIGNED';
          load.assignedDriverId = bid.driverId;
          load.assignedDriver = {
            name: bid.driverName,
            phone: '+91 98260 12345',
            vehicleNumber: bid.vehicleReg,
            rating: bid.driverRating
          };
          load.currentLowestBid = bid.bidAmount;
          bid.status = 'ACCEPTED';

          // Mark other bids as outbid/rejected
          bids.filter(b => b.loadId === bid.loadId && b._id !== bid._id).forEach(b => {
            b.status = 'REJECTED';
          });
        }

        // Release lock
        locks.delete(lockKey);

        return sendJson(200, {
          success: true,
          message: 'Bid accepted with distributed atomic lock verified.',
          load,
          acceptedBid: bid
        });
      }

      // 4. Gemini AI Driver Assignment & Route Dispatch Optimizer
      if (url === '/api/ai/optimize-dispatch' && method === 'POST') {
        const body = await getBody();
        const load = body.load || loads[0];
        const availableDrivers = users.filter(u => u.role === 'DRIVER');

        const aiResult = await optimizeDispatchWithGemini({
          load,
          availableDrivers,
          currentCorridor: `${load.pickupLocation?.city} to ${load.dropLocation?.city}`
        });

        return sendJson(200, { success: true, optimization: aiResult });
      }

      // 5. Gemini AI Route Insights
      if (url === '/api/ai/route-insights' && method === 'POST') {
        const body = await getBody();
        const insights = await generateRouteInsightsWithGemini({
          origin: body.origin || 'Bhopal (Mandideep)',
          destination: body.destination || 'Delhi NCR (Okhla)',
          cargoType: body.cargoType || 'Basmati Rice',
          weightTons: Number(body.weightTons) || 18
        });
        return sendJson(200, { success: true, insights });
      }

      // 6. Telemetry & GPS Tracking simulation
      if (url === '/api/telemetry/state' && method === 'GET') {
        return sendJson(200, {
          success: true,
          telemetry: telemetryState,
          waypoints
        });
      }

      if (url === '/api/telemetry/step' && method === 'POST') {
        const body = await getBody();
        const stepAmount = Number(body.step) || 1; // move progress
        
        let newProgress = Math.min(100, Math.max(0, telemetryState.progressPercent + stepAmount * 4));
        telemetryState.progressPercent = newProgress;
        telemetryState.completedDistanceKm = Math.round((newProgress / 100) * telemetryState.totalDistanceKm);
        
        // Calculate intermediate lat/lng along the corridor (Bhopal -> Gwalior -> Agra -> Delhi)
        const startLat = 23.1428;
        const startLng = 77.5255;
        const endLat = 28.5355;
        const endLng = 77.2715;
        
        const currentLat = Number((startLat + (endLat - startLat) * (newProgress / 100)).toFixed(4));
        const currentLng = Number((startLng + (endLng - startLng) * (newProgress / 100)).toFixed(4));
        
        telemetryState.currentLocation = {
          lat: currentLat,
          lng: currentLng,
          address: newProgress > 95 ? 'Approaching Okhla ICD, New Delhi' :
                   newProgress > 70 ? 'Yamuna Expressway (Agra-Jewar Corridor)' :
                   newProgress > 45 ? 'NH44 Gwalior Highway Bypass' :
                   newProgress > 20 ? 'NH46 Biaora Corridor' : 'Mandideep Logistics Hub, Bhopal'
        };

        telemetryState.speedKmH = newProgress >= 100 ? 0 : Math.floor(58 + Math.random() * 12);
        telemetryState.etaMinutes = Math.max(0, Math.round((1 - newProgress / 100) * 870));
        
        // Update waypoints passed state
        const waypointIndex = Math.min(waypoints.length - 1, Math.floor((newProgress / 100) * waypoints.length));
        telemetryState.currentWaypointIndex = waypointIndex;
        waypoints.forEach((wp, idx) => {
          wp.passed = idx <= waypointIndex;
        });

        // Update load status automatically based on progress
        const activeLoad = loads.find(l => l._id === telemetryState.currentLoadId);
        if (activeLoad) {
          activeLoad.currentProgressPercent = newProgress;
          if (newProgress >= 100) {
            activeLoad.status = 'COMPLETED';
            telemetryState.status = 'DELIVERED';
          } else if (newProgress > 0) {
            activeLoad.status = 'IN_TRANSIT';
            telemetryState.status = 'IN_TRANSIT';
          }
        }

        return sendJson(200, {
          success: true,
          telemetry: telemetryState,
          waypoints
        });
      }

      if (url === '/api/telemetry/reset' && method === 'POST') {
        telemetryState.progressPercent = 0;
        telemetryState.completedDistanceKm = 0;
        telemetryState.currentLocation = {
          lat: 23.1428,
          lng: 77.5255,
          address: 'Mandideep Industrial Hub, Bhopal'
        };
        telemetryState.speedKmH = 0;
        telemetryState.etaMinutes = 870;
        telemetryState.currentWaypointIndex = 0;
        telemetryState.status = 'AT_PICKUP';
        waypoints.forEach((wp, idx) => {
          wp.passed = idx === 0;
        });

        const activeLoad = loads.find(l => l._id === telemetryState.currentLoadId);
        if (activeLoad) {
          activeLoad.currentProgressPercent = 0;
          activeLoad.status = 'ASSIGNED';
        }

        return sendJson(200, { success: true, telemetry: telemetryState, waypoints });
      }

      // Default 404 for unhandled /api
      return sendJson(404, { success: false, message: 'API route not found' });
    } catch (err) {
      console.error('API Error:', err);
      return sendJson(500, { success: false, error: err.message || 'Internal Server Error' });
    }
  })();
}
