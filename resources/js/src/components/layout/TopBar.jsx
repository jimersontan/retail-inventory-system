import { Bell, Menu, X, Check, Eye } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const TopBar = ({ title, setSidebarOpen }) => {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [isOpen, setIsOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.data.data || []);
            setUnreadCount(res.data.unread_count || 0);
        } catch (e) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (user) {
            fetchNotifications();
            // Optional: Set up an interval to poll notifications
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (e) {
            toast.error('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            fetchNotifications();
            toast.success('All notifications marked as read');
        } catch (e) {
            toast.error('Failed to mark all as read');
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.substring(0, 2).toUpperCase();
    };

    const getRoleColor = (r) => {
        switch(r) {
            case 'admin': return 'bg-purple-100 text-purple-700';
            case 'manager': return 'bg-blue-100 text-blue-700';
            case 'cashier': return 'bg-emerald-100 text-emerald-700';
            case 'customer': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const role = user?.user_type || 'customer';

    return (
        <header className="fixed top-0 left-0 md:left-60 right-0 h-[60px] bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 z-30 transition-all duration-300">
            {/* Page Title & Mobile Toggle */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 focus:outline-none md:hidden"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold text-slate-900 truncate">
                    {title || 'Dashboard'}
                </h1>
            </div>

            {/* Right side actions */}
                <div className="flex items-center gap-4 relative">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors focus:outline-none"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full ring-2 ring-white text-[10px] text-white flex items-center justify-center font-bold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Notifications Dropdown */}
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={markAllAsRead}
                                        className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {loading && notifications.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-slate-500">Loading...</div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                        <p className="text-xs text-slate-500 font-medium">No new notifications</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {notifications.map((notif) => (
                                            <div 
                                                key={notif.id} 
                                                className={`p-4 transition-colors ${notif.read_at ? 'bg-white' : 'bg-indigo-50/30'}`}
                                            >
                                                <div className="flex justify-between items-start gap-2">
                                                    <div>
                                                        <h4 className={`text-xs font-bold ${notif.read_at ? 'text-slate-700' : 'text-slate-900'}`}>
                                                            {notif.data.title}
                                                        </h4>
                                                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                                            {notif.data.message}
                                                        </p>
                                                        <time className="text-[10px] text-slate-400 mt-2 block font-medium">
                                                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                                        </time>
                                                    </div>
                                                    {!notif.read_at && (
                                                        <button 
                                                            onClick={() => markAsRead(notif.id)}
                                                            className="p-1 text-slate-300 hover:text-indigo-600 transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
                
                <div className="w-px h-5 bg-slate-200"></div>
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${getRoleColor(role)} cursor-pointer`}>
                    {getInitials(user?.name)}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
