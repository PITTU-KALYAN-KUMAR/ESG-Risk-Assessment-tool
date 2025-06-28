import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Menu, X, Leaf, Moon, Sun, Upload, Download, FileText, Shield, BarChart3 } from 'lucide-react';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import About from './components/About';
import Help from './components/Help';
import jsPDF from "jspdf";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [esgAnalysis, setEsgAnalysis] = useState<{ category: string; score: number;risk_percentage: number }[]>([]);
  const [esgSummary, setEsgSummary] = useState<any>(null);
  const [esgRiskLevel, setEsgRiskLevel] = useState<string | null>(null);

  // Define the backend URL directly
  const API_BASE = "http://localhost:5000";

  // Initialize dark mode based on system preference
  useEffect(() => {
    const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(darkModePreference);
  }, []);

  // Apply dark mode class to document
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
    setIsProcessing(true);
  
    try {
      const uploadRes = await axios.post(`${API_BASE}/api/upload`, formData);
      if (uploadRes.status === 200) {
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date(),
        });
  
        const [analysisRes, summaryRes, riskRes] = await Promise.all([
          axios.get(`${API_BASE}/api/esg-analysis`),
          axios.get(`${API_BASE}/api/esg-summary`),
          axios.get(`${API_BASE}/api/esg-risk-level`),
        ]);
  
        setEsgAnalysis(analysisRes.data);
        setEsgSummary(summaryRes.data);
        setEsgRiskLevel(riskRes.data.risk_level);
        setReportGenerated(true);
      }
    } catch (error) {
      alert("Upload or analysis failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadReport = async () => {
    if (!uploadedFile) {
      alert("No file uploaded");
      return;
    }
  
    try {
      // Fetch dynamic data from the backend
      const analysisRes = await axios.get(`${API_BASE}/api/esg-analysis`);
      const summaryRes = await axios.get(`${API_BASE}/api/esg-summary`);
      const riskLevelRes = await axios.get(`${API_BASE}/api/esg-risk-level`);
  
      const esgAnalysis = analysisRes.data || [];
      const esgSummary = summaryRes.data.summary || "No summary available.";
      const esgRiskLevel = riskLevelRes.data.risk_level || "Unknown";
  
      if (!esgAnalysis.length || !esgSummary || !esgRiskLevel) {
        alert("Analysis data incomplete");
        return;
      }
  
      // Generate the PDF
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("ESG Risk Assessment Report", 10, 10);
  
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 20);
      doc.text(`Document: ${uploadedFile.name}`, 10, 30);
      doc.text(`ESG Risk Level: ${esgRiskLevel}`, 10, 40);
  
      doc.text("Summary:", 10, 50);
      doc.setFontSize(10);
      let y = 60;
  
      // Format the summary text to avoid unstructured content
      const formattedSummary = esgSummary.split("\n").map((line: string) => line.trim());
      formattedSummary.forEach((line: string) => {
        doc.text(line, 10, y);
        y += 6;
      });
  
      doc.setFontSize(12);
      doc.text("Category Analysis:", 10, y + 10);
      y += 20;
  
      // Dynamically add ESG analysis data
      esgAnalysis.forEach((item: any) => {
        const category = item.category || "Unknown Category";
        const riskPercentage = item.risk_percentage !== undefined ? `${item.risk_percentage}%` : "N/A";
        const termPercentage = item.term_percentage !== undefined ? `${item.term_percentage}%` : "N/A";
        const totalTerms = item.total_esg_terms_matched || "N/A";
        const uniqueKeywords = item.unique_keywords_matched || "N/A";
        const totalKeywords = item.total_keywords_in_dictionary || "N/A";
        const weightedScore = item.score || "N/A";
  
        doc.setFontSize(10);
        doc.text(`• ${category}:`, 10, y);
        y += 6;
        doc.text(`   Risk Percentage: ${riskPercentage}`, 12, y);
        y += 6;
        doc.text(`   Term Percentage: ${termPercentage}`, 12, y);
        y += 6;
        doc.text(`   Total ESG Terms Matched: ${totalTerms}`, 12, y);
        y += 6;
        doc.text(`   Unique Keywords Matched: ${uniqueKeywords}`, 12, y);
        y += 6;
        doc.text(`   Total Keywords in Dictionary: ${totalKeywords}`, 12, y);
        y += 6;
        doc.text(`   Weighted ESG Risk Score: ${weightedScore}`, 12, y);
        y += 10;
      });
  
      doc.save("ESG_Risk_Report.pdf");
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate the report. Please try again.");
    }
  };


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchEsgAnalysis = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/esg-analysis`);
    if (response.status === 200) {
      const analysisData = response.data.map((item: {
        Category: string;
        "Risk Percentage (%)": number;
        "Weighted ESG Risk Score": number;
      }) => ({
        category: item.Category,
        risk_percentage: item["Risk Percentage (%)"],
        score: item["Weighted ESG Risk Score"],
      }));

      setEsgAnalysis(analysisData);
    } else {
      console.error("Failed to fetch ESG analysis data.");
    }
  } catch (error) {
    console.error("Error fetching ESG analysis data:", error);
  }
};
  

useEffect(() => {
  fetchEsgAnalysis();
}, []);
  // ...existing code...

return (
  <Router>
  <div className={`flex flex-col min-h-screen max-w-full transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
    {/* Navigation Bar */}
<nav className={`${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-md border-b transition-colors duration-300`}>
  <div className="mx-auto max-w-7xl lg:max-w-none lg:w-full px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors duration-200`}
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
            <Leaf className="text-white" size={20} />
          </div>
          {windowWidth >= 372 ? (
    <div>
      <h1 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-bold truncate`}>
        ESG Risk Assessment
      </h1>
      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs truncate`}>
        Environmental • Social • Governance
      </p>
    </div>
  ) : (
      <h1 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-bold truncate`}>
        ESG Risk Assessment
      </h1>
    )}
        </div>
      </div>
      {/* Right Section */}
      <button
        onClick={toggleDarkMode}
        className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors duration-200`}
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  </div>
</nav>
    {/* Sidebar Overlay */}
    {isSidebarOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={toggleSidebar}
      />
    )}

    {/* Sidebar */}
    {isSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300" onClick={toggleSidebar} />
        )}
<div className={`fixed left-0 top-0 h-full w-64 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
  <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
        <Leaf className="text-white" size={20} />
      </div>
      <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ESG Portal</span>
    </div>
  </div>

  <nav className="mt-6">
    <div className="px-3 space-y-2">
      <Link to="/dashboard" className={`flex items-center px-3 py-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} rounded-lg transition-colors duration-200`}>
        <BarChart3 size={20} className="mr-3" />
        Dashboard
      </Link>
      <Link to="/about" className={`flex items-center px-3 py-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} rounded-lg transition-colors duration-200`}>
        <Shield size={20} className="mr-3" />
        About
      </Link>
      <Link to="/help" className={`flex items-center px-3 py-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} rounded-lg transition-colors duration-200`}>
        <FileText size={20} className="mr-3" />
        Help
      </Link>
    </div>
  </nav>
</div>

    {/* Main Content */}
    <main className="flex-grow max-w-full lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-auto">
    <Routes>
            <Route path="/dashboard" element={<Dashboard isDarkMode={isDarkMode} />} />
            <Route path="/about" element={<About isDarkMode={isDarkMode} />} />
            <Route path="/help" element={<Help isDarkMode={isDarkMode} />} />
            <Route
              path="/"
              element={
                <>
                {/* ESG Background Image */}
   <div
  className="h-64 w-full bg-cover bg-center object-cover lg:h-96"
  style={{
    backgroundImage: `url('/esgimg1.avif')`,
  }}
>
</div>
      {/* Header Section */}
      <div className="mb-8">
        <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          Risk Assessment Analysis
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Upload your documents to analyze ESG compliance and generate comprehensive risk reports
        </p>
      </div>

      {/* Upload Section */}
<div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 '} rounded-xl shadow-lg border p-8 mb-8 transition-colors duration-300`}>
  <div className="text-center">
    <div className="mb-6">
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
        <Upload className="text-white" size={24} />
      </div>
      <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' :'text-gray-900'} mb-2`}>
        Upload Document for Analysis
      </h3>
      <p className={`${isDarkMode ? 'text-gray-400': 'text-gray-600'}`}>
        Supported formats: PDF, DOC, DOCX, TXT
      </p>
    </div>

    <div className={`border-2 border-dashed ${isDarkMode ? 'hover:border-emerald-500 border-gray-600 rounded-lg' : 'border-gray-300 hover:border-emerald-400 '} p-8 transition-colors duration-200`}>
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer flex flex-col items-center"
      >
        <FileText className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mb-3`} size={48} />
        <span className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
          Click to upload or drag and drop
        </span>
        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
          Maximum file size: 50MB
        </span>
      </label>
    </div>

    {/* Show spinner while processing */}
    {isProcessing && (
      <div className="flex justify-center items-center mt-6">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent"></div>
        <span className={`ml-3 text-sm ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Processing your file...</span>
      </div>
    )}

    {/* Show uploaded file section after processing */}
    {!isProcessing && uploadedFile && (
      <div className={`${isDarkMode ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'}mt-6 p-4 rounded-lg border`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className={`${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} size={20} />
            <div className="text-left">
              <p className={`font-medium  ${isDarkMode ? 'text-emerald-200' : 'text-emerald-800'}`}>
                {uploadedFile.name}
              </p>
              <p className={`text-sm  ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {formatFileSize(uploadedFile.size)} • Uploaded {uploadedFile.uploadDate.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>

      {/* Download Report Section */}
      {reportGenerated && (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-8 mb-8 transition-colors duration-300`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Download className="text-white" size={20} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Report Generated Successfully
                </h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your ESG risk assessment report is ready for download
                </p>
              </div>
            </div>
            <button
              onClick={downloadReport}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              Download Report
            </button>
          </div>
        </div>
      )}

      {/* Report Display Section */}
      {reportGenerated && (
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}rounded-xl shadow-lg border p-8 transition-colors duration-300`}>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              ESG Risk Assessment Report
            </h3>

            {/* Dynamic Grid for ESG Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {esgAnalysis.map((item, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${
                    item.category === "Environmental"
                      ? "from-green-500 to-emerald-600"
                      : item.category === "Social"
                      ? "from-blue-500 to-cyan-600"
                      : "from-purple-500 to-indigo-600"
                  } rounded-lg p-6 text-white`}
                >
                  <h4 className="text-lg font-semibold mb-2">{item.category} Score</h4>
                  <div className="text-3xl font-bold">{item.risk_percentage}%</div>
                  <p className="text-green-100 text-sm">
                    Weighted Score: {item.score}
                  </p>
                </div>
              ))}
            </div>

          <div className="space-y-6">
            {/* Overall Risk Assessment */}
              <div className="border-l-4 border-blue-500 pl-6">
                <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white mb-2' : 'text-gray-900'}`}>
                  Key Findings
                </h4>
                <ul className={`space-y-2  ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Strong governance frameworks and transparency measures in place</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Environmental impact reporting needs improvement</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Social responsibility initiatives are well-documented</span>
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-500 pl-6">
                <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Recommendations
                </h4>
                <ul className={`space-y-2  ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• Implement comprehensive carbon footprint tracking</li>
                  <li>• Enhance supplier sustainability assessments</li>
                  <li>• Develop clearer ESG performance metrics</li>
                  <li>• Increase stakeholder engagement frequency</li>
                </ul>
              </div>
            </div>

            <div className={`mt-8 p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>Generated:</strong> {new Date().toLocaleString()} • 
                <strong> Document:</strong> {uploadedFile?.name} • 
                <strong> Analysis ID:</strong> ESG-{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
          </div>
        )}
        </>
      }
      />
    </Routes>
      </main>
    </div>
  </Router>
  );
}

export default App;