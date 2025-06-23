import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isDarkMode }) => {
  interface EsgData {
    category: string;
    total_esg_terms_matched?: number;
    score: number;
    unique_keywords_matched?: number;
    term_percentage?: number;
    risk_percentage: number;
  }

  const [esgData, setEsgData] = useState<EsgData[]>([]);
  const COLORS = ['#4CAF50', '#2196F3', '#9C27B0']; // Colors for Environmental, Social, Governance

  useEffect(() => {
    // Fetch ESG data from the backend
    const fetchEsgData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/esg-analysis');
        setEsgData(response.data);
      } catch (error) {
        console.error('Error fetching ESG data:', error);
      }
    };

    fetchEsgData();
  }, []);

  return (
    <div className={`p-4 sm:p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-6 text-center sm:text-left">ESG Risk Dashboard</h1>

      {/* Table: ESG Data */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-center sm:text-left">ESG Data Overview</h2>
        <div className="overflow-x-auto">
          <table className={`min-w-full border rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <thead className={`${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Total ESG Terms Matched</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Weighted ESG Risk Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Unique Keywords Matched</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Term Percentage (%)</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Risk Percentage (%)</th>
              </tr>
            </thead>
            <tbody>
              {esgData.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-50') : (isDarkMode ? 'bg-gray-700' : 'bg-white')}`}>
                  <td className="px-4 py-4 text-sm">{item.category}</td>
                  <td className="px-4 py-4 text-sm">{item.total_esg_terms_matched || 'N/A'}</td>
                  <td className="px-4 py-4 text-sm">{item.score}</td>
                  <td className="px-4 py-4 text-sm">{item.unique_keywords_matched || 'N/A'}</td>
                  <td className="px-4 py-4 text-sm">{item.term_percentage || 'N/A'}</td>
                  <td className="px-4 py-4 text-sm">{item.risk_percentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar Chart: Risk Percentage by Category */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-center sm:text-left">Risk Percentage by Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={esgData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#ccc'} />
            <XAxis dataKey="category" stroke={isDarkMode ? '#fff' : '#000'} />
            <YAxis stroke={isDarkMode ? '#fff' : '#000'} />
            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#fff' : '#000' }} />
            <Legend />
            <Bar dataKey="risk_percentage" fill={isDarkMode ? '#8884d8' : '#82ca9d'} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart: Contribution of Each Category to Total Risk */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-center sm:text-left">Contribution of Each Category to Total Risk</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={esgData}
              dataKey="risk_percentage"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={(entry) => `${entry.category}: ${entry.risk_percentage}%`}
            >
              {esgData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#fff' : '#000' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;