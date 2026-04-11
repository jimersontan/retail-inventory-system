import React from 'react';
import { Star } from 'lucide-react';

const RatingDistribution = ({ distribution = {} }) => {
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0) || 0;

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Rating Distribution
            </h3>
            <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                    const count = distribution[rating] || 0;
                    const percentage = total > 0 ? (count / total) * 100 : 0;

                    return (
                        <div key={rating} className="flex items-center gap-2">
                            <div className="flex items-center gap-1 w-16">
                                <span className="text-xs font-medium text-slate-600">
                                    {rating}
                                </span>
                                <Star className="size-3 text-amber-400" fill="currentColor" />
                            </div>
                            <div className="flex-1">
                                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-amber-400 rounded-full transition-all`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                            <div className="text-xs text-slate-600 w-12 text-right">
                                {count}
                                <span className="text-slate-400">/{total}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RatingDistribution;
