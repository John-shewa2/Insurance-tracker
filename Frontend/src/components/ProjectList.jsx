import React, { useState } from 'react';
import { Calendar, MailCheck, Trash2, Search, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ProjectList = ({ projects, fetchProjects }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate days remaining
  const getDaysRemaining = (expiryDate) => {
    const diff = new Date(expiryDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axios.delete(`http://localhost:5000/api/projects/${id}`);
        fetchProjects();
      } catch (err) {
        alert("Error deleting project");
      }
    }
  };

  const filteredProjects = projects.filter(p => 
    p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.policyNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by project or policy number..." 
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project / Policy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProjects.map((project) => {
              const daysLeft = getDaysRemaining(project.expiryDate);
              const isUrgent = daysLeft <= 30 && daysLeft > 0;

              return (
                <tr key={project._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{project.projectName}</div>
                    <div className="text-xs text-gray-500">{project.policyNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{new Date(project.expiryDate).toDateString()}</div>
                    <div className={`text-xs font-bold ${daysLeft < 0 ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-green-500'}`}>
                      {daysLeft < 0 ? "Expired" : `${daysLeft} days remaining`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {project.reminderSent ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <MailCheck size={12} className="mr-1"/> Notified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Calendar size={12} className="mr-1"/> Monitoring
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(project._id)}
                      className="text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectList;