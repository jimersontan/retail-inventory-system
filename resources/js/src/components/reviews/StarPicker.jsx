import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarPicker = ({ value, onChange }) => {
    const [hoverRating, setHoverRating] = useState(0);
    
    const labels = {
        0: '',
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent',
    };

    const displayRating = hoverRating || value;

    return (
        <div>
            <div className="flex gap-1 mb-4 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => onChange(star)}
                        className={`
                            w-10 h-10 rounded-xl flex items-center justify-center
                            transition-all
                            ${star <= (displayRating || 0)
                                ? 'bg-amber-50 border-amber-300 text-amber-400 scale-105'
                                : 'bg-white border border-slate-200 text-slate-300 hover:border-amber-300 hover:text-amber-400 hover:scale-110'
                            }
                        `}
                        type="button"
                    >
                        <Star className="size-5" fill="currentColor" />
                    </button>
                ))}
            </div>
            <p className="text-xs text-slate-400 text-center mb-1">Select your rating</p>
            {displayRating > 0 && (
                <p className="text-sm font-medium text-amber-700 text-center">
                    {labels[displayRating]}
                </p>
            )}
        </div>
    );
};

export default StarPicker;
