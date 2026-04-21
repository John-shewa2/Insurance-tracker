import React, { useState } from 'react';
import api from '../api';
import { Search, Trash2, Edit3, UserCheck, Clock, MailCheck } from 'lucide-react';

const ProjectList = ({ projects, fetchProjects, onEdit, role }) => {
  const [search, setSearch] = useState('');

  const handleDelete = async (id) => {
    if (window.confirm("Delete this record permanently?")) {
      try {
        await api.delete(`/api/projects/${id}`);
        fetchProjects();
      } catch (err) { console.error(err); }
    }
  };

  const getDaysLeft = (expiry) => Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));

  const filtered = projects.filter(p => 
    p.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
    p.officerEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mt-8">
      <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
        <Search className="text-gray-400" size={18} />
        <input 
          className="bg-transparent outline-none text-sm w-full" 
          placeholder="Search by Borrower or Officer..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-slate-500 font-bold uppercase text-[10px] border-b">
          <tr>
            <th className="px-6 py-4 text-left">Borrower / Asset</th>
            <th className="px-6 py-4 text-left">Responsible Officer</th>
            <th className="px-6 py-4 text-left">Days Left</th>
            <th className="px-6 py-4 text-left">Status</th>
            {role === 'Officer' && <th className="px-6 py-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y">
          {filtered.map(p => {
            const days = getDaysLeft(p.expiryDate);
            return (
              <tr key={p._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="font-bold">{p.borrowerName}</div>
                  <div className="text-xs text-slate-400">{p.listFixedAsset} ({p.assetCode})</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <UserCheck size={14} className="text-blue-500" />
                    <span className="text-xs">{p.officerEmail}</span>
                  </div>
                </td>
                <td className={`px-6 py-4 font-bold ${days < 0 ? 'text-red-500' : days <= 60 ? 'text-orange-500' : 'text-green-600'}`}>
                  {days < 0 ? 'EXPIRED' : `${days} Days`}
                </td>
                <td className="px-6 py-4">
                   {p.reminder30DaysSent ? <MailCheck size={16} className="text-red-600" /> : <Clock size={16} className="text-blue-500" />}
                </td>
                {role === 'Officer' && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => onEdit(p)} className="text-slate-400 hover:text-blue-600"><Edit3 size={18}/></button>
                      <button onClick={() => handleDelete(p._id)} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectList;