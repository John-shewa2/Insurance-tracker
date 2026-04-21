import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const AddProject = ({ onProjectAdded, onCancel, projectToEdit }) => {
  const [formData, setFormData] = useState({
    borrowerName: '', approvedLoan: '', 
    listFixedAsset: '', isInsured: 'Yes', assetCode: '',
    estimatedValueCollateral: '', estimationDate: '', sumInsured: '',
    insuredDate: '', expiryDate: '', typeInsurancePolicy: '',
    isDBEBeneficiary: 'No', insuranceCompany: '',
    officerEmail: '', directorEmail: '', remark: ''
  });

  useEffect(() => {
    if (projectToEdit) {
      const formatDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';
      setFormData({
        ...projectToEdit,
        estimationDate: formatDate(projectToEdit.estimationDate),
        insuredDate: formatDate(projectToEdit.insuredDate),
        expiryDate: formatDate(projectToEdit.expiryDate),
        remark: projectToEdit.remark || ''
      });
    }
  }, [projectToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(formData.expiryDate) <= new Date(formData.insuredDate)) {
      alert("Error: Expiry date must be after the Insured date.");
      return;
    }

    const cleanedData = {
      ...formData,
      approvedLoan: Number(formData.approvedLoan),
      sumInsured: formData.sumInsured ? Number(formData.sumInsured) : 0,
      estimatedValueCollateral: formData.estimatedValueCollateral ? Number(formData.estimatedValueCollateral) : 0,
      estimationDate: formData.estimationDate || null
    };

    try {
      if (projectToEdit) {
        await axios.put(`http://localhost:5000/api/projects/update/${projectToEdit._id}`, cleanedData);
        alert('Information Updated Successfully');
      } else {
        await axios.post('http://localhost:5000/api/projects/add', cleanedData);
        alert('Project Registered Successfully');
      }
      onProjectAdded();
    } catch (err) {
      console.error("Submission Error:", err.response?.data || err.message);
      alert(`Submission Failed: ${err.response?.data?.error || "Check backend console"}`);
    }
  };

  const inputStyle = "w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none";
  const labelStyle = "text-[11px] font-bold text-slate-500 uppercase mb-1 block";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 relative">
      <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
        <X size={24} />
      </button>
      <h2 className="text-xl font-bold text-slate-800 mb-6">{projectToEdit ? 'Edit Information' : 'New Registration'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-3">
            <h3 className="text-blue-600 font-bold text-xs border-b pb-1">1. LOAN</h3>
            <div><label className={labelStyle}>Borrower</label><input className={inputStyle} value={formData.borrowerName} onChange={(e) => setFormData({...formData, borrowerName: e.target.value})} required /></div>
            <div><label className={labelStyle}>Approved Amt</label><input type="number" className={inputStyle} value={formData.approvedLoan} onChange={(e) => setFormData({...formData, approvedLoan: e.target.value})} required /></div>
          </div>
          <div className="space-y-3">
            <h3 className="text-blue-600 font-bold text-xs border-b pb-1">2. ASSET</h3>
            <div><label className={labelStyle}>Fixed Asset</label><input className={inputStyle} value={formData.listFixedAsset} onChange={(e) => setFormData({...formData, listFixedAsset: e.target.value})} required /></div>
            <div><label className={labelStyle}>Asset Code</label><input className={inputStyle} value={formData.assetCode} onChange={(e) => setFormData({...formData, assetCode: e.target.value})} required /></div>
            <div><label className={labelStyle}>Sum Insured</label><input type="number" className={inputStyle} value={formData.sumInsured} onChange={(e) => setFormData({...formData, sumInsured: e.target.value})} /></div>
          </div>
          <div className="space-y-3">
            <h3 className="text-blue-600 font-bold text-xs border-b pb-1">3. POLICY</h3>
            <div><label className={labelStyle}>Company</label><input className={inputStyle} value={formData.insuranceCompany} onChange={(e) => setFormData({...formData, insuranceCompany: e.target.value})} /></div>
            <div><label className={labelStyle}>DBE Beneficiary?</label>
              <select className={inputStyle} value={formData.isDBEBeneficiary} onChange={(e) => setFormData({...formData, isDBEBeneficiary: e.target.value})}>
                <option value="No">No</option><option value="Yes">Yes</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-blue-600 font-bold text-xs border-b pb-1">4. CONTACT</h3>
            <div><label className={labelStyle}>Insured Date</label><input type="date" className={inputStyle} value={formData.insuredDate} onChange={(e) => setFormData({...formData, insuredDate: e.target.value})} required /></div>
            <div><label className={labelStyle}>Expiry Date</label><input type="date" className={inputStyle} value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} required /></div>
            <div><label className={labelStyle}>Officer Email</label><input type="email" className={inputStyle} value={formData.officerEmail} onChange={(e) => setFormData({...formData, officerEmail: e.target.value})} required /></div>
            <div><label className={labelStyle}>Director Email</label><input type="email" className={inputStyle} value={formData.directorEmail} onChange={(e) => setFormData({...formData, directorEmail: e.target.value})} required /></div>
          </div>
        </div>
        
        <div className="mt-6">
          <label className={labelStyle}>Remark / Additional Notes</label>
          <textarea 
            className={`${inputStyle} h-20 resize-none`} 
            value={formData.remark} 
            onChange={(e) => setFormData({...formData, remark: e.target.value})}
            placeholder="e.g. Vehicle is in repair..."
          />
        </div>

        <div className="mt-8 flex gap-4">
          <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition transform active:scale-95 shadow-lg shadow-blue-200">
            {projectToEdit ? 'Update Changes' : 'Save Information'}
          </button>
          <button type="button" onClick={onCancel} className="px-6 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddProject;