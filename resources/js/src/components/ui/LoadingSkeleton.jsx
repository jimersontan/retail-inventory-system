import React from 'react';

/**
 * LoadingSkeleton — pulse placeholder for async loading states.
 * Props: type ('card' | 'table' | 'chart' | 'text'), count (number of rows)
 */
const LoadingSkeleton = ({ type = 'card', count = 4 }) => {
    if (type === 'card') {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
                            <div className="w-16 h-4 bg-slate-200 rounded" />
                        </div>
                        <div className="w-20 h-3 bg-slate-200 rounded mb-2" />
                        <div className="w-28 h-8 bg-slate-200 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'chart') {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="w-32 h-5 bg-slate-200 rounded mb-4" />
                <div className="w-full h-[220px] bg-slate-100 rounded-xl" />
            </div>
        );
    }

    if (type === 'table') {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="w-40 h-5 bg-slate-200 rounded mb-6" />
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                        <div className="w-8 h-8 bg-slate-200 rounded-full" />
                        <div className="flex-1">
                            <div className="w-2/3 h-4 bg-slate-200 rounded mb-1" />
                            <div className="w-1/3 h-3 bg-slate-100 rounded" />
                        </div>
                        <div className="w-20 h-4 bg-slate-200 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    // text
    return (
        <div className="space-y-3 animate-pulse">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="h-4 bg-slate-200 rounded" style={{ width: `${80 - i * 10}%` }} />
            ))}
        </div>
    );
};

export default LoadingSkeleton;
