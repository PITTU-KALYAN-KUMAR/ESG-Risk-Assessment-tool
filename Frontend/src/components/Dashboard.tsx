// filepath: c:\ESG-Project\Frontend\src\components\Dashboard.tsx
import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [esgData, setEsgData] = useState<any[]>([]);

  useEffect(() => {
    const fetchEsgData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/esg-analysis");
        if (response.status === 200) {
          setEsgData(response.data);
        }
      } catch (error) {
        console.error("Error fetching ESG data:", error);
      }
    };

    fetchEsgData();
  }, []);

  // Prepare data for visualizations
  const categories = esgData.map((item) => item.category);
  const totalTerms = esgData.map((item) => item.total_esg_terms_matched);
  const termPercentages = esgData.map((item) => item.term_percentage);
  const riskPercentages = esgData.map((item) => item.risk_percentage);

  // Bar Chart Data
  const barChartData = {
    labels: categories,
    datasets: [
      {
        label: "Total ESG Terms Matched",
        data: totalTerms,
        backgroundColor: ["#34D399", "#60A5FA", "#A78BFA"],
      },
    ],
  };

  // Pie Chart Data
  const pieChartData = {
    labels: categories,
    datasets: [
      {
        label: "Term Percentage vs Risk Percentage",
        data: termPercentages.concat(riskPercentages),
        backgroundColor: [
          "#34D399", // Environmental
          "#60A5FA", // Social
          "#A78BFA", // Governance
          "#F87171", // Risk Percentage (Environmental)
          "#FBBF24", // Risk Percentage (Social)
          "#F59E0B", // Risk Percentage (Governance)
        ],
      },
    ],
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">ESG Dashboard</h2>

      {/* Bar Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Total ESG Terms by Category</h3>
        <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
      </div>

      {/* Pie Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Term Percentage vs Risk Percentage</h3>
        <Pie data={pieChartData} options={{ responsive: true, plugins: { legend: { position: "right" } } }} />
      </div>
    </div>
  );
};

export default Dashboard;