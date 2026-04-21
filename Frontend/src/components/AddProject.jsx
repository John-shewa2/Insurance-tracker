import React, { useState, useEffect } from 'react';
import api from '../api';
import { X } from 'lucide-react';

const AddProject = ({ onProjectAdded, onCancel, projectToEdit }) => {
  const [formData, setFormData] = useState({
    borrowerName: '', approvedLoan: '', listFixedAsset: '', assetCode: '',
    sumInsured: '', insuredDate: '', expiryDate: '', insuranceCompany: '',
    isDBEBeneficiary: 'No', officerEmail: '', directorEmail: '', remark: ''
  });

  useEffect(() => {
    if (projectToEdit) {
      const formatDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';
      setFormData({
        ...projectToEdit,
        insuredDate: formatDate(projectToEdit.insuredDate),
        expiryDate: formatDate(projectToEdit.expiryDate),
        remark: projectToEdit.remark || ''
      });
    }
  }, [projectToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedData = {
      ...formData,
      approvedLoan: Number(formData.approvedLoan),
      sumInsured: Number(formData.sumInsured)
    };

    try {
      if (projectToEdit) {
        await api.put(`/api/projects/update/${projectToEdit._id}`, cleanedData);
      } else {
        await api.post('/api/projects/add', cleanedData);
      }
      onProjectAdded();
    } catch (err) {
      alert("Submission error. Check console.");
    }
  };

  const inputStyle = "w-full border p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500";
  const labelStyle = "text-[11px] font-bold text-slate-500 uppercase mb-1 block";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border relative">
      <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400"><X size={24}/></button>
      <h2 className="text-xl font-bold mb-6">{projectToEdit ? 'Edit Record' : 'New Registration'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-3">
            <label className={labelStyle}>Borrower Name</label>
            <input className={inputStyle} value={formData.borrowerName} onChange={e => setFormData({...formData, borrowerName: e.target.value})} required />
            <label className={labelStyle}>Approved Amount</label>
            <input type="number" className={inputStyle} value={formData.approvedLoan} onChange={e => setFormData({...formData, approvedLoan: e.target.value})} required />
          </div>
          <div className="space-y-3">
            <label className={labelStyle}>Asset Type</label>
            <input className={inputStyle} value={formData.listFixedAsset} onChange={e => setFormData({...formData, listFixedAsset: e.target.value})} required />
            <label className={labelStyle}>Asset Code</label>
            <input className={inputStyle} value={formData.assetCode} onChange={e => setFormData({...formData, assetCode: e.target.value})} required />
          </div>
          <div className="space-y-3">
            <label className={labelStyle}>Insured Date</label>
            <input type="date" className={inputStyle} value={formData.insuredDate} onChange={e => setFormData({...formData, insuredDate: e.target.value})} required />
            <label className={labelStyle}>Expiry Date</label>
            <input type="date" className={inputStyle} value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} required />
          </div>
          <div className="space-y-3">
            <label className={labelStyle}>Officer Email</label>
            <input type="email" className={inputStyle} value={formData.officerEmail} onChange={e => setFormData({...formData, officerEmail: e.target.value})} required />
            <label className={labelStyle}>Director Email</label>
            <input type="email" className={inputStyle} value={formData.directorEmail} onChange={e => setFormData({...formData, directorEmail: e.target.value})} required />
          </div>
        </div>
        <div className="mt-6">
          <label className={labelStyle}>Remarks</label>
          <textarea className={`${inputStyle} h-20`} value={formData.remark} onChange={e => setFormData({...formData, remark: e.target.value})} />
        </div>
        <button type="submit" className="mt-8 w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-blue-700">Save Record</button>
      </form>
    </div>
  );
};

export default AddProject;