import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, onChange, interactive = false, size = 'sm' }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-7 h-7'
    };
    const iconSize = sizes[size] || sizes.sm;

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const isFilled = (hoverRating || rating) >= i;
            
            stars.push(
                <button
                    type="button"
                    key={i}
                    disabled={!interactive}
                    onMouseEnter={() => interactive && setHoverRating(i)}
                    onMouseLeave={() => interactive && setHoverRating(0)}
                    onClick={() => interactive && onChange && onChange(i)}
                    className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-0 bg-transparent border-none focus:outline-none`}
                >
                    <Star 
                        className={`${iconSize} ${isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} 
                    />
                </button>
            );
        }
        return stars;
    };

    return <div className="flex items-center gap-0.5">{renderStars()}</div>;
};

export default StarRating;
