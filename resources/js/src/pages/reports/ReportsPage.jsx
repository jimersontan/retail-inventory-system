import React, { useEffect } from 'react';
import { useReportStore } from '../../store/reportStore';
import ExportButton from '../../components/reports/ExportButton';
import SalesReport from './tabs/SalesReport';
import InventoryReport from './tabs/InventoryReport';
import PurchaseReport from './tabs/PurchaseReport';
import MovementReport from './tabs/MovementReport';

const ReportsPage = () => {
    const {
        activeTab,
        setActiveTab,
        dateRange,
        setDateRange,
        initializeReports,
    } = useReportStore();

    const [fromDate, setFromDate] = React.useState(dateRange.from);
    const [toDate, setToDate] = React.useState(dateRange.to);

    useEffect(() => {
        initializeReports();
    }, [initializeReports]);

    const tabs = [
        { id: 'sales', label: 'Sales Report' },
        { id: 'inventory', label: 'Inventory Report' },
        { id: 'purchases', label: 'Purchase Report' },
        { id: 'movements', label: 'Stock Movements' },
    ];

    const handleDateChange = () => {
        if (fromDate && toDate) {
            setDateRange(fromDate, toDate);
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Comprehensive analytics and detailed breakdowns
                    </p>
                </div>

                {/* Date Range & Export */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-2">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-slate-400">—</span>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={handleDateChange}
                            className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                            title="Refresh"
                        >
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>

                    <ExportButton type={activeTab} />
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 mb-6 bg-white rounded-t-xl">
                <div className="flex gap-8 px-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'text-indigo-600 border-indigo-600'
                                    : 'text-slate-500 border-transparent hover:text-slate-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'sales' && <SalesReport />}
                {activeTab === 'inventory' && <InventoryReport />}
                {activeTab === 'purchases' && <PurchaseReport />}
                {activeTab === 'movements' && <MovementReport />}
            </div>
        </div>
    );
};

export default ReportsPage;
