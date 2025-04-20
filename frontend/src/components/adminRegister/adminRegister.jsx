import React, { useState } from 'react';
import './adminRegister.css';
import { Link } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import axios from 'axios';
import { API_URL } from '../../config';

function AdminRegister() {
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [state, setState] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const changeHandler = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (state.password !== state.confirmPassword) {
      setErrorMsg('Passwords do not match');
      setShowError(true);
      return;
    }
    console.log("register state",state);
    
    try {
      const res = await axios.post(`${API_URL}/register`, state);
      if (res?.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.user._id);
        window.location = '/candidates';
      }
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || 'Registration failed');
      setShowError(true);
    }
  };

  const handleClose = (_, reason) => {
    if (reason !== 'clickaway') {
      setShowError(false);
    }
  };

  return (
    <div className="adminContainer">
      <div className="registerCard">
        <div className="registerLeft">
          <img
            src="/loginRegister.png"
            alt="Register Illustration"
          />
        </div>
        <div className="registerRight">
          <form onSubmit={submitHandler}>
            {showError && (
              <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={showError}
                onClose={handleClose}
                autoHideDuration={3000}
                TransitionComponent={Slide}
              >
                <MuiAlert onClose={handleClose} variant="filled" severity="error">
                  {errorMsg}
                </MuiAlert>
              </Snackbar>
            )}

            <p id="registerHeading">Welcome to Dashboard</p>

            <TextField
              required
              fullWidth
              className="txtField"
              label="Full Name"
              name="name"
              value={state.fullName}
              onChange={changeHandler}
              variant="outlined"
            />

            <TextField
              required
              fullWidth
              className="txtField"
              label="Email Address"
              name="email"
              type="email"
              value={state.email}
              onChange={changeHandler}
              variant="outlined"
            />

            <TextField
              required
              fullWidth
              className="txtField"
              label="Password"
              name="password"
              type="password"
              value={state.password}
              onChange={changeHandler}
              variant="outlined"
            />

            <TextField
              required
              fullWidth
              className="txtField"
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={state.confirmPassword}
              onChange={changeHandler}
              variant="outlined"
            />

            <Button type="submit" variant="contained" className="registerBtn">
              Register
            </Button>

            <div className="registerLink">
              Already have an account?
              <Link to="/"> Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
