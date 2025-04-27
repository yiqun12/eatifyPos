import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import PasswordIcon from '@mui/icons-material/Password';
import GoogleIcon from '@mui/icons-material/Google';
import PersonIcon from '@mui/icons-material/Person';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import './button.css';
import { Row, Col, Container } from "react-bootstrap"
import * as React from 'react';
import { useRef } from "react";
import { useUserContext } from "../context/userContext";
import Navbar from './Navbar'
import { useState, useEffect } from 'react';
import { useMyHook } from './myHook';

// 创建自定义主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B00', // 暖橙色主题
      light: '#FF8533',
      dark: '#CC5500',
    },
    secondary: {
      main: '#FFA500', // 橙色作为次要颜色
      light: '#FFB733',
      dark: '#CC8400',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 16px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Static translation object
const translations = {
  en: {
    signIn: 'Sign in',
    email: 'Email Address',
    password: 'Password',
    signInButton: 'SIGN IN',
    googleSignIn: 'Google Sign in',
    guestSignIn: 'One Time Sign in',
    resetPassword: 'Reset password',
    loading: 'Loading...',
  },
  zh: {
    signIn: '登录',
    email: '电子邮件地址',
    password: '密码',
    signInButton: '登录',
    googleSignIn: '谷歌登录',
    guestSignIn: '一次性登录',
    resetPassword: '重置密码',
    loading: '加载中...',
  },
};


export default function SignIn() {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);
  const [isTrue, setIsTrue] = React.useState(false);
  const [errorVisibility, setErrorVisibility] = useState("none");
  const [error, setError] = useState("");

  const emailRef = useRef();
  const { signInUser, signInWithGuestLink,forgotPassword } = useUserContext();
  const { signInWithGoogle, signInWithGuest } = useUserContext();
  const { user, user_loading} = useUserContext();
  const user_not_verified = JSON.parse(sessionStorage.getItem('user_not_verified'));
  if (user) {
    //window.location.href = "/";
  }
  window.addEventListener('pagehide', () => {
    sessionStorage.removeItem('user_not_verified');
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    if (email && password) {
      const error = await signInUser(email, password);
      if (error) {
        setErrorVisibility("block");
        setError(error);
        console(error)
      }
    }
  };


  const forgotPasswordHandler = (e) => {
    window.location.href = "/ForgotPassword";
  };
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Language state (default is English)
  const [language, setLanguage] = useState('en');

  // Handle language change from the dropdown
  const handleLanguageChange = (selectedLang) => {
    setLanguage(selectedLang);
  };

  // Get the current translation based on selected language
  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {user_loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-orange-600">{t.loading}</div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Avatar 
                    sx={{ 
                      m: 1, 
                      bgcolor: 'primary.main',
                      width: 56,
                      height: 56,
                    }}
                  >
                    <LockOutlinedIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography 
                    component="h1" 
                    variant="h5"
                    className="text-2xl font-bold text-gray-900 mb-6"
                  >
                    {t.signIn}
                  </Typography>
                  
                  <div 
                    className="error message w-full text-center mb-4 p-3 rounded-lg bg-red-50 text-red-600"
                    style={{ display: errorVisibility }}
                  >
                    {error}
                  </div>
                  
                  {user_not_verified && (
                    <div className="w-full text-center mb-4 p-3 rounded-lg bg-red-50 text-red-600">
                      {user_not_verified}
                    </div>
                  )}

                  <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          id="email"
                          label={t.email}
                          name="email"
                          autoComplete="email"
                          autoFocus
                          inputRef={emailRef}
                          variant="outlined"
                          InputProps={{
                            startAdornment: <EmailIcon sx={{ color: 'primary.main', mr: 1 }} />
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          name="password"
                          label={t.password}
                          type="password"
                          id="password"
                          autoComplete="current-password"
                          variant="outlined"
                          InputProps={{
                            startAdornment: <PasswordIcon sx={{ color: 'primary.main', mr: 1 }} />
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12}>
                        <Button 
                          type="submit" 
                          fullWidth 
                          variant="contained"
                          className="bg-orange-600 hover:bg-orange-700 text-white py-3"
                          startIcon={<LockOutlinedIcon />}
                        >
                          {t.signInButton}
                        </Button>
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          onClick={signInWithGoogle}
                          fullWidth
                          variant="outlined"
                          className="border-orange-600 text-orange-600 hover:bg-orange-50 py-3"
                          startIcon={<GoogleIcon />}
                        >
                          {t.googleSignIn}
                        </Button>
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          fullWidth
                          variant="outlined"
                          className="border-orange-600 text-orange-600 hover:bg-orange-50 py-3"
                          startIcon={<PersonIcon />}
                          onClick={signInWithGuest}
                        >
                          {t.guestSignIn}
                        </Button>
                      </Grid>

                      <Grid item xs={12} className="text-center">
                        <Link
                          className="text-orange-600 hover:text-orange-700 cursor-pointer flex items-center justify-center"
                          onClick={forgotPasswordHandler}
                          variant="body2"
                        >
                          <RestartAltIcon sx={{ fontSize: 20, mr: 0.5 }} />
                          {t.resetPassword}?
                        </Link>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </ThemeProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
