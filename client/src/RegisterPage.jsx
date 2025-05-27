import './index.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|yahoo\.com|ac\.in|edu\.in|org|edu)$/;
    const phoneRegex = /^\d{10}$/;

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.password = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      console.log('Sending request with data:', formData);
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        setErrors(data.errors || { server: `Registration failed: ${response.status} ${response.statusText}` });
        return;
      }

      alert(data.message);
      navigate('/login');
    } catch (error) {
      console.error('Network error details:', error);
      setErrors({ server: `Network error: ${error.message}` });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="min-h-screen bg-grid flex flex-col p-6">
      {/* Header with Background */}
      <div className="flex items-center justify-between">
        <div className="w-full flex items-center space-x-4 bg-[#fedcfd] rounded-lg px-4 py-2">
          <div className="w-12 h-12 bg-[#e0bffb] rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="purple app icon_(credits to owner).jpg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-4xl tracking-wider text-center w-full">STUDY-EASY</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center mt-10">
        <div className="bg-[#fedcfd] rounded-lg p-6 w-64 text-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-sm">
              <img src="download (1).jpg" alt="" />
            </span>
          </div>
          <h2 className="text-2xl mb-4">REGISTER</h2>
          <div className="mb-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white text-black"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white text-black"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white text-black"
              pattern="[0-9]*"
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) e.preventDefault();
              }}
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>
          <div className="mb-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white text-black"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
          <div className="mb-4">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>
          {errors.server && <p className="text-red-500 text-sm mb-4">{errors.server}</p>}
          <button
            onClick={handleSubmit}
            className="bg-[#f9c7fa] text-black px-6 py-2 rounded w-full mb-2"
          >
            SUBMIT
          </button>
          <p className="text-sm">
            Already a user? <Link to="/login" className="underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;