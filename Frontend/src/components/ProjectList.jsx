import React, { useState } from 'react';
import { Search, Trash2, MailCheck, Clock } from 'lucide-react';
import axios from 'axios';

const ProjectList = ({ projects, fetchProjects }) => {
  const [search, setSearch] = useState('');

  const handleDelete = async (id) => {
    if (window.confirm("Delete this entry?")) {
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

  // FIX: Added optional chaining and empty string fallback to prevent the crash
  const filtered = (projects || []).filter(p => 
    p?.borrowerName?.toLowerCase()?.includes(search.toLowerCase()) || 
    p?.listFixedAsset?.toLowerCase()?.includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        <input 
          className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" 
          placeholder="Search by Borrower Name or Asset..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left font-bold text-gray-600 uppercase">Borrower / Asset</th>
              <th className="px-6 py-4 text-left font-bold text-gray-600 uppercase">Expiry</th>
              <th className="px-6 py-4 text-left font-bold text-gray-600 uppercase">Days Left</th>
              <th className="px-6 py-4 text-left font-bold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? (
              filtered.map(p => {
                const days = getDaysLeft(p.expiryDate);
                return (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{p.borrowerName || 'Unknown Borrower'}</div>
                      <div className="text-gray-500 text-xs">{p.listFixedAsset || 'No Asset Listed'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {p.expiryDate ? new Date(p.expiryDate).toDateString() : 'No Date'}
                    </td>
                    <td className={`px-6 py-4 font-bold ${days < 0 ? 'text-red-500' : days <= 30 ? 'text-orange-500' : 'text-green-600'}`}>
                      {days < 0 ? 'EXPIRED' : `${days} Days`}
                    </td>
                    <td className="px-6 py-4">
                      {p.reminderSent ? (
                        <span className="text-green-600 flex items-center font-medium">
                          <MailCheck size={14} className="mr-1"/> Notified
                        </span>
                      ) : (
                        <span className="text-blue-500 flex items-center font-medium">
                          <Clock size={14} className="mr-1"/> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(p._id)} 
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
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