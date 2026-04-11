import React from 'react';

const ReportSummaryCard = ({ label, value, icon: Icon, iconBg, colored = false }) => {
    const formatValue = (val) => {
        if (typeof val === 'string' && val.includes('₱')) return val;
        if (typeof val === 'number' && (label.includes('Revenue') || label.includes('Amount') || label.includes('Total'))) {
            if (label.includes('Revenue') || label.includes('Amount') || label.includes('Total')) {
                return '₱ ' + val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
        }
        if (typeof val === 'number') {
            return val.toLocaleString();
        }
        return val;
    };

    return (
        <div className={`${colored ? 'bg-indigo-50 border border-indigo-200' : 'bg-white border border-slate-200'} rounded-2xl p-5 shadow-sm`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {label}
                    </p>
                    <p className={`text-2xl font-bold ${colored ? 'text-indigo-900' : 'text-slate-900'} mt-2`}>
                        {formatValue(value)}
                    </p>
                </div>

                {Icon && (
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportSummaryCard;
