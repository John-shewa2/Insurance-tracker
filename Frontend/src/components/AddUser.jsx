import React, { useState } from 'react';
import api from '../api';
import { X, UserPlus } from 'lucide-react';

const AddUser = ({ onCancel }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Officer' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await api.post('/api/auth/register', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("User Registered Successfully");
            onCancel();
        } catch (err) {
            alert(err.response?.data?.error || "Registration failed");
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border relative max-w-md mx-auto">
            <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400"><X size={24}/></button>
            <div className="flex items-center gap-3 mb-6">
                <UserPlus className="text-blue-600" />
                <h2 className="text-xl font-bold">Register New User</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input className="w-full border p-3 rounded-lg" placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input className="w-full border p-3 rounded-lg" type="email" placeholder="Email Address" onChange={e => setFormData({...formData, email: e.target.value})} required />
                <input className="w-full border p-3 rounded-lg" type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} required />
                <select className="w-full border p-3 rounded-lg bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="Officer">Officer</option>
                    <option value="Director">Director</option>
                    <option value="Admin">Admin</option>
                </select>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">Create Account</button>
            </form>
        </div>
    );
};

export default AddUser;