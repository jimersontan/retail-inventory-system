import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from './Modal';

/**
 * ConfirmModal — confirmation dialog for destructive actions.
 * Props: isOpen, onClose, onConfirm, title, message, confirmText, confirmColor, loading
 */
const ConfirmModal = ({
    isOpen, onClose, onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    confirmColor = 'red',
    loading = false,
}) => {
    const colorMap = {
        red: 'bg-red-600 hover:bg-red-700 text-white',
        amber: 'bg-amber-600 hover:bg-amber-700 text-white',
        indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            icon={AlertTriangle}
            iconBg="bg-amber-50"
            maxWidth="sm"
            footer={
                <>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${colorMap[confirmColor] || colorMap.red} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {confirmText}
                    </button>
                </>
            }
        >
            <div className="px-6 py-6">
                <p className="text-sm text-slate-600">{message}</p>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
