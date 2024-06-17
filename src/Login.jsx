import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const loginResponse = await axios.post(
        '/api/accounts/login',
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      localStorage.setItem("bearerToken",loginResponse.data.access_token)

      const bearerToken = loginResponse.data.access_token;
      console.log('Login response:', loginResponse.data);

      // Second API call to get the organization ID using the bearer token
      const orgResponse = await axios.get(
        '/api/accounts/api/me',
        { headers: { 'Authorization': `Bearer ${bearerToken}` } }
      );

      const orgId = orgResponse.data.user.organization.id;
      localStorage.setItem("orgId",orgId)
      console.log('Organization ID response:', orgResponse.data.user.organization);

      // Third API call to get environments using the organization ID
      const envResponse = await axios.get(
        `/api/accounts/api/organizations/${orgId}/environments`,
        { headers: { 'Authorization': `Bearer ${bearerToken}` } }
      );
      const envId = envResponse.data.data[1].id;
      localStorage.setItem("envId",envResponse.data.data[1].id);
      console.log('Environments response:', envResponse.data.data[1].id);

      // Store tokens and IDs in local storage
      localStorage.setItem('bearerToken', bearerToken);
      localStorage.setItem('orgId', orgId);
      localStorage.setItem('envId', envId);

      // Redirect to the /dashboard endpoint on successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

