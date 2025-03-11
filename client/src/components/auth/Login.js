// client/src/components/auth/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError, loadUser } from '../../features/auth/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, error } = useSelector(state => state.auth);
  
  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Clear any previous errors
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = e => {
  e.preventDefault();
  console.log('Login attempt with:', formData.email);
  dispatch(login(formData))
    .unwrap()
    .then((result) => {
      console.log('Login success:', result);
      if (localStorage.getItem('token')) {
        console.log('Token found, loading user');
        dispatch(loadUser());
      }
    })
    .catch(err => {
      console.error('Login failed:', err);
    });
};
  
  return (
    <div className="login-container">
      <h1>Login</h1>
      <p>Sign in to access your account</p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
};

export default Login;