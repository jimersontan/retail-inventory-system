import React from 'react';
import { CheckCircle2, Clock, Cog, Package, AlertTriangle, XCircle } from 'lucide-react';

const stepIcons = {
    pending: Clock,
    confirmed: CheckCircle2,
    processing: Cog,
    ready: Package,
    completed: CheckCircle2,
};

const stepLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    ready: 'Ready',
    completed: 'Completed',
};

const OrderProgressTracker = ({ currentStatus, isDone = false }) => {
    if (isDone) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <XCircle className="text-red-500 size-8 mx-auto" />
                <p className="text-red-700 font-semibold mt-2">Order Cancelled</p>
                <p className="text-red-500 text-sm mt-1">Cancellation reason: Customer requested</p>
            </div>
        );
    }

    const steps = ['pending', 'confirmed', 'processing', 'ready', 'completed'];
    const currentIndex = steps.indexOf(currentStatus);

    return (
        <div className="flex items-center gap-0">
            {steps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const Icon = stepIcons[step];

                return (
                    <div key={step} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center flex-1">
                            {/* Circle */}
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                    isCompleted
                                        ? 'bg-indigo-600 text-white'
                                        : isCurrent
                                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                                        : 'bg-slate-100 text-slate-400'
                                }`}
                            >
                                <Icon className="size-5" />
                            </div>
                            {/* Label */}
                            <span
                                className={`text-xs font-medium mt-2 whitespace-nowrap ${
                                    isCompleted || isCurrent ? 'text-indigo-600' : 'text-slate-400'
                                }`}
                            >
                                {stepLabels[step]}
                            </span>
                        </div>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div
                                className={`h-0.5 flex-1 mx-2 transition-colors ${
                                    isCompleted ? 'bg-indigo-600' : 'bg-slate-200'
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default OrderProgressTracker;
