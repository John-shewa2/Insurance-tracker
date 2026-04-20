import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddProject from './components/AddProject';
import ProjectList from './components/ProjectList';
import { Plus } from 'lucide-react';

function App() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects/all');
      setProjects(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Insurance Portal</h1>
            <p className="text-slate-500">Automated Loan & Asset Coverage Monitoring</p>
          </div>
          
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
            >
              <Plus size={20} />
              Add Project Information
            </button>
          )}
        </header>
        
        {showForm && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
            <AddProject 
              onProjectAdded={() => {
                fetchProjects();
                setShowForm(false); // Hide form after success
              }} 
              onCancel={() => setShowForm(false)} 
            />
          </div>
        )}

        <div className="mt-8">
          <ProjectList projects={projects} fetchProjects={fetchProjects} />
        </div>
      </div>
    </div>
  );
}

export default App;