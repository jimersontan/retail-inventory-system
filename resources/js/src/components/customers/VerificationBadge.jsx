import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

const VerificationBadge = ({ isVerified }) => {
    if (isVerified) {
        return (
            <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">Verified</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5">
            <ShieldAlert className="size-4 text-amber-500" />
            <span className="text-xs text-amber-600 font-medium">Pending</span>
        </div>
    );
};

export default VerificationBadge;
