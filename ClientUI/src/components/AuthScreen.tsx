import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import CONFIG from "../config/config"

interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
}


const AuthComponent: React.FC = ( {setToken}) => {
  const [isSignup, setIsSignup] = useState<boolean>(true);
  const [backendUrl, setBackendUrl] = useState<string>(CONFIG.BACKEND_URI);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    username: '',
    email: '',
    password: ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!backendUrl) {
      alert('Application not properly configured. Missing backend URL.');
      return;
    }

    const endpoint = isSignup ? '/auth/signup' : '/auth/login';
    const payload = isSignup 
      ? { name: formData.name, username: formData.username, email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password };

    try {
      console.log('Sending request to:', `${backendUrl}${endpoint}`); // Debug log
      const response = await axios.post(`${backendUrl}${endpoint}`, payload);
      if (!isSignup) {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token)
        
      }
      alert(`Successfully ${isSignup ? 'signed up' : 'logged in'}!`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              console.error('Bad Request:', error.response.data);
              alert('Invalid input. Please check your data.');
              break;
            case 401:
              console.error('Unauthorized:', error.response.data);
              alert('Authentication failed. Please check your email and password.');
              break;
            case 409:
              console.error('Conflict:', error.response.data);
              alert('User already exists. Please log in.');
              break;
            default:
              console.error('An error occurred:', error.response.data);
              alert('An error occurred. Please try again later.');
          }
        } else {
          console.error('No response received:', error.message);
          alert('No response from the server. Please try again later.');
        }
      } else {
        console.error('Error during request setup:', error.message);
        alert('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">{isSignup ? 'Sign Up' : 'Log In'}</h2>
          <form onSubmit={handleSubmit}>
            {isSignup && (
              <>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  className="input input-bordered w-full mb-2"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="input input-bordered w-full mb-2"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </>
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="input input-bordered w-full mb-2"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="input input-bordered w-full mb-2"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <button type="submit" className="btn btn-primary w-full mb-2">
              {isSignup ? 'Sign Up' : 'Log In'}
            </button>
          </form>
          <button 
            className="link link-primary" 
            onClick={() => setIsSignup((prev) => !prev)}
          >
            {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;