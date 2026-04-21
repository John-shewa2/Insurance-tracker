import React, { useState, useEffect } from 'react';
import api from './api';
import AddProject from './components/AddProject';
import ProjectList from './components/ProjectList';
import Login from './components/Login';
import { Plus, LogOut, LayoutDashboard, FileDown, Filter } from 'lucide-react';

function App() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [userName, setUserName] = useState(localStorage.getItem('userName'));

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects/all');
      setProjects(res.data);
      applyFilter(res.data, filterType);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const applyFilter = (data, type) => {
    const today = new Date();
    let result = data;
    if (type === 'critical') {
      result = data.filter(p => {
        const days = Math.ceil((new Date(p.expiryDate) - today) / (1000 * 60 * 60 * 24));
        return days <= 60 && days >= 0;
      });
    } else if (type === 'expired') {
      result = data.filter(p => new Date(p.expiryDate) < today);
    }
    setFilteredProjects(result);
    setFilterType(type);
  };

  useEffect(() => { 
    if (role) fetchProjects(); 
  }, [role]);

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    setUserName(null);
  };

  const handleExport = () => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.open(`${baseURL}/api/projects/export`, '_blank');
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const criticalCount = projects.filter(p => {
    const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 60 && days >= 0;
  }).length;

  const expiredCount = projects.filter(p => new Date(p.expiryDate) < new Date()).length;

  if (!role) {
    return <Login onLoginSuccess={(r) => {
      setRole(r);
      setUserName(localStorage.getItem('userName'));
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Insurance Portal</h1>
              <p className="text-slate-500 text-sm">Welcome, {userName} • <span className="uppercase font-bold text-blue-600">{role}</span></p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700">
              <FileDown size={18} /> Export Report
            </button>
            {role === 'Officer' && !showForm && (
              <button onClick={() => { setEditingProject(null); setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold">
                <Plus size={18} /> Add Record
              </button>
            )}
            <button onClick={handleLogout} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-200">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button onClick={() => applyFilter(projects, 'all')} className={`p-6 rounded-2xl border text-left bg-white ${filterType === 'all' && 'ring-2 ring-blue-500'}`}>
            <div className="text-slate-500 text-xs font-bold uppercase">Total Policies</div>
            <div className="text-3xl font-black">{projects.length}</div>
          </button>
          <button onClick={() => applyFilter(projects, 'critical')} className={`p-6 rounded-2xl border text-left bg-white border-l-4 border-l-orange-500 ${filterType === 'critical' && 'ring-2 ring-orange-500'}`}>
            <div className="text-orange-600 text-xs font-bold uppercase">Critical (60 Days)</div>
            <div className="text-3xl font-black">{criticalCount}</div>
          </button>
          <button onClick={() => applyFilter(projects, 'expired')} className={`p-6 rounded-2xl border text-left bg-white border-l-4 border-l-red-500 ${filterType === 'expired' && 'ring-2 ring-red-500'}`}>
            <div className="text-red-600 text-xs font-bold uppercase">Expired</div>
            <div className="text-3xl font-black">{expiredCount}</div>
          </button>
        </div>
        
        {showForm && (
          <div className="mb-12">
            <AddProject 
              projectToEdit={editingProject}
              onProjectAdded={() => { fetchProjects(); setShowForm(false); }} 
              onCancel={() => setShowForm(false)} 
            />
          </div>
        )}

        <ProjectList projects={filteredProjects} fetchProjects={fetchProjects} onEdit={handleEdit} role={role} />
      </div>
    </div>
  );
}

export default App;