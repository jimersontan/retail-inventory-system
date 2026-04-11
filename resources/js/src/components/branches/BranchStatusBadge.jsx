import React from 'react';

const BranchStatusBadge = ({ isActive }) => {
    const active = Boolean(isActive);

    return (
        <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center justify-center w-fit ${
                active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
            }`}
        >
            <span
                className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                    active ? 'bg-emerald-500' : 'bg-red-400'
                }`}
            />
            {active ? 'Active' : 'Inactive'}
        </span>
    );
};

export default BranchStatusBadge;
