import React from 'react';

interface HelpProps {
  isDarkMode: boolean;
}

const Help: React.FC<HelpProps> = ({ isDarkMode }) => {
  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <h1 className="text-2xl font-bold">Help</h1>
      <p>If you need assistance, please contact support or refer to the documentation.</p>
    </div>
  );
};

export default Help;