import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  CssBaseline,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import {
  People,
  Description,
  Dashboard as DashboardIcon,
  ArrowDropDown,
  Terrain,
  Payments,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLogin } from '../../context/LoginContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useLogin();
  
  // Helper function pentru a verifica dacă ruta e activă
  const isRouteActive = (basePath: string): boolean => {
    return location.pathname === basePath || location.pathname.startsWith(basePath + '/');
  };
  
  // State pentru dropdown menus
  const [arendatoriMenu, setArendatoriMenu] = useState<null | HTMLElement>(null);
  const [contracteMenu, setContracteMenu] = useState<null | HTMLElement>(null);
  const [terenuriMenu, setTerenuriMenu] = useState<null | HTMLElement>(null);
  const [platiArendaMenu, setPlatiArendaMenu] = useState<null | HTMLElement>(null);
  const [aditionaleMenu, setAditionaleMenu] = useState<null | HTMLElement>(null);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menu handlers
  const handleArendatoriClick = (event: React.MouseEvent<HTMLElement>) => {
    setArendatoriMenu(event.currentTarget);
  };
  const handleContracteClick = (event: React.MouseEvent<HTMLElement>) => {
    setContracteMenu(event.currentTarget);
  };
  const handleTerenuriClick = (event: React.MouseEvent<HTMLElement>) => {
    setTerenuriMenu(event.currentTarget);
  };
  const handlePlatiArendaClick = (event: React.MouseEvent<HTMLElement>) => {
    setPlatiArendaMenu(event.currentTarget);
  }
  const handleAditionaleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAditionaleMenu(event.currentTarget);
  }
  const handleClose = () => {
    setArendatoriMenu(null);
    setContracteMenu(null);
    setTerenuriMenu(null);
    setPlatiArendaMenu(null);
    setAditionaleMenu(null);

  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CssBaseline />
      
      {/* Header cu menu horizontal */}
      <AppBar position="fixed">
        <Toolbar>
          {/* Logo */}
          {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Agriculture sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Typography 
              variant="h5" 
              className="app-logo"
              onClick={() => navigate('/')}
            >
              🌾 AgriManager
            </Typography>
          </Box> */}

          {/* Menu horizontal - left side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {/* Dashboard */}
            <Button
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/')}
              sx={{ 
                color: location.pathname === '/' ? 'primary.main' : 'text.primary',
                fontWeight: location.pathname === '/' ? 600 : 400
              }}
            >
              Dashboard
            </Button>

            {/* Arendatori Dropdown */}
            <Button
              startIcon={<People />}
              endIcon={<ArrowDropDown />}
              onClick={handleArendatoriClick}
              sx={{ 
                color: isRouteActive('/arendatori') ? 'primary.main' : 'text.primary',
                fontWeight: isRouteActive('/arendatori') ? 600 : 400
              }}
            >
              Arendatori
            </Button>
            <Menu
              anchorEl={arendatoriMenu}
              open={Boolean(arendatoriMenu)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => handleNavigate('/arendatori')}>
                Vizualizare
              </MenuItem>
              <MenuItem onClick={() => handleNavigate('/arendatori/new/')}>
                Adaugă Arendator
              </MenuItem>
           
            </Menu>

            {/* Contracte Dropdown */}
            <Button
              startIcon={<Description />}
              endIcon={<ArrowDropDown />}
              onClick={handleContracteClick}
              sx={{ 
                color: isRouteActive('/contracte') ? 'primary.main' : 'text.primary',
                fontWeight: isRouteActive('/contracte') ? 600 : 400
              }}
            >
              Contracte
            </Button>
            <Menu
              anchorEl={contracteMenu}
              open={Boolean(contracteMenu)}
              onClose={handleClose}
            >
              {/* <MenuItem onClick={() => handleNavigate('/contracte/list_contracte')}>
                Vizualizare
              </MenuItem> */}
              <MenuItem onClick={() => handleNavigate('/contracte/')}>
                Vizualizare
              </MenuItem>
              <MenuItem onClick={() => handleNavigate('/contracte/new/')}>
                Adaugă Contract
              </MenuItem>
              <MenuItem onClick={() => handleNavigate('/contracte/rapoarte')}>
                Rapoarte
              </MenuItem>
            </Menu>
              {/* Aditionale dropdown */}
              <Button startIcon={<Description />}
              endIcon={<ArrowDropDown />}
              onClick={handleAditionaleClick}
              sx={{ 
                color: isRouteActive('/aditionale') ? 'primary.main' : 'text.primary',
                fontWeight: isRouteActive('/aditionale') ? 600 : 400
              }}
            >
              Aditionale
            </Button>
            <Menu anchorEl={aditionaleMenu}
              open={Boolean(aditionaleMenu)}
              onClose={handleClose}>
              <MenuItem onClick={() => handleNavigate('/aditionale')}>
                Vizualizare
              </MenuItem>
              <MenuItem onClick={() => handleNavigate('/aditionale/new/')}>
                Adaugă Adițional
              </MenuItem>
            </Menu>
            {/* Terenuri Dropdown */}
            <Button
              startIcon={<Terrain />}
              endIcon={<ArrowDropDown />}
              onClick={handleTerenuriClick}
              sx={{ 
                color: isRouteActive('/terenuri') ? 'primary.main' : 'text.primary',
                fontWeight: isRouteActive('/terenuri') ? 600 : 400
              }}
            >
              Terenuri
            </Button>
            
            <Menu
              anchorEl={terenuriMenu}
              open={Boolean(terenuriMenu)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => handleNavigate('/terenuri')}>
                Vizualizare
              </MenuItem>
             
            </Menu>
            <Button startIcon={<Payments />} endIcon={<ArrowDropDown />} onClick={handlePlatiArendaClick}  sx={{ 
                color: isRouteActive('/plati-arenda') ? 'primary.main' : 'text.primary',
                fontWeight: isRouteActive('/plati-arenda') ? 600 : 400
              }}>
              Plăți Arendă
            </Button>
            <Menu  anchorEl={platiArendaMenu}
              open={Boolean(platiArendaMenu)}
              onClose={handleClose}>
            <MenuItem onClick={() => handleNavigate('/plati-arenda')}>
                Vizualizare Plăți Arendă
              </MenuItem>
              <MenuItem onClick={() => handleNavigate('/plati-arenda/pret')}>
                 Seteaza Pret
                 </MenuItem>
            </Menu>
          </Box>

          {/* User Profile & Logout - Right side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto' }}>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              Conectat ca: <strong>{user?.name}</strong>
            </Typography>
            <Button
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ 
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          mt: 8, // Space for AppBar
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};