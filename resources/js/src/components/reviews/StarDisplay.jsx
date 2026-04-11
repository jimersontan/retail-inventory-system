import React from 'react';
import { Star } from 'lucide-react';

const StarDisplay = ({ rating, size = 'md', showCount = true, count = null }) => {
    const sizeMap = {
        sm: 'size-3',
        md: 'size-4',
        lg: 'size-5',
    };

    return (
        <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${sizeMap[size]} ${
                            star <= rating
                                ? 'text-amber-400'
                                : 'text-slate-200'
                        }`}
                        fill="currentColor"
                    />
                ))}
            </div>
            {showCount && (
                <span className="text-xs text-slate-400 ml-1">
                    ({count || rating}/5)
                </span>
            )}
        </div>
    );
};

export default StarDisplay;
