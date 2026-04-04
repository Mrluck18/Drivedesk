import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlarms } from '../../contexts/AlarmContext';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  DirectionsCar,
  Warning,
  Logout,
  Notifications
} from '@mui/icons-material';
import '../../styles/DashboardLayout.css';

const DRAWER_WIDTH = 240;

function DashboardLayout({ children }) {
  // Stato per aprire/chiudere drawer su mobile
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const { unseenCount } = useAlarms();
  const navigate = useNavigate();

  // Toggle drawer mobile
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Funzione logout
  const handleLogout = () => {
    console.log('Logout cliccato');
    logout();
    navigate('/login');
  };

  // Voci menu sidebar
  const menuItems = [
    { text: 'Veicoli', icon: <DirectionsCar />, path: '/dashboard' },
    { text: 'Allarmi', icon: <Warning />, path: '/dashboard/allarmi' }
  ];

  // Contenuto drawer (uguale per mobile e desktop)
  const drawer = (
    <Box>
      {/* Header drawer */}
      <Toolbar>
        <Typography variant="h6" fontWeight="bold">
          DriveDesk
        </Typography>
      </Toolbar>
      
      <Divider />
      
      {/* Menu principale */}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      {/* Logout */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box className="dashboard-root">
      {/* Barra superiore */}
      <AppBar
        position="fixed"
        className="custom-appbar"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          {/* Pulsante menu per mobile */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>

          {/* Badge notifiche allarmi */}
          <IconButton color="inherit" sx={{ mr: 2 }}>
            <Badge badgeContent={unseenCount} color="error" className="notification-badge">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Nome utente */}
          <Typography variant="body2">
            {user?.email} • {user?.ruolo || 'Manager'}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer per mobile (si apre/chiude) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        className="custom-drawer"
        ModalProps={{
          keepMounted: true // migliora performance su mobile (letto su docs)
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Drawer per desktop (sempre aperto) */}
      <Drawer
        variant="permanent"
        className="custom-drawer"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH}
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Contenuto principale della pagina */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { sm: `${DRAWER_WIDTH}px` }, // margine per compensare drawer desktop
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default DashboardLayout;

