import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoads, addNotification, setSelectedLoad } from '../../store/index.js';
import axios from 'axios';
import LoadCard from '../loads/LoadCard.jsx';
import { 
  PlusCircle, 
  Package, 
  MapPin, 
  DollarSign, 
  Truck, 
  Sparkles, 
  Clock, 
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TransporterDashboard({ onBidClick, onOptimizeClick }) {
  const dispatch = useDispatch();
  const loads = useSelector((state) => state.loads.items);
  const currentUser = useSelector((state) => state.auth.user);

  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '22T Automotive Stamping Parts & Engines',
    cargoType: 'Automobile Components',
    vehicleTypeRequired: 'HEAVY_TRAILER',
    weightInTons: 22,
    basePrice: 58000,
    pickupCity: 'Bhopal (Mandideep)',
    pickupAddress: 'Sector 3 Industrial Area, Mandideep, Bhopal, MP',
    dropCity: 'Delhi NCR (Gurugram)',
    dropAddress: 'Maruti Suzuki Component Hub, Manesar, Gurugram',
    distanceKm: 790,
    notes: 'JIT delivery schedule. Gate pass pre-approved.'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostLoad = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        shipperId: currentUser._id,
        shipperName: currentUser.company || 'Adani Agri Logistics',
        title: formData.title,
        cargoType: formData.cargoType,
        vehicleTypeRequired: formData.vehicleTypeRequired,
        weightInTons: Number(formData.weightInTons),
        basePrice: Number(formData.basePrice),
        pickupLocation: {
          type: 'Point',
          coordinates: [77.5255, 23.1428],
          address: formData.pickupAddress,
          city: formData.pickupCity
        },
        dropLocation: {
          type: 'Point',
          coordinates: [76.9680, 28.4089],
          address: formData.dropAddress,
          city: formData.dropCity
        },
        distanceKm: Number(formData.distanceKm),
        notes: formData.notes
      };

      await axios.post('/api/loads', payload);
      dispatch(fetchLoads({}));
      
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      dispatch(addNotification({
        title: 'New Return-Load Published',
        message: `${formData.title} posted to returning drivers in Bhopal-Delhi corridor.`,
        type: 'SUCCESS'
      }));

      setIsSubmitting(false);
      setIsPostingModalOpen(false);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
              SHIPPER FREIGHT HUB
            </span>
            <span className="text-xs text-slate-400 font-mono">{currentUser.company || 'Adani Agri Logistics'}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white font-['Outfit']">
            Post Freight & Match Return Carriers
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Save up to 35% on freight costs by matching returning empty trucks directly on your shipping lanes.
          </p>
        </div>

        <button
          onClick={() => setIsPostingModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Return-Load</span>
        </button>
      </div>

      {/* Loads List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loads.map((load) => (
          <LoadCard 
            key={load._id} 
            load={load} 
            onBidClick={onBidClick} 
            onOptimizeClick={onOptimizeClick} 
          />
        ))}
      </div>

      {/* Post Load Modal */}
      {isPostingModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-white/20 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-white/10 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Post Freight for Return-Haul</h3>
                  <p className="text-xs text-slate-400">Broadcast to nearby returning drivers via 2dsphere GeoJSON</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPostingModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostLoad} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Shipment Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Cargo Type</label>
                  <input
                    type="text"
                    value={formData.cargoType}
                    onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Weight (Tons)</label>
                  <input
                    type="number"
                    value={formData.weightInTons}
                    onChange={(e) => setFormData({ ...formData, weightInTons: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Vehicle Type Required</label>
                  <select
                    value={formData.vehicleTypeRequired}
                    onChange={(e) => setFormData({ ...formData, vehicleTypeRequired: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="HEAVY_TRAILER">Heavy Trailer (25-32T)</option>
                    <option value="REEFER_COLD">Reefer Cold Chain (18T)</option>
                    <option value="CONTAINER_TRUCK">Container Truck (20-30T)</option>
                    <option value="FLATBED">Flatbed (15-25T)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Base Freight Budget (₹)</label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-amber-400 font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Pickup City</label>
                  <input
                    type="text"
                    value={formData.pickupCity}
                    onChange={(e) => setFormData({ ...formData, pickupCity: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Destination City</label>
                  <input
                    type="text"
                    value={formData.dropCity}
                    onChange={(e) => setFormData({ ...formData, dropCity: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>
                  This freight post will automatically appear on the Leaflet live map and trigger push notifications to drivers currently unloading near {formData.pickupCity}.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing to Freight Corridor...' : 'Publish Load to Live Map'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
