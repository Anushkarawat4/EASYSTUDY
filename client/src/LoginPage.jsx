import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './index.css';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        // Navigate to Habit Tracker by default, passing email
        navigate('/habit-tracker', { state: { email: formData.email } });
      } else {
        setErrors(data.errors || { server: 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ server: 'Network error: ' + error.message });
    }
  };

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center p-6">
      <div className="bg-[#fedcfd] rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 rounded bg-white text-black"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-2 rounded bg-white text-black"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
          {errors.server && <p className="text-red-500 text-sm mb-4">{errors.server}</p>}
          <button
            type="submit"
            className="bg-[#f9c7fa] text-black px-6 py-2 rounded w-full mb-2"
          >
            Login
          </button>
        </form>
        <p className="text-center text-sm">
          Don't have an account? <Link to="/register" className="text-blue-500">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;