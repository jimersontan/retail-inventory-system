import React from 'react';

const BranchTypeBadge = ({ type }) => {
    const isMain = String(type).toLowerCase() === 'main';

    return (
        <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${
                isMain
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-sky-50 text-sky-700 border-sky-200'
            }`}
        >
            {type}
        </span>
    );
};

export default BranchTypeBadge;
