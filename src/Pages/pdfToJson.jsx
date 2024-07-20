import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/convert', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setJsonData(response.data);
    } catch (error) {
      console.error('Error converting PDF to JSON:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF to JSON Converter</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input type="file" onChange={handleFileChange} className="mb-2" />
        <button
          type="submit"
          className={`px-4 py-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-500 text-white'}`}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Convert'}
        </button>
      </form>
      {jsonData && (
        <div>
          <h2 className="text-xl font-bold mb-2">Converted JSON:</h2>
          <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
