'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Mock data - Replace with real data from your backend
const mockData = {
  monthlyFunding: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [15000, 25000, 18000, 30000, 28000, 35000],
  },
  categoryDistribution: {
    labels: ['Surgery', 'Treatment', 'Medication', 'Rehabilitation', 'Others'],
    data: [35, 25, 20, 15, 5],
  },
  spendingBreakdown: {
    labels: ['Hospital Bills', 'Medications', 'Tests', 'Equipment', 'Other Medical Expenses'],
    data: [45000, 25000, 15000, 10000, 5000],
  },
  successRate: {
    funded: 85,
    inProgress: 15,
  },
};

const Analytics = () => {
  const [isClient, setIsClient] = useState(false);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-06-30');
  const [dateRange, setDateRange] = useState('6m'); // Options: 1m, 3m, 6m, 1y, all

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    const endDate = new Date();
    let startDate = new Date();

    switch (range) {
      case '1m':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date('2024-01-01'); // Set to project start date
        break;
    }

    setStartDate(startDate.toISOString().split('T')[0]);
    setEndDate(endDate.toISOString().split('T')[0]);
  };

  const handleExportData = (format: 'csv' | 'pdf') => {
    // TODO: Implement actual export logic
    const data = {
      metrics: {
        totalFunds: '151,000 ADA',
        activeCampaigns: 24,
        successRate: '85%',
        totalDonors: 1284,
      },
      fundingTrend: mockData.monthlyFunding,
      categories: mockData.categoryDistribution,
      spending: mockData.spendingBreakdown,
    };

    if (format === 'csv') {
      // Convert data to CSV format
      const csvContent = `MedFund Analytics Report (${startDate} to ${endDate})\n\n` +
        `Metrics:\n` +
        `Total Funds Raised,${data.metrics.totalFunds}\n` +
        `Active Campaigns,${data.metrics.activeCampaigns}\n` +
        `Success Rate,${data.metrics.successRate}\n` +
        `Total Donors,${data.metrics.totalDonors}\n\n` +
        `Monthly Funding:\n` +
        `Month,Amount\n` +
        data.fundingTrend.labels.map((month, i) => `${month},${data.fundingTrend.data[i]}`).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `medfund_analytics_${startDate}_${endDate}.csv`;
      link.click();
    } else {
      // TODO: Implement PDF export
      console.log('PDF export to be implemented');
    }
  };

  const fundingTrendData = {
    labels: mockData.monthlyFunding.labels,
    datasets: [
      {
        label: 'Monthly Funding (ADA)',
        data: mockData.monthlyFunding.data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  };

  const categoryData = {
    labels: mockData.categoryDistribution.labels,
    datasets: [
      {
        data: mockData.categoryDistribution.data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const spendingData = {
    labels: mockData.spendingBreakdown.labels,
    datasets: [
      {
        label: 'Spending Distribution (ADA)',
        data: mockData.spendingBreakdown.data,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Campaign Analytics</h2>
        
        <div className="flex items-center gap-2 space-x-4">

          
          {/* Date Range Filters */}
          <div className="flex  items-center space-x-2">
            <div className="flex space-x-2">
              {['1m', '3m', '6m', '1y', 'all'].map((range) => (
                <button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  className={`px-3 py-1 md:flex-col rounded-md text-sm font-medium ${
                    dateRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === 'all' ? 'All' : range.toUpperCase()}
                </button>
              ))}
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 border rounded-md text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 border rounded-md text-sm"
            />
          </div>

          {/* Export Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleExportData('csv')}
              className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-sm font-medium"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExportData('pdf')}
              className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-sm font-medium"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Funds Raised</h3>
          <p className="text-2xl font-bold text-blue-600">151,000 ADA</p>
          <p className="text-sm text-gray-500">+12.5% from last month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Campaigns</h3>
          <p className="text-2xl font-bold text-blue-600">24</p>
          <p className="text-sm text-gray-500">8 pending verification</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
          <p className="text-2xl font-bold text-green-600">{mockData.successRate.funded}%</p>
          <p className="text-sm text-gray-500">of campaigns fully funded</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Donors</h3>
          <p className="text-2xl font-bold text-blue-600">1,284</p>
          <p className="text-sm text-gray-500">+56 this week</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Funding Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Funding Trend</h3>
          <div className="h-80">
            <Line data={fundingTrendData} options={options} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Categories</h3>
          <div className="h-80">
            <Doughnut data={categoryData} options={options} />
          </div>
        </div>

        {/* Spending Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Breakdown</h3>
          <div className="h-80">
            <Bar data={spendingData} options={options} />
          </div>
        </div>
      </div>

      {/* Real-time Updates */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                {
                  campaign: 'Emergency Heart Surgery',
                  amount: '5,000 ADA',
                  type: 'Donation',
                  time: '2 minutes ago',
                },
                {
                  campaign: 'Cancer Treatment Support',
                  amount: '2,500 ADA',
                  type: 'Withdrawal',
                  time: '15 minutes ago',
                },
                {
                  campaign: 'Pediatric Care Fund',
                  amount: '1,000 ADA',
                  type: 'Donation',
                  time: '1 hour ago',
                },
              ].map((transaction, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.campaign}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'Donation'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 