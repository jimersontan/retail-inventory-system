import React from 'react';
import { Check } from 'lucide-react';

const stages = ['draft', 'sent', 'partially_received', 'received'];
const labels = {
    draft: 'Draft',
    sent: 'Sent',
    partially_received: 'Partial',
    received: 'Received',
};

const POStatusFlow = ({ status }) => {
    const activeIdx = stages.indexOf(status);

    return (
        <div className="flex items-center gap-2">
            {stages.map((stage, idx) => {
                const done = activeIdx >= idx;
                const cancelled = status === 'cancelled';
                return (
                    <React.Fragment key={stage}>
                        <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs ${
                                cancelled
                                    ? 'bg-red-50 text-red-600 border-red-200'
                                    : done
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}
                        >
                            {done && !cancelled ? <Check className="w-3 h-3" /> : null}
                            {labels[stage]}
                        </div>
                        {idx !== stages.length - 1 ? <div className="w-4 h-px bg-slate-300" /> : null}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default POStatusFlow;
