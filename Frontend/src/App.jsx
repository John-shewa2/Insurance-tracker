import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddProject from './components/AddProject.jsx';
import ProjectList from './components/ProjectList.jsx';

function App() {
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects/all');
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Project Insurance Tracker</h1>
          <p className="text-slate-600">Officer Portal for Automated Renewal Monitoring</p>
        </header>

        <AddProject onProjectAdded={fetchProjects} />
        <ProjectList projects={projects} />
      </div>
    </div>
  );
}

export default App;