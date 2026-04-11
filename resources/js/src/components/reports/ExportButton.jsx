import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useReportStore } from '../../store/reportStore';

const ExportButton = ({ type = 'sales' }) => {
    const [loading, setLoading] = useState(false);
    const { dateRange, exportReport } = useReportStore();

    const handleExport = async () => {
        setLoading(true);
        try {
            await exportReport(type, dateRange.from, dateRange.to);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
        >
            <Download className="w-4 h-4" />
            {loading ? 'Exporting...' : 'Export CSV'}
        </button>
    );
};

export default ExportButton;
