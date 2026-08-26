/**
 * In-memory Mock Database & Storage Engine for HaulBack
 * Modeled after MongoDB Mongoose schemas with 2dsphere GeoJSON structures
 */

export const INITIAL_USERS = [
  {
    _id: 'usr_driver_01',
    name: 'Vikram Sharma',
    email: 'vikram.driver@haulback.io',
    password: 'password123',
    role: 'DRIVER',
    phone: '+91 98260 12345',
    rating: 4.92,
    totalTrips: 184,
    deadheadKmSaved: 14250,
    vehicle: {
      regNumber: 'MP-04-HE-8821',
      type: 'HEAVY_TRAILER',
      capacityTons: 25,
      cargoTypes: ['FMCG', 'Grain / Rice', 'Auto Parts', 'Steel Coils'],
      make: 'Tata Prima 5530.S',
      status: 'AVAILABLE_FOR_RETURN',
      currentLocation: {
        type: 'Point',
        coordinates: [77.5255, 23.1428], // Mandideep / Bhopal
        address: 'Mandideep Industrial Area, Bhopal, MP',
        heading: 35,
        speed: 0
      },
      homeBase: {
        coordinates: [77.2090, 28.6139], // Delhi NCR
        address: 'Okhla Industrial Phase III, New Delhi'
      }
    }
  },
  {
    _id: 'usr_driver_02',
    name: 'Gurpreet Singh',
    email: 'gurpreet.trucker@haulback.io',
    password: 'password123',
    role: 'DRIVER',
    phone: '+91 98111 87654',
    rating: 4.88,
    totalTrips: 210,
    deadheadKmSaved: 19800,
    vehicle: {
      regNumber: 'PB-10-CZ-4992',
      type: 'REEFER_COLD',
      capacityTons: 18,
      cargoTypes: ['Dairy', 'Pharmaceuticals', 'Fresh Produce'],
      make: 'BharatBenz 2823R ColdChain',
      status: 'IN_TRANSIT',
      currentLocation: {
        type: 'Point',
        coordinates: [75.8577, 22.7196], // Indore
        address: 'Sanwer Road Industrial Area, Indore, MP',
        heading: 20,
        speed: 58
      },
      homeBase: {
        coordinates: [77.1025, 28.7041], // Delhi Azadpur Mandi
        address: 'Azadpur Cold Storage Hub, Delhi'
      }
    }
  },
  {
    _id: 'usr_driver_03',
    name: 'Rajesh Patil',
    email: 'rajesh.patil@haulback.io',
    password: 'password123',
    role: 'DRIVER',
    phone: '+91 94220 54321',
    rating: 4.95,
    totalTrips: 142,
    deadheadKmSaved: 11200,
    vehicle: {
      regNumber: 'MH-12-RN-7710',
      type: 'CONTAINER_TRUCK',
      capacityTons: 32,
      cargoTypes: ['Industrial Machinery', 'Export Containers', 'Electronics'],
      make: 'Volvo FM 420',
      status: 'AVAILABLE_FOR_RETURN',
      currentLocation: {
        type: 'Point',
        coordinates: [72.8777, 19.0760], // Mumbai JNPT
        address: 'JNPT Port Terminal, Navi Mumbai',
        heading: 110,
        speed: 0
      },
      homeBase: {
        coordinates: [73.8567, 18.5204], // Pune Chakan
        address: 'Chakan Auto Corridor, Pune, MH'
      }
    }
  },
  {
    _id: 'usr_shipper_01',
    name: 'Adani Agri & Commodities',
    email: 'logistics@adaniagri.com',
    password: 'password123',
    role: 'SHIPPER',
    phone: '+91 755 4920000',
    rating: 4.98,
    company: 'Adani Agri Logistics Ltd.',
    address: 'Bhopal Agro Hub, MP'
  },
  {
    _id: 'usr_shipper_02',
    name: 'Tata AutoComp Systems',
    email: 'freight@tataautocomp.com',
    password: 'password123',
    role: 'SHIPPER',
    phone: '+91 20 66085000',
    rating: 4.91,
    company: 'Tata AutoComp Logistics',
    address: 'Chakan Industrial Phase II, Pune'
  }
];

export const INITIAL_LOADS = [
  {
    _id: 'load_001',
    shipperId: 'usr_shipper_01',
    shipperName: 'Adani Agri Logistics',
    title: '18T Premium Basmati Rice (Export Grade)',
    cargoType: 'Agricultural Produce',
    vehicleTypeRequired: 'HEAVY_TRAILER',
    weightInTons: 18,
    basePrice: 54000,
    currentLowestBid: 49500,
    totalBidsCount: 4,
    status: 'BIDDING_OPEN',
    urgency: 'HIGH',
    pickupLocation: {
      type: 'Point',
      coordinates: [77.5255, 23.1428], // Mandideep Bhopal [lng, lat]
      address: 'Warehouse #4, Mandideep Industrial Area, Bhopal, MP',
      city: 'Bhopal'
    },
    dropLocation: {
      type: 'Point',
      coordinates: [77.2715, 28.5355], // Okhla Delhi
      address: 'Inland Container Depot (ICD) Tughlakabad / Okhla, New Delhi',
      city: 'Delhi NCR'
    },
    distanceKm: 785,
    estimatedDurationHours: 14.5,
    deadheadSavingsKm: 785,
    fuelSavingsEstimatedInr: 34500,
    co2ReductionKg: 890,
    assignedDriverId: null,
    assignedDriver: null,
    pickupWindow: {
      from: 'Today, 18:00 IST',
      to: 'Tomorrow, 08:00 IST'
    },
    notes: 'Tarpaulin waterproof cover mandatory. Moisture sensitive export cargo.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: 'load_002',
    shipperId: 'usr_shipper_02',
    shipperName: 'Tata AutoComp Systems',
    title: '12T Stamped Auto Chassis & Engine Blocks',
    cargoType: 'Automotive Components',
    vehicleTypeRequired: 'FLATBED',
    weightInTons: 12,
    basePrice: 42000,
    currentLowestBid: 39800,
    totalBidsCount: 3,
    status: 'IN_TRANSIT',
    urgency: 'CRITICAL',
    pickupLocation: {
      type: 'Point',
      coordinates: [75.8577, 22.7196], // Indore Sanwer Road
      address: 'Plot 88, Pithampur Industrial Area, Indore, MP',
      city: 'Indore'
    },
    dropLocation: {
      type: 'Point',
      coordinates: [76.9680, 28.4089], // Manesar Gurgaon
      address: 'Maruti Suzuki Supply Hub, IMT Manesar, Gurugram, HR',
      city: 'Gurugram'
    },
    distanceKm: 830,
    estimatedDurationHours: 15.2,
    deadheadSavingsKm: 830,
    fuelSavingsEstimatedInr: 38200,
    co2ReductionKg: 940,
    assignedDriverId: 'usr_driver_02',
    assignedDriver: {
      name: 'Gurpreet Singh',
      phone: '+91 98111 87654',
      vehicleNumber: 'PB-10-CZ-4992',
      rating: 4.88
    },
    currentProgressPercent: 42,
    currentDriverLocation: {
      lat: 25.1800,
      lng: 75.8300, // Near Kota on Agra highway
      speedKmH: 62,
      lastUpdated: '2 mins ago'
    },
    pickupWindow: {
      from: 'Yesterday, 14:00 IST',
      to: 'Yesterday, 18:00 IST'
    },
    notes: 'JIT delivery schedule. Gate pass pre-approved.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    _id: 'load_003',
    shipperId: 'usr_shipper_01',
    shipperName: 'Cipla Healthcare Logistics',
    title: '14T Temperature-Controlled Vaccine & Pharma',
    cargoType: 'Pharmaceuticals (2-8°C)',
    vehicleTypeRequired: 'REEFER_COLD',
    weightInTons: 14,
    basePrice: 68000,
    currentLowestBid: 65000,
    totalBidsCount: 2,
    status: 'POSTED',
    urgency: 'HIGH',
    pickupLocation: {
      type: 'Point',
      coordinates: [72.5714, 23.0225], // Ahmedabad
      address: 'Changodar Pharma SEZ, Ahmedabad, Gujarat',
      city: 'Ahmedabad'
    },
    dropLocation: {
      type: 'Point',
      coordinates: [77.5946, 12.9716], // Bangalore
      address: 'Peenya Biotech Logistics Park, Bengaluru, KA',
      city: 'Bengaluru'
    },
    distanceKm: 1480,
    estimatedDurationHours: 26,
    deadheadSavingsKm: 1480,
    fuelSavingsEstimatedInr: 62000,
    co2ReductionKg: 1580,
    assignedDriverId: null,
    assignedDriver: null,
    pickupWindow: {
      from: 'Tomorrow, 10:00 IST',
      to: 'Tomorrow, 14:00 IST'
    },
    notes: 'Active IoT temperature logging required throughout route.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    _id: 'load_004',
    shipperId: 'usr_shipper_02',
    shipperName: 'JSW Steel Infrastructure',
    title: '26T Hot Rolled Steel Coils',
    cargoType: 'Heavy Metals / Steel',
    vehicleTypeRequired: 'HEAVY_TRAILER',
    weightInTons: 26,
    basePrice: 61000,
    currentLowestBid: 57500,
    totalBidsCount: 5,
    status: 'ASSIGNED',
    urgency: 'MEDIUM',
    pickupLocation: {
      type: 'Point',
      coordinates: [73.1812, 22.3072], // Vadodara
      address: 'JSW Stockyard, Makarpura GIDC, Vadodara, Gujarat',
      city: 'Vadodara'
    },
    dropLocation: {
      type: 'Point',
      coordinates: [77.2090, 28.6139], // Delhi NCR
      address: 'Mayapuri Metal Warehousing Zone, New Delhi',
      city: 'Delhi NCR'
    },
    distanceKm: 990,
    estimatedDurationHours: 18,
    deadheadSavingsKm: 990,
    fuelSavingsEstimatedInr: 44000,
    co2ReductionKg: 1120,
    assignedDriverId: 'usr_driver_01',
    assignedDriver: {
      name: 'Vikram Sharma',
      phone: '+91 98260 12345',
      vehicleNumber: 'MP-04-HE-8821',
      rating: 4.92
    },
    currentProgressPercent: 10,
    currentDriverLocation: {
      lat: 22.3072,
      lng: 73.1812,
      speedKmH: 0,
      lastUpdated: 'Just now'
    },
    pickupWindow: {
      from: 'Today, 21:00 IST',
      to: 'Tomorrow, 06:00 IST'
    },
    notes: 'Requires heavy-duty lashings and wooden dunnage.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    _id: 'load_005',
    shipperId: 'usr_shipper_01',
    shipperName: 'ITC Agribusiness Division',
    title: '20T Organic Soya De-oiled Cake',
    cargoType: 'Agriculture / Feed',
    vehicleTypeRequired: 'CONTAINER_TRUCK',
    weightInTons: 20,
    basePrice: 51000,
    currentLowestBid: 48000,
    totalBidsCount: 3,
    status: 'COMPLETED',
    urgency: 'LOW',
    pickupLocation: {
      type: 'Point',
      coordinates: [76.8400, 23.2300], // Sehore MP
      address: 'ITC Chaupal Sagar Warehouse, Sehore, MP',
      city: 'Sehore'
    },
    dropLocation: {
      type: 'Point',
      coordinates: [72.8777, 19.0760], // Mumbai JNPT
      address: 'JNPT CFS Gateway 2, Navi Mumbai, MH',
      city: 'Mumbai Port'
    },
    distanceKm: 760,
    estimatedDurationHours: 14,
    deadheadSavingsKm: 760,
    fuelSavingsEstimatedInr: 33500,
    co2ReductionKg: 850,
    assignedDriverId: 'usr_driver_03',
    assignedDriver: {
      name: 'Rajesh Patil',
      phone: '+91 94220 54321',
      vehicleNumber: 'MH-12-RN-7710',
      rating: 4.95
    },
    currentProgressPercent: 100,
    notes: 'Delivered and digital e-Way Bill POD verified.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

export const INITIAL_BIDS = [
  {
    _id: 'bid_101',
    loadId: 'load_001',
    driverId: 'usr_driver_01',
    driverName: 'Vikram Sharma',
    driverRating: 4.92,
    vehicleReg: 'MP-04-HE-8821',
    vehicleType: 'HEAVY_TRAILER',
    bidAmount: 49500,
    originalBasePrice: 54000,
    discountPercentage: 8.3,
    deadheadReductionKm: 785,
    driverProximityKm: 4.2, // only 4.2km from Mandideep warehouse!
    etaPickupMins: 25,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    _id: 'bid_102',
    loadId: 'load_001',
    driverId: 'usr_driver_02',
    driverName: 'Gurpreet Singh',
    driverRating: 4.88,
    vehicleReg: 'PB-10-CZ-4992',
    vehicleType: 'HEAVY_TRAILER',
    bidAmount: 51200,
    originalBasePrice: 54000,
    discountPercentage: 5.1,
    deadheadReductionKm: 620,
    driverProximityKm: 18.5,
    etaPickupMins: 45,
    status: 'OUTBID',
    createdAt: new Date(Date.now() - 2700000).toISOString()
  },
  {
    _id: 'bid_103',
    loadId: 'load_001',
    driverId: 'usr_driver_03',
    driverName: 'Sanjay Yadav (Fleet)',
    driverRating: 4.75,
    vehicleReg: 'UP-80-AT-1102',
    vehicleType: 'HEAVY_TRAILER',
    bidAmount: 52000,
    originalBasePrice: 54000,
    discountPercentage: 3.7,
    deadheadReductionKm: 400,
    driverProximityKm: 32.0,
    etaPickupMins: 70,
    status: 'OUTBID',
    createdAt: new Date(Date.now() - 3200000).toISOString()
  }
];

export const INITIAL_TRIP_WAYPOINTS = [
  {
    name: 'Mandideep Industrial Hub (Pickup)',
    city: 'Bhopal',
    lat: 23.1428,
    lng: 77.5255,
    kmFromStart: 0,
    passed: true,
    passedTime: '06:30 IST',
    type: 'PICKUP'
  },
  {
    name: 'Biaora Bypass Toll Plaza',
    city: 'Biaora',
    lat: 23.5900,
    lng: 76.9100,
    kmFromStart: 125,
    passed: true,
    passedTime: '08:45 IST',
    type: 'TOLL'
  },
  {
    name: 'Guna Industrial Bypass & Rest Stop',
    city: 'Guna',
    lat: 24.6500,
    lng: 77.3100,
    kmFromStart: 215,
    passed: true,
    passedTime: '10:20 IST',
    type: 'REST_STOP'
  },
  {
    name: 'Shivpuri Highway Checkpoint',
    city: 'Shivpuri',
    lat: 25.4300,
    lng: 77.6500,
    kmFromStart: 310,
    passed: false,
    passedTime: 'Est 12:15 IST',
    type: 'CHECKPOINT'
  },
  {
    name: 'Gwalior Ring Road Interchange',
    city: 'Gwalior',
    lat: 26.2183,
    lng: 78.1828,
    kmFromStart: 430,
    passed: false,
    passedTime: 'Est 14:30 IST',
    type: 'JUNCTION'
  },
  {
    name: 'Agra - Delhi Yamuna Expressway Entry',
    city: 'Agra',
    lat: 27.1767,
    lng: 78.0081,
    kmFromStart: 570,
    passed: false,
    passedTime: 'Est 17:00 IST',
    type: 'EXPRESSWAY'
  },
  {
    name: 'Jewar Smart Logistics Hub',
    city: 'Greater Noida',
    lat: 28.1250,
    lng: 77.5500,
    kmFromStart: 710,
    passed: false,
    passedTime: 'Est 19:15 IST',
    type: 'TOLL'
  },
  {
    name: 'ICD Tughlakabad / Okhla Hub (Dropoff)',
    city: 'Delhi NCR',
    lat: 28.5355,
    lng: 77.2715,
    kmFromStart: 785,
    passed: false,
    passedTime: 'Est 21:00 IST',
    type: 'DROPOFF'
  }
];
