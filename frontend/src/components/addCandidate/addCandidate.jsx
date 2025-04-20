import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  IconButton,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';
import { Typography } from '@mui/material';
import { NotificationManager } from 'react-notifications';
import { API_URL } from '../../config';
import './addCandidate.css';

export default function AddCandidateModal({ open, onClose, onSave, token}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    resume: null,
    agreed: false
  });

  const handleChange = e => {
    const { name, value, type, checked, files } = e.target;
    setForm(f => ({
      ...f,
      [name]:
        type === 'file'
          ? files[0]
          : type === 'checkbox'
          ? checked
          : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { name, email, phone, position, experience, resume, agreed } = form;
    if (!name || !email || !phone || !position || !experience || !resume || !agreed) {
      NotificationManager.error('Please fill all fields and upload resume', 'Validation');
      return;
    }

    const data = new FormData();
    data.append('name', name);
    data.append('email', email);
    data.append('phone', phone);
    data.append('position', position);
    data.append('experience', experience);
    data.append('resume', resume);

    try {
      await axios.post(`${API_URL}/add_candidate`, data, {
        headers: {
          authorization: token,
          'Content-Type': 'multipart/form-data'
        }
      });
      NotificationManager.success('Candidate added successfully', 'Success');
      onSave();       // notify parent to refresh list
      onClose();
      setForm({ name:'',email:'',phone:'',position:'',experience:'',resume:null,agreed:false });
    } catch (err) {
        console.log("err",err);
        
      NotificationManager.error(err.response?.data?.message || 'Add candidate failed', 'Error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ className: 'addCandidateDialog' }}>
      <DialogTitle className="dialogHeader">
        Add New Candidate
        <IconButton className="closeBtn" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} className="candidateForm">
          <Grid container spacing={2}>
            {[
              { name: 'name', label: 'Full Name' },
              { name: 'email', label: 'Email Address', type: 'email' },
              { name: 'phone', label: 'Phone Number' },
              { name: 'position', label: 'Position' },
              { name: 'experience', label: 'Experience (years)' }
            ].map(field => (
              <Grid item xs={12} md={6} key={field.name}>
                <TextField
                  fullWidth
                  name={field.name}
                  label={`${field.label}`}
                  type={field.type || 'text'}
                  value={form[field.name]}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>
            ))}

            <Grid item xs={12} md={6}>
            <Box className="resumeUpload">
                <input
                id="resume-input"
                name="resume"
                type="file"
                accept="application/pdf"
                onChange={handleChange}
                required
                style={{ display: 'none' }}
                />
                <label htmlFor="resume-input" className="uploadLabel">
                Resume (PDF)
                <UploadFileIcon className="uploadIcon" />
                </label>
                {form.resume && (
                <Typography variant="body2" className="fileName">
                    {form.resume.name}
                </Typography>
                )}
            </Box>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreed"
                    checked={form.agreed}
                    onChange={handleChange}
                  />
                }
                label="I hereby declare that the above information is true to the best of my knowledge."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions className="dialogFooter">
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            !form.name ||
            !form.email ||
            !form.phone ||
            !form.position ||
            !form.experience ||
            !form.resume ||
            !form.agreed
          }
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
