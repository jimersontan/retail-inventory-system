import React from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal wrapper component.
 * Props: isOpen, onClose, title, subtitle, icon, iconBg, maxWidth, children, footer
 */
const Modal = ({ isOpen, onClose, title, subtitle, icon: Icon, iconBg, maxWidth = 'md', children, footer }) => {
    if (!isOpen) return null;

    const widthMap = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    return (
        <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className={`bg-white rounded-2xl shadow-2xl w-full ${widthMap[maxWidth] || 'max-w-md'} overflow-hidden max-h-[90vh] flex flex-col`}>
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg || 'bg-indigo-50'}`}>
                                <Icon className="w-5 h-5 text-indigo-600" />
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
