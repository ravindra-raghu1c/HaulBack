import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { togglePostLoadModal, addLoad } from '../../store/slices/loadsSlice.js';
import { openLoginModal } from '../../store/slices/authSlice.js';
import { addNotification } from '../../store/slices/notificationsSlice.js';
import { loadService } from '../../services/api.js';
import { 
  X, 
  Truck, 
  MapPin, 
  DollarSign, 
  Weight, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  FileText,
  AlertCircle,
  Lock,
  LogIn
} from 'lucide-react';
import soundFx from '../../services/soundFx.js';
import confetti from 'canvas-confetti';

const CITY_COORDS = {
  'Bhopal': { lat: 23.1428, lng: 77.5255, state: 'MP' },
  'Delhi NCR': { lat: 28.5355, lng: 77.2715, state: 'DL' },
  'Indore': { lat: 22.7196, lng: 75.8577, state: 'MP' },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714, state: 'GJ' },
  'Mumbai': { lat: 19.0760, lng: 72.8777, state: 'MH' },
  'Pune': { lat: 18.5204, lng: 73.8567, state: 'MH' },
  'Bengaluru': { lat: 12.9716, lng: 77.5946, state: 'KA' },
  'Chennai': { lat: 13.0827, lng: 80.2707, state: 'TN' },
  'Jaipur': { lat: 26.9124, lng: 75.7873, state: 'RJ' },
  'Gwalior': { lat: 26.2183, lng: 78.1828, state: 'MP' }
};

export default function PostLoadModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.loads?.isPostLoadModalOpen);
  const currentUser = useSelector((state) => state.auth?.user);

  const [title, setTitle] = useState('22T Soya Protein & Industrial Flour');
  const [cargoType, setCargoType] = useState('Agricultural / FMCG');
  const [vehicleType, setVehicleType] = useState('HEAVY_TRAILER');
  const [weightTons, setWeightTons] = useState(22);
  const [basePrice, setBasePrice] = useState(58000);
  const [originCity, setOriginCity] = useState('Bhopal');
  const [destinationCity, setDestinationCity] = useState('Delhi NCR');
  const [urgency, setUrgency] = useState('HIGH');
  const [notes, setNotes] = useState('Waterproof tarpaulin required. Direct return load pickup.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isDriver = currentUser && currentUser.role === 'DRIVER';

  const handleSubmit = async (e) => {
    e.preventDefault();

    // RBAC Check
    if (isDriver) {
      soundFx.radarPing();
      dispatch(addNotification({
        type: 'WARNING',
        title: 'Role-Based Access Control',
        message: 'Access Denied: Commercial Driver accounts cannot post freight shipments. Please log in with a Shipper account.'
      }));
      dispatch(openLoginModal('SHIPPER'));
      return;
    }

    try {
      setIsSubmitting(true);
      soundFx.bidPlaced();

      const originObj = CITY_COORDS[originCity] || { lat: 23.1428, lng: 77.5255 };
      const destObj = CITY_COORDS[destinationCity] || { lat: 28.5355, lng: 77.2715 };

      const payload = {
        shipperId: currentUser?._id || 'usr_shipper_01',
        shipperName: currentUser?.name || 'Adani Agri Logistics',
        title,
        cargoType,
        vehicleTypeRequired: vehicleType,
        weightInTons: Number(weightTons),
        basePrice: Number(basePrice),
        urgency,
        pickupLocation: {
          type: 'Point',
          coordinates: [originObj.lng, originObj.lat],
          address: `${originCity} Industrial Warehousing Hub`,
          city: originCity
        },
        dropLocation: {
          type: 'Point',
          coordinates: [destObj.lng, destObj.lat],
          address: `${destinationCity} Inland Container Hub`,
          city: destinationCity
        },
        distanceKm: 785,
        notes
      };

      const res = await loadService.createLoad(payload);
      if (res.data?.load) {
        dispatch(addLoad(res.data.load));
      }

      try {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      } catch {}

      setTimeout(() => {
        setIsSubmitting(false);
        dispatch(togglePostLoadModal(false));
      }, 700);
    } catch (err) {
      console.error('Create load error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="post-load-modal-container"
        className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center">
              <Truck className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Post Freight Return Load
              </h3>
              <p className="text-[11px] text-slate-500">Broadcast to nearby returning trucks on corridor</p>
            </div>
          </div>

          <button
            onClick={() => dispatch(togglePostLoadModal(false))}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* RBAC Notice if driver opens modal */}
          {isDriver && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-amber-900 text-xs">
              <Lock className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <div className="font-bold">Role-Based Access Control Active</div>
                <div className="text-slate-700">
                  You are logged in as a Commercial Driver. Freight load creation is restricted to Shipper accounts.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(togglePostLoadModal(false));
                    dispatch(openLoginModal('SHIPPER'));
                  }}
                  className="mt-1 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 cursor-pointer inline-flex items-center gap-1"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Switch / Sign in as Shipper</span>
                </button>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900">Shipment Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-500 shadow-xs"
              placeholder="e.g. 18T Export Grade Basmati Rice"
            />
          </div>

          {/* Origin and Destination City Selectors */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Pickup City</label>
              <select
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 shadow-xs font-medium"
              >
                {Object.keys(CITY_COORDS).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Destination Hub</label>
              <select
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 shadow-xs font-medium"
              >
                {Object.keys(CITY_COORDS).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payload Weight & Budget */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Weight (Metric Tons)</label>
              <input
                type="number"
                required
                min="1"
                max="50"
                value={weightTons}
                onChange={(e) => setWeightTons(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 font-mono font-bold shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Shipper Budget (INR)</label>
              <input
                type="number"
                required
                min="5000"
                step="500"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 font-mono font-bold shadow-xs"
              />
            </div>
          </div>

          {/* Vehicle Type & Cargo Category */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Vehicle Required</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 shadow-xs font-medium"
              >
                <option value="HEAVY_TRAILER">Heavy Trailer (25T+)</option>
                <option value="MULTI_AXLE">Multi-Axle Truck (16T)</option>
                <option value="REEFER_COLD">Reefer Cold Chain</option>
                <option value="OPEN_BODY">Open Body 10-Tyre</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Cargo Category</label>
              <select
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 shadow-xs font-medium"
              >
                <option value="Agricultural / FMCG">Agricultural / FMCG</option>
                <option value="Steel & Heavy Industrial">Steel & Heavy Industrial</option>
                <option value="Automotive Components">Automotive Components</option>
                <option value="Chemicals & Non-Hazardous">Chemicals & Non-Hazardous</option>
              </select>
            </div>
          </div>

          {/* Shipment Notes */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-700 font-semibold block">Loading Instructions & Tarpaulin Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-amber-500 shadow-xs"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <>
                <CheckCircle2 className="w-5 h-5 animate-spin" />
                <span>Broadcasting to Corridor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Publish Freight Load (₹{Number(basePrice).toLocaleString('en-IN')})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
