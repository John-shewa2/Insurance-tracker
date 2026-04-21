import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddProject from './components/AddProject';
import ProjectList from './components/ProjectList';
import Login from './components/Login';
import { Plus, LogOut, LayoutDashboard, FileDown, Filter } from 'lucide-react';

function App() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filterType, setFilterType] = useState('all'); // all, critical, expired
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [userName, setUserName] = useState(localStorage.getItem('userName'));

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects/all');
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
    window.open('http://localhost:5000/api/projects/export', '_blank');
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCount = projects.filter(p => new Date(p.expiryDate) > new Date()).length;
  const expiredCount = projects.length - activeCount;
  const criticalCount = projects.filter(p => {
    const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 60 && days >= 0;
  }).length;

  if (!role) {
    return <Login onLoginSuccess={(r) => {
      setRole(r);
      setUserName(localStorage.getItem('userName'));
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg shadow-blue-100">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Insurance Portal</h1>
              <p className="text-slate-500 text-sm flex items-center gap-1">
                Welcome, {userName} <span className="mx-1">•</span> 
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${role === 'Director' ? 'border-purple-200 text-purple-600 bg-purple-50' : 'border-blue-200 text-blue-600 bg-blue-50'}`}>
                  {role}
                </span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleExport}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all transform hover:scale-105 active:scale-95"
            >
              <FileDown size={18} />
              Export Report
            </button>
            {role === 'Officer' && !showForm && (
              <button 
                onClick={() => { setEditingProject(null); setShowForm(true); }}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
              >
                <Plus size={18} />
                Add Record
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button 
            onClick={() => applyFilter(projects, 'all')}
            className={`text-left p-6 rounded-2xl shadow-sm border transition-all ${filterType === 'all' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500' : 'bg-white border-slate-200'}`}
          >
            <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Policies</div>
            <div className="text-3xl font-black text-slate-900">{projects.length}</div>
          </button>
          <button 
            onClick={() => applyFilter(projects, 'critical')}
            className={`text-left p-6 rounded-2xl shadow-sm border border-l-4 border-l-orange-500 transition-all ${filterType === 'critical' ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-500' : 'bg-white border-slate-200'}`}
          >
            <div className="text-orange-600 text-xs font-bold uppercase mb-1 flex items-center gap-1">
              <Filter size={12} /> Critical (Next 60 Days)
            </div>
            <div className="text-3xl font-black text-slate-900">{criticalCount}</div>
          </button>
          <button 
            onClick={() => applyFilter(projects, 'expired')}
            className={`text-left p-6 rounded-2xl shadow-sm border border-l-4 border-l-red-500 transition-all ${filterType === 'expired' ? 'bg-red-50 border-red-200 ring-2 ring-red-500' : 'bg-white border-slate-200'}`}
          >
            <div className="text-red-600 text-xs font-bold uppercase mb-1 flex items-center gap-1">
              <Filter size={12} /> Expired
            </div>
            <div className="text-3xl font-black text-slate-900">{expiredCount}</div>
          </button>
        </div>
        
        {showForm && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
            <AddProject 
              projectToEdit={editingProject}
              onProjectAdded={() => {
                fetchProjects();
                setShowForm(false);
                setEditingProject(null);
              }} 
              onCancel={() => { setShowForm(false); setEditingProject(null); }} 
            />
          </div>
        )}

        <div className="mt-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">
               {filterType === 'all' ? 'All Records' : filterType === 'critical' ? 'Critical Coverage (60 Days)' : 'Expired Policies'}
             </h3>
             {filterType !== 'all' && (
               <button onClick={() => applyFilter(projects, 'all')} className="text-blue-600 text-[10px] font-bold uppercase hover:underline">
                 Clear Filters
               </button>
             )}
          </div>
          <ProjectList 
            projects={filteredProjects} 
            fetchProjects={fetchProjects} 
            onEdit={handleEdit}
            role={role}
          />
        </div>
      </div>
    </div>
  );
}

export default App;