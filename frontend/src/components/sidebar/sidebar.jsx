import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Paper, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddAltTwoToneIcon from '@mui/icons-material/PersonAddAltTwoTone';
import PeopleTwoToneIcon from '@mui/icons-material/PeopleTwoTone';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsTwoToneIcon from '@mui/icons-material/ManageAccountsTwoTone';

export default function Sidebar() {
  const location = useLocation();
  const activePath = location.pathname === '/dashboard' ? '/candidates' : location.pathname;

  // navigation items
  const sections = [
    {
      title: 'Recruitment',
      items: [
        { text: 'Candidates', icon: <PersonAddAltTwoToneIcon />, to: '/candidates' },
      ],
    },
    {
      title: 'Organization',
      items: [
        { text: 'Employees', icon: <PeopleTwoToneIcon />, to: '/employees' },
        { text: 'Attendance', icon: <BarChartIcon />, to: '/attendance' },
        { text: 'Leaves', icon: <LocalOfferIcon />, to: '/leaves' },
      ],
    },
    {
      title: 'Others',
      items: [
        { text: 'Logout', icon: <LogoutIcon />, to: '/logout' },
      ],
    },
  ];

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        px: 2,
        py: 3,
        position: 'fixed',
        top: 0,
        left: 0,
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <Box className="headerBar">
        <Box className="headerContent" mb={4}>
          <ManageAccountsTwoToneIcon fontSize='large' />
        </Box>
      </Box>

      {/* Search field */}
      <Paper
        component="form"
        sx={{ display: 'flex', alignItems: 'center', px: 1, mb: 4, borderRadius: 2, boxShadow: 1 }}
      >
        <SearchIcon color="action" />
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          size='medium'
          placeholder="Search"
          inputProps={{ 'aria-label': 'search' }}
        />
      </Paper>

      {/* Sections */}
      {sections.map((section) => (
        <Box key={section.title} mb={3}>
          <Typography
            variant="subtitle2"
            color="textSecondary"
            sx={{ textTransform: 'uppercase', fontSize: 12, mb: 1 }}
          >
            {section.title}
          </Typography>

          <List disablePadding>
            {section.items.map((item) => {
              const selected = activePath === item.to;
              return (
                <ListItemButton
                  key={item.text}
                  component={Link}
                  to={item.to}
                  selected={selected}
                  sx={{
                    borderRadius: 1,
                    borderRadius: '0 24px 24px 0', 
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      bgcolor: 'rgb(242, 255, 255)', 
                      color: '#1976d2',
                      '& .MuiListItemIcon-root': {
                        color: '#1976d2',             // ensure icon turns dark purple
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: selected ? 'primary.main' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      ))}
    </Box>
  );
};