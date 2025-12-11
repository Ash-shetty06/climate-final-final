import React, { useState } from 'react';

const AuthModal = ({ onClose, onAuthenticated }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://10.13.130.39:4000';
  const API_OPTIONS = { credentials: 'include' };

  const handleRegister = async () => {
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setError('Registration successful. Please login with the same credentials.');
      setMode('login');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      // Show success message
      setSuccess(`✓ Login successful! Welcome ${data.user.email}`);
      setTimeout(() => {
        onAuthenticated(data.user);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'login') handleLogin(); else handleRegister();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-[min(92%,420px)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{mode === 'login' ? 'Login' : 'Register'}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md" />
          </div>
          {mode === 'login' && (
            <div>
              <label className="text-sm text-slate-600">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
          {success && <div className="text-sm text-green-600 font-semibold mb-3">{success}</div>}

          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md">{loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Register')}</button>
            <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="px-4 py-2 border rounded-md">{mode === 'login' ? 'Switch to Register' : 'Switch to Login'}</button>
            <button type="button" onClick={onClose} className="ml-auto text-sm text-slate-600">Cancel</button>
          </div>
        </form>
        <p className="text-xs text-slate-500 mt-3">This demo stores authentication in an httpOnly cookie for improved security.</p>
      </div>
    </div>
  );
};

export default AuthModal;
