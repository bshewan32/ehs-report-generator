// client/src/components/auth/Register.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../features/auth/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    department: ''
  });
  
  const { name, email, password, password2, department } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, error } = useSelector(state => state.auth);
  const [passwordError, setPasswordError] = useState(null);

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
    
    // Clear password match error when they type
    if (e.target.name === 'password' || e.target.name === 'password2') {
      setPasswordError(null);
    }
  };

  const onSubmit = e => {
    e.preventDefault();
    
    if (password !== password2) {
      setPasswordError('Passwords do not match');
    } else {
      dispatch(register({ name, email, password, department }));
    }
  };

  return (
    <div className="register-container">
      <h1>Register</h1>
      <p>Create your account</p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {passwordError && <div className="alert alert-danger">{passwordError}</div>}
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={onChange}
            required
          />
        </div>
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
            minLength="6"
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="password2"
            value={password2}
            onChange={onChange}
            required
            minLength="6"
          />
        </div>
        <div className="form-group">
          <label>Department</label>
          <input
            type="text"
            name="department"
            value={department}
            onChange={onChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      
      <p className="my-1">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </div>
  );
};

export default Register;