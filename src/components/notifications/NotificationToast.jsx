import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../../store/store.js';
import { Sparkles, Radio, CheckCircle2, AlertCircle, X, Truck, ShieldCheck } from 'lucide-react';

const ICON_MAP = {
  MATCH: <Sparkles className="w-4 h-4 text-amber-400" />,
  BID_PLACED: <Radio className="w-4 h-4 text-emerald-400" />,
  DISPATCH_LOCKED: <ShieldCheck className="w-4 h-4 text-blue-400" />,
  AI_DISPATCH_COMPLETE: <Sparkles className="w-4 h-4 text-amber-400" />,
  TELEMETRY_ALERT: <Truck className="w-4 h-4 text-cyan-400" />,
  LOAD_POSTED: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  INFO: <AlertCircle className="w-4 h-4 text-slate-400" />
};

export default function NotificationToast() {
  const dispatch = useDispatch();
  const { messages } = useSelector((state) => state.notifications);

  if (!messages || messages.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {messages.slice(0, 3).map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto p-3.5 rounded-2xl bg-[#0f172a]/95 backdrop-blur-xl border border-white/15 shadow-2xl text-slate-100 flex items-start gap-3 animate-fade-in"
        >
          <div className="p-1.5 rounded-xl bg-slate-900 border border-white/10 shrink-0">
            {ICON_MAP[notif.type] || <Sparkles className="w-4 h-4 text-amber-400" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h4 className="font-bold text-xs text-white truncate">{notif.title}</h4>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">{notif.timestamp}</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug">{notif.description}</p>
          </div>

          <button
            onClick={() => dispatch(removeNotification(notif.id))}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
