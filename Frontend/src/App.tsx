import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Menu, X, Leaf, Moon, Sun, Upload, Download, FileText, Shield, BarChart3 } from 'lucide-react';

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
  const [esgRiskLevel, setEsgRiskLevel] = useState("");

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
  
    setIsProcessing(true); // Show processing indicator
  
    try {
      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 200) {
        const data = response.data;
        console.log("Extracted Text:", data.text);
  
        // Update state with uploaded file details
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date(),
        });
  
        setReportGenerated(true); // Indicate that the report is ready
      } else {
        console.error("Error:", response.data.error);
        alert(`Error: ${response.data.error}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload the file. Please try again.");
    } finally {
      setIsProcessing(false); // Hide processing indicator
    }
  };

  const downloadReport = async () => {
    try {
      // Fetch ESG analysis data from the backend
      const response = await axios.get("http://localhost:5000/api/esg-analysis");
      if (response.status === 200) {
        const analysisData = response.data;
  
        // Format the analysis data into a readable report
        let reportContent = "ESG Risk Assessment Report\n\n";
        reportContent += `Generated on: ${new Date().toLocaleString()}\n\n`;
        reportContent += `Document analyzed: ${uploadedFile?.name}\n\n`;
        reportContent += "Analysis Results:\n";
        analysisData.forEach((item: { category: string; score: number }) => {
          reportContent += `Category: ${item.category}\n`;
          reportContent += `Score: ${item.score}\n\n`;
        });
  
        // Create and download the report file
        const blob = new Blob([reportContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ESG_Risk_Report.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert("Failed to fetch analysis data.");
      }
    } catch (error) {
      console.error("Error fetching analysis data:", error);
      alert("An error occurred while generating the report.");
    }
  };

  const fetchReportData = async () => {
    try {
      const analysisResponse = await axios.get("http://localhost:5000/api/esg-analysis");
      if (analysisResponse.status === 200) {
        setEsgAnalysis(analysisResponse.data);
      }
  
      const riskLevelResponse = await axios.get("http://localhost:5000/api/esg-risk-level");
      if (riskLevelResponse.status === 200) {
        setEsgRiskLevel(riskLevelResponse.data.risk_level);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    const fetchEsgAnalysis = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/esg-analysis");
        if (response.status === 200) {
          setEsgAnalysis(response.data.map((item: { category: string; score: number; risk_percentage: number }) => ({
            category: item.category,
            score: item.score,
            risk_percentage: item.risk_percentage,
          })));
        } else {
          console.error("Failed to fetch ESG analysis data.");
        }
      } catch (error) {
        console.error("Error fetching ESG analysis data:", error);
      }
    };
  
    fetchEsgAnalysis();
  }, []);
  // ...existing code...

return (
  <div className={`flex flex-col min-h-screen max-w-full transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
    {/* Navigation Bar */}
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
  {/* on lg: take the whole width instead of a centred 7‑xl box */}
  <div className="mx-auto max-w-7xl lg:max-w-none lg:w-full px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* ───── Left section ───── */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300
                     hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
            <Leaf className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              ESG Risk Assessment
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Environmental • Social • Governance
            </p>
          </div>
        </div>
      </div>

      {/* ───── Right section ───── */}
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-lg text-gray-600 dark:text-gray-300
                   hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  </div>
</nav>


    {/* ESG Background Image */}
   <div
  className="h-64 w-full bg-cover bg-center object-cover lg:h-96"
  style={{
    backgroundImage: `url('/esgimg1.avif')`,
  }}
>
</div>


    {/* Sidebar Overlay */}
    {isSidebarOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={toggleSidebar}
      />
    )}

    {/* Sidebar */}
    <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
            <Leaf className="text-white" size={20} />
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">ESG Portal</span>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-3 space-y-2">
          <a href="#" className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <BarChart3 size={20} className="mr-3" />
            Dashboard
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <Shield size={20} className="mr-3" />
            About
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <FileText size={20} className="mr-3" />
            Help
          </a>
        </div>
      </nav>
    </div>

    {/* Main Content */}
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Risk Assessment Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your documents to analyze ESG compliance and generate comprehensive risk reports
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8 transition-colors duration-300">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
              <Upload className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Upload Document for Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Supported formats: PDF, DOC, DOCX, TXT
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors duration-200">
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
              <FileText className="text-gray-400 dark:text-gray-500 mb-3" size={48} />
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Click to upload or drag and drop
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Maximum file size: 50MB
              </span>
            </label>
          </div>

          {uploadedFile && (
            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="text-emerald-600 dark:text-emerald-400" size={20} />
                  <div className="text-left">
                    <p className="font-medium text-emerald-800 dark:text-emerald-200">
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      {formatFileSize(uploadedFile.size)} • Uploaded {uploadedFile.uploadDate.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {isProcessing && (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent"></div>
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">Processing...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Download Report Section */}
      {reportGenerated && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Download className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Report Generated Successfully
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-300">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              ESG Risk Assessment Report
            </h3>
            
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
              <div className="border-l-4 border-emerald-500 pl-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Overall Risk Assessment
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Based on the analysis of your submitted document, the overall ESG risk level is classified as <strong className="text-emerald-600 dark:text-emerald-400">MEDIUM</strong>.
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">85% Compliance Rate</span>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Key Findings
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
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
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Recommendations
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Implement comprehensive carbon footprint tracking</li>
                  <li>• Enhance supplier sustainability assessments</li>
                  <li>• Develop clearer ESG performance metrics</li>
                  <li>• Increase stakeholder engagement frequency</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Generated:</strong> {new Date().toLocaleString()} • 
                <strong> Document:</strong> {uploadedFile?.name} • 
                <strong> Analysis ID:</strong> ESG-{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;