import React from 'react';
import { Package, Truck, RotateCcw, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

const iconMap = {
    'in': ArrowDownToLine,
    'out': ArrowUpFromLine,
    'adjustment': RotateCcw,
    'purchase_order': Truck,
    'sale': Package,
};

const colorMap = {
    'in': { bg: 'bg-emerald-50', color: 'text-emerald-600' },
    'out': { bg: 'bg-red-50', color: 'text-red-600' },
    'adjustment': { bg: 'bg-amber-50', color: 'text-amber-600' },
};

const ActivityFeed = ({ activities = [] }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
                <span className="text-xs text-slate-400">{activities.length} events</span>
            </div>

            <div className="space-y-3">
                {activities.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">No recent activity</p>
                ) : (
                    activities.map((activity, index) => {
                        const type = activity.type || 'in';
                        const IconComponent = iconMap[type] || Package;
                        const colors = colorMap[type] || { bg: 'bg-slate-50', color: 'text-slate-600' };

                        return (
                            <div key={activity.movement_id || index} className="flex items-start gap-3 py-2">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colors.bg}`}>
                                    <IconComponent className={`w-4 h-4 ${colors.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-700 leading-snug">
                                        {activity.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-400">{activity.time_ago}</span>
                                        {activity.user && (
                                            <>
                                                <span className="text-slate-300">·</span>
                                                <span className="text-xs text-slate-500">{activity.user}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
