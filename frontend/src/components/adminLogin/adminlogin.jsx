import React, { useState } from 'react';
import './adminlogin.css';
import { Link } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import axios from 'axios';
import { API_URL } from '../../config';

function Adminlogin() {
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [state, setState] = useState({ email: '', password: '' });

  const changeHandler = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log("Login state",state);
    try {
      const res = await axios.post(`${API_URL}/login`, state);
      if (res?.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.user._id);
        window.location = '/candidates';
      }
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || 'Login failed');
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
      {/* Left Image Panel */}
      <div className="loginCard">
        <div className="loginLeft">
            <img
            src="/loginRegister.png"
            alt="Login Illustration"
            />
        </div>
        <div className="loginRight">
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

            <p id="heading">Welcome to Dashboard</p>

            <TextField
                required
                type="email"
                className="txtField"
                name="email"
                label="Email"
                variant="outlined"
                onChange={changeHandler}
            />

            <TextField
                required
                type="password"
                className="txtField"
                name="password"
                label="Password"
                variant="outlined"
                onChange={changeHandler}
            />

            <Button type="submit" variant="contained" className="loginBtn">
                Login
            </Button>

            <div className="loginLink">
                Don’t have an account?
                <Link to="/register">Register</Link>
            </div>
            </form>
        </div>
     </div>
      

    </div>
  );
}

export default Adminlogin;
