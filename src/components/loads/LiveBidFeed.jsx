import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedLoad } from '../../store/index.js';
import { Gavel, TrendingDown, Radio, Sparkles, Clock, ArrowRight } from 'lucide-react';

export default function LiveBidFeed({ onSelectLoad }) {
  const dispatch = useDispatch();
  const loads = useSelector((state) => state.loads.items);
  
  // Real-time simulated bid events ticker
  const [liveEvents, setLiveEvents] = useState([
    {
      id: 'e1',
      driver: 'Vikram Sharma',
      vehicle: 'Tata Prima (MP-04)',
      loadTitle: '18T Basmati Rice',
      bid: 49500,
      savings: '8.3% off',
      time: '12s ago',
      loadId: 'load_001'
    },
    {
      id: 'e2',
      driver: 'Gurpreet Singh',
      vehicle: 'BharatBenz Reefer',
      loadTitle: '12T Auto Chassis',
      bid: 39800,
      savings: '5.2% off',
      time: '45s ago',
      loadId: 'load_002'
    },
    {
      id: 'e3',
      driver: 'Rajesh Patil',
      vehicle: 'Volvo FM 420',
      loadTitle: '26T Steel Coils',
      bid: 57500,
      savings: '5.7% off',
      time: '2m ago',
      loadId: 'load_004'
    }
  ]);

  // Periodic subtle live ticker updates
  useEffect(() => {
    const interval = setInterval(() => {
      const randomLoad = loads[Math.floor(Math.random() * loads.length)] || loads[0];
      if (!randomLoad) return;
      
      const newBidVal = Math.round((randomLoad.currentLowestBid * (0.98 - Math.random() * 0.03)) / 100) * 100;
      const newEvent = {
        id: `e_${Date.now()}`,
        driver: ['Sanjay Yadav (Fleet)', 'Harpreet Logistics', 'Devendra Patel', 'Manoj Translines'][Math.floor(Math.random() * 4)],
        vehicle: ['BharatBenz 2823R', 'Tata Signa 4825.TK', 'Ashok Leyland 4220'][Math.floor(Math.random() * 3)],
        loadTitle: randomLoad.title,
        bid: newBidVal,
        savings: `${Math.floor(4 + Math.random() * 8)}% off`,
        time: 'Just now',
        loadId: randomLoad._id
      };

      setLiveEvents(prev => [newEvent, ...prev.slice(0, 5)]);
    }, 12000);

    return () => clearInterval(interval);
  }, [loads]);

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Live Return-Bidding Ticker</h4>
        </div>
        <span className="text-[10px] font-mono text-slate-400">WebSocket / Socket.IO Live</span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {liveEvents.map((evt) => (
          <div
            key={evt.id}
            onClick={() => {
              const targetLoad = loads.find(l => l._id === evt.loadId);
              if (targetLoad) {
                dispatch(setSelectedLoad(targetLoad));
                if (onSelectLoad) onSelectLoad(targetLoad);
              }
            }}
            className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-white truncate">
                <span>{evt.driver}</span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">({evt.vehicle})</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">{evt.loadTitle}</div>
            </div>

            <div className="text-right shrink-0">
              <div className="font-mono font-bold text-amber-400">₹{evt.bid.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-400 font-medium">{evt.savings}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
