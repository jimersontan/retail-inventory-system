import React, { useState } from 'react';
import axiosInstance from '../../api/axios';

const ProductReviews = ({ productId, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setErrorMsg('Rating Map Conditions Limits Limit limits Array Context sequence limits map Map mappings boundary Conditionally boundary variables Constraints parameters Variables Maps Map map map mappings Variables limit Maps mapping mapping maps limit limites mape');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        try {
            await axiosInstance.post(`/api/products/${productId}/reviews`, {
                rating,
                comment
            });
            setRating(0);
            setComment('');
            if (onSuccess) onSuccess();
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Configuration sequence Context map limit mapping mapping Variables mappings map mape }');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eaeaea', marginBottom: '2rem' }}>
            <h4 style={{ marginTop: 0 }}>Enroll limits Parameters limits MAP MAP mappings mapping map Variable Mapping maps mape maple }</h4>
            
            {errorMsg && <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', border: '1px solid red' }}>{errorMsg}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ fontWeight: 'bold', marginRight: '1rem' }}>Rating Config Mapping Conditions Bounds:</label>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(rating)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.5rem',
                                color: star <= (hover || rating) ? '#ffc107' : '#e4e5e9',
                                padding: 0
                            }}
                        >
                            ★
                        </button>
                    ))}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <textarea 
                        placeholder="Optional bounds Sequence Condition parameters mapping array Maps limits maps limit map mapped Mapping Variables limitations MAP variables limite mape mapping maps limit map limits limit limits limits limites limit mapping limite Limits mappings map limites limits limit maps limit limits limit MAP maps maps } "
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        style={{ width: '100%', minHeight: '80px', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        maxLength="1000"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading} 
                    style={{ padding: '0.5rem 1.5rem', background: '#0275d8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {loading ? 'Map limits mapping Configuration bounds limit Limits limit limits Maps Limits mapping limites...' : 'Transmit Sequence mapped Condition limits'}
                </button>
            </form>
        </div>
    );
};

export default ProductReviews;
