import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../sidebar/sidebar';
import AddCandidateModal from '../addCandidate/addCandidate';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  InputBase,
  IconButton,
  Menu
} from '@mui/material';
import {
  PersonAddAltTwoTone as PersonAddAltIcon,
  
  Search as SearchIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { ThreeDots } from 'react-loader-spinner';
import { API_URL } from '../../config';
import { NotificationManager } from 'react-notifications';
import ManageAccountsTwoToneIcon from '@mui/icons-material/ManageAccountsTwoTone';
import './employee.css';
import { Link } from 'react-router-dom';

export default function Employee({ token , userData}) {
  // state
  const [candidates, setCandidates]       = useState([]);
  const [loading, setLoading]             = useState(false);
  const [pageCount, setPageCount]         = useState(0);
  const [currentPage, setCurrentPage]     = useState(1);
  const [statusFilter, setStatusFilter]   = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [positionOptions, setPositionOptions] = useState([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [addModalOpen, setAddModalOpen]   = useState(false);
  const [menuAnchorEl, setMenuAnchorEl]   = useState(null);
  const [menuCandidate, setMenuCandidate] = useState(null);
  const [openDialog, setOpenDialog]       = useState(false);
  const [deleteId, setDeleteId]           = useState(null);

  // fetch
  const fetchData = async page => {
    setLoading(true);
    const params = { page };
    if (statusFilter && statusFilter != "all")   params.status   = statusFilter;
    if (positionFilter && positionFilter != "all") params.position = positionFilter;
    if (searchQuery)    params.search   = searchQuery;
    try {
      const { data } = await axios.get(`${API_URL}/candidates`, {
        params,
        headers: { authorization: token }
      });
      setCandidates(data.results);
      setPageCount(Math.ceil(data.count / 10));
    } catch {
      NotificationManager.error('Error loading candidates','Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios.get(`${API_URL}/candidates/metadata`, {
      headers: { authorization: token }
    })
    .then(r => {
      setPositionOptions(r.data.positions);
    })
    .catch(() => {
      NotificationManager.error('Failed to load dropdowns','Error');
    });
  }, []);

  // initial + deps
  useEffect(() => { fetchData(currentPage); }, [currentPage, statusFilter, positionFilter, searchQuery]);

  // debounced search
  const debouncedSearch = useMemo(
    () => debounce(e => setSearchQuery(e.target.value), 300),
    []
  );

  // action menu
  const openMenu = (e, cand) => {
    setMenuAnchorEl(e.currentTarget);
    setMenuCandidate(cand);
  };
  const closeMenu = () => {
    setMenuAnchorEl(null);
    setMenuCandidate(null);
  };
  const downloadResume = async () => {
    if (!menuCandidate) return;
    try {
      const res = await axios.get(
        `${API_URL}/candidates/${menuCandidate._id}/resume`,
        {
          headers: { authorization: token },
          responseType: 'blob'
        }
      );
      const url = URL.createObjectURL(new Blob([res.data], { type:'application/pdf' }));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `resume-${menuCandidate.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      NotificationManager.error('Download failed','Error');
    } finally {
      closeMenu();
    }
  };
  const deleteFromMenu = () => {
    setDeleteId(menuCandidate._id);
    setOpenDialog(true);
    closeMenu();
  };
  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/candidates/${deleteId}`, {
        headers: { authorization: token }
      });
      NotificationManager.success('Deleted','Success');
      fetchData(currentPage);
    } catch {
      NotificationManager.error('Delete failed','Error');
    } finally {
      setOpenDialog(false);
    }
  };

  // add‑modal
  const handleModalSave = () => {
    fetchData(currentPage);
    setAddModalOpen(false);
  };

  const statusColor = {
    new: '#4B0082',       // purple
    scheduled: '#FFBF00', // yellow
    ongoing: '#4CAF50',   // green
    selected: '#4B0082',  // purple
    rejected: '#F44336'   // red
  };

  const handleUpdateStatus = async (e,c) => {
    const newStatus = e.target.value;
    try {
      await axios.patch(
        `${API_URL}/candidates/${c._id}/status`,
        { status: newStatus },
        { headers: { authorization: token } }
      );
      NotificationManager.success('Status updated', 'Success');
      fetchData(currentPage);
    } catch {
      NotificationManager.error('Update failed','Error');
    }
  }

  return (
    <div className="dashboardRoot">
      {/* fixed-width sidebar */}
      
      <aside className="sidebar">
        <Sidebar />
      </aside>
      {/* flexible main content */}
      <section className="mainContent">
        <section className="navbarContainer">
          <h2 className="pageTitle">Employees</h2>
            <Link to={`/profile/${userData?._id}`}>
              <Button style={{ "marginRight": "10px" }} variant="outlined" startIcon={<ManageAccountsTwoToneIcon />}>
                    Profile
                </Button>
            </Link>
          </section>
        <div className="toolbar">
          <FormControl size="small">
            <InputLabel>Status</InputLabel>
            <Select
              id='positionClass'
              value={statusFilter}
              label="Status"
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="ongoing">Ongoing</MenuItem>
              <MenuItem value="selected">Selected</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Position</InputLabel>
            <Select
            id='positionClass'
              value={positionFilter}
              label="Position"
              onChange={e => { setPositionFilter(e.target.value); setCurrentPage(1); }}
            >
              <MenuItem value="all">All</MenuItem>
            {positionOptions.map(p => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
            </Select>
          </FormControl>

          <div className="searchBox">
            <SearchIcon />
            <InputBase placeholder="Search…" onChange={debouncedSearch} />
          </div>

          <Button
            variant="contained"
            startIcon={<PersonAddAltIcon />}
            onClick={() => setAddModalOpen(true)}
          >
            Add Candidate
          </Button>
        </div>

        <div className="tableWrapper">
          <table>
            <thead>
              <tr>
                <th>Sr.</th><th>Name</th><th>Email</th>
                <th>Phone</th><th>Position</th><th>Status</th>
                <th>Experience</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={8}><ThreeDots height={24} width={100} /></td></tr>
                : candidates.map((c,i) => (
                  <tr key={c._id}>
                    <td>{(currentPage-1)*10 + i + 1}</td>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>{c.position}</td>
                    <td>
                          {/* <-- Status Select with PATCH onChange --> */}
                          <Select
                            size="small"
                            value={c.status || 'new'}
                            onChange={e => handleUpdateStatus(e,c)}
                            sx={{
                              textTransform: 'capitalize',
                              color: statusColor[c.status || 'new'],
                              '& .MuiSelect-icon': {
                                color: statusColor[c.status || 'new']
                              }
                            }}
                          >
                            <MenuItem value="new">New</MenuItem>
                            <MenuItem value="scheduled">Scheduled</MenuItem>
                            <MenuItem value="ongoing">Ongoing</MenuItem>
                            <MenuItem value="selected">Selected</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                          </Select>
                        </td>
                    <td>{c.experience}</td>
                    <td>
                      <IconButton size="small" onClick={e => openMenu(e,c)}>
                        <MoreVertIcon />
                      </IconButton>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        <div className="paginationWrapper">
          <Pagination
            count={pageCount}
            page={currentPage}
            onChange={(e,v) => setCurrentPage(v)}
          />
        </div>

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={closeMenu}
          anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
          transformOrigin={{ vertical:'top',    horizontal:'right' }}
        >
          <MenuItem onClick={downloadResume}>Download Resume</MenuItem>
          <MenuItem onClick={deleteFromMenu}>Delete Candidate</MenuItem>
        </Menu>

        <Dialog open={openDialog} onClose={()=>setOpenDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This will permanently remove the candidate.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setOpenDialog(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error">Delete</Button>
          </DialogActions>
        </Dialog>

        <AddCandidateModal
          open={addModalOpen}
          onClose={()=>setAddModalOpen(false)}
          onSave={handleModalSave}
          token={token}
        />
      </section>
    </div>
  );
}
