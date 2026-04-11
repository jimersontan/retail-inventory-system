import React from 'react';

const ToggleSwitch = ({ checked, onChange }) => {
    return (
        <div 
            className="relative inline-flex cursor-pointer items-center"
            onClick={() => onChange(!checked)}
        >
            <input 
                type="checkbox" 
                className="sr-only" 
                checked={checked} 
                readOnly
            />
            <div 
                className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
            ></div>
            <div 
                className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            ></div>
        </div>
    );
};

export default ToggleSwitch;
