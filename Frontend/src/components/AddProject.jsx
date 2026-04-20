import React, { useState } from 'react';
import axios from 'axios';

const AddProject = ({ onProjectAdded }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    policyNumber: '',
    officerEmail: '',
    directorEmail: '',
    startDate: '',
    expiryDate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/projects/add', formData);
      alert('Project Registered Successfully!');
      setFormData({ projectName: '', policyNumber: '', officerEmail: '', directorEmail: '', startDate: '', expiryDate: '' });
      onProjectAdded(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert('Error saving project.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-bold mb-4 text-slate-700">Register New Insurance</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="Project Name" className="border p-2 rounded" value={formData.projectName} onChange={(e) => setFormData({...formData, projectName: e.target.value})} required />
        <input type="text" placeholder="Policy Number" className="border p-2 rounded" value={formData.policyNumber} onChange={(e) => setFormData({...formData, policyNumber: e.target.value})} required />
        <input type="email" placeholder="Officer Email" className="border p-2 rounded" value={formData.officerEmail} onChange={(e) => setFormData({...formData, officerEmail: e.target.value})} required />
        <input type="email" placeholder="Director Email (CC)" className="border p-2 rounded" value={formData.directorEmail} onChange={(e) => setFormData({...formData, directorEmail: e.target.value})} required />
        <div>
          <label className="text-xs text-gray-500 block">Start Date</label>
          <input type="date" className="border p-2 rounded w-full" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">Expiry Date</label>
          <input type="date" className="border p-2 rounded w-full" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} required />
        </div>
        <button type="submit" className="md:col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">Save Project</button>
      </form>
    </div>
  );
};

export default AddProject;