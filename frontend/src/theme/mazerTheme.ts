import { createTheme } from '@mui/material/styles';

// Culorile exacte din Mazer template
export const mazerTheme = createTheme({
  palette: {
    primary: {
      main: '#435ebe',      // Mazer blue
      light: '#5a6fd8',
      dark: '#364491',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6c757d',      // Mazer gray
      light: '#868e96',
      dark: '#495057',
    },
    background: {
      default: '#f8f9fa',   // Light gray background
      paper: '#ffffff',     // White cards
    },
    text: {
      primary: '#25396f',   // Dark blue text
      secondary: '#6c757d', // Gray text
    },
    success: {
      main: '#198754',      // Green
    },
    warning: {
      main: '#ffc107',      // Yellow
    },
    error: {
      main: '#dc3545',      // Red
    },
  },
  typography: {
    fontFamily: '"Verdana", "Roboto", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#25396f',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#25396f',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#25396f',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#25396f',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#25396f',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#25396f',
    },
  },
  shape: {
    borderRadius: 8,        // Rounded corners ca în Mazer
  },
  components: {
     MuiCssBaseline: {
    styleOverrides: {
      html: {
        overflowY: 'scroll',
      },
    },
  },
    // Stilizare AppBar ca în Mazer
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#25396f',
          boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
          borderBottom: '1px solid #dee2e6',
        },
      },
    },
    // Stilizare Toolbar
    MuiToolbar: {
      styleOverrides: {
        root: {
          justifyContent: 'space-between',
        },
      },
    },
    // Stilizare butoane ca în Mazer
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
        containedPrimary: {
          backgroundColor: '#435ebe',
          '&:hover': {
            backgroundColor: '#364491',
          },
        },
      },
    },
    // Stilizare input fields ca în Mazer
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#dee2e6',
            },
            '&:hover fieldset': {
              borderColor: '#435ebe',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#435ebe',
            },
          },
          // Font size pentru size="small"
          '&.MuiTextField-sizeSmall .MuiInputBase-input': {
            fontSize: '0.875rem',
          },
          '&.MuiTextField-sizeSmall .MuiInputLabel-root': {
            fontSize: '0.875rem',
          },
        },
      },
    },
    // Stilizare Typography pentru logo
    MuiTypography: {
      variants: [
        {
          props: { className: 'app-logo' },
          style: {
            fontWeight: 600,
            cursor: 'pointer',
            color: '#435ebe',
          },
        },
      ],
    },
    // Stilizare cards ca în Mazer
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
          border: '1px solid #dee2e6',
        },
      },
    },
  },
});