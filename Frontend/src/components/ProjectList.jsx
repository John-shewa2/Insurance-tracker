import React, { useState } from 'react';
import { Search, Trash2, MailCheck, Clock, Edit3, UserCheck } from 'lucide-react';
import axios from 'axios';

const ProjectList = ({ projects, fetchProjects, onEdit, role }) => {
  const [search, setSearch] = useState('');

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`http://localhost:5000/api/projects/${id}`);
        fetchProjects();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const getDaysLeft = (expiry) => {
    if (!expiry) return 0;
    const diff = new Date(expiry) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filtered = (projects || []).filter(p => 
    p?.borrowerName?.toLowerCase()?.includes(search.toLowerCase()) || 
    p?.listFixedAsset?.toLowerCase()?.includes(search.toLowerCase()) ||
    p?.assetCode?.toLowerCase()?.includes(search.toLowerCase()) ||
    p?.officerEmail?.toLowerCase()?.includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        <input 
          className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
          placeholder="Search by Borrower, Asset, Code, or Officer Email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left font-bold text-gray-600 uppercase">Borrower / Asset</th>
              <th className="px-6 py-4 text-left font-bold text-gray-600 uppercase">Responsible Officer</th>
              <th className="px-6 py-4 text-left font-bold text-gray-600 uppercase">Expiry</th>
              <th className="px-6 py-4 text-left font-bold text-gray-600 uppercase">Days Left</th>
              <th className="px-6 py-4 text-left font-bold text-gray-600 uppercase">Status</th>
              {role === 'Officer' && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? (
              filtered.map(p => {
                const days = getDaysLeft(p.expiryDate);
                return (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{p.borrowerName || 'Unknown'}</div>
                      <div className="text-gray-500 text-xs flex gap-2">
                        <span>{p.listFixedAsset}</span>
                        {p.assetCode && <span className="bg-slate-100 px-1.5 rounded text-[10px] font-bold border">{p.assetCode}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <UserCheck size={14} className="text-blue-500" />
                        <span className="text-xs font-medium">{p.officerEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {p.expiryDate ? new Date(p.expiryDate).toDateString() : 'No Date'}
                    </td>
                    <td className={`px-6 py-4 font-bold ${days < 0 ? 'text-red-500' : days <= 60 ? 'text-orange-500' : 'text-green-600'}`}>
                      {days < 0 ? 'EXPIRED' : `${days} Days`}
                    </td>
                    <td className="px-6 py-4">
                      {p.reminder30DaysSent ? (
                        <span className="text-red-600 flex items-center font-medium">
                          <MailCheck size={14} className="mr-1"/> Final Notified
                        </span>
                      ) : p.reminder60DaysSent ? (
                        <span className="text-orange-500 flex items-center font-medium">
                          <MailCheck size={14} className="mr-1"/> Warning Sent
                        </span>
                      ) : (
                        <span className="text-blue-500 flex items-center font-medium">
                          <Clock size={14} className="mr-1"/> Monitoring
                        </span>
                      )}
                    </td>
                    {role === 'Officer' && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => onEdit(p)} 
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit Record"
                          >
                            <Edit3 size={18}/>
                          </button>
                          <button 
                            onClick={() => handleDelete(p._id)} 
                            className="text-gray-300 hover:text-red-500 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={role === 'Officer' ? "6" : "5"} className="px-6 py-10 text-center text-gray-400 font-medium">
                  No matching projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectList;