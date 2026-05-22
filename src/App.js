import React, { useState } from 'react';
import UploadScreen from './components/UploadScreen';
import Dashboard from './components/Dashboard';

export default function App() {
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleData = (parsedResult, name) => {
    setResult(parsedResult);
    setFileName(name);
  };

  const handleReset = () => {
    setResult(null);
    setFileName('');
  };

  if (result) {
    return <Dashboard result={result} fileName={fileName} onReset={handleReset} />;
  }

  return <UploadScreen onData={handleData} />;
}
