import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  toggleDrawer, 
  markAllAsRead, 
  clearAll 
} from '../../store/slices/notificationsSlice.js';
import { 
  X, 
  Bell, 
  CheckCircle2, 
  Trash2, 
  Radio, 
  Sparkles, 
  DollarSign, 
  Truck, 
  AlertTriangle,
  Info
} from 'lucide-react';
import soundFx from '../../services/soundFx.js';

export default function NotificationDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.notifications?.isDrawerOpen);
  const items = useSelector((state) => state.notifications?.items || []);
  const unreadCount = useSelector((state) => state.notifications?.unreadCount || 0);

  if (!isOpen) return null;

  const handleClose = () => {
    soundFx.radarPing();
    dispatch(toggleDrawer(false));
  };

  const handleMarkAllRead = () => {
    soundFx.radarPing();
    dispatch(markAllAsRead());
  };

  const handleClearAll = () => {
    soundFx.radarPing();
    dispatch(clearAll());
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'AI_OPTIMIZATION':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      case 'BID_PLACED':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'DISPATCH':
        return <Truck className="w-4 h-4 text-sky-600" />;
      case 'TELEMETRY':
        return <Radio className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div 
        id="notification-drawer-container"
        className="w-full max-w-md bg-white border-l border-slate-200 h-full shadow-2xl overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 sticky top-0 z-10 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Real-time Corridor Alerts
              </h3>
              <p className="text-[11px] text-slate-500">{unreadCount} unread notifications</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition cursor-pointer shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2 text-xs">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium transition cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark all read</span>
          </button>

          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition cursor-pointer p-1 rounded-lg hover:bg-slate-100"
            title="Clear all notifications"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Clear all</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-5 space-y-3 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500 space-y-2">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No new corridor alerts.</p>
              <p className="text-[11px] text-slate-400">You're completely up to date.</p>
            </div>
          ) : (
            items.map((notif) => (
              <div
                key={notif._id || notif.id}
                className={`p-4 rounded-2xl border transition-all ${
                  notif.read
                    ? 'bg-slate-50 border-slate-200/80 text-slate-600'
                    : 'bg-white border-amber-300 shadow-sm text-slate-900 ring-1 ring-amber-400/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getNotifIcon(notif.type)}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900">{notif.title}</span>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {notif.timeAgo || 'Just now'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
