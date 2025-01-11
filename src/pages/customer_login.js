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
import './button.css';
import { Row, Col, Container } from "react-bootstrap"
import * as React from 'react';
import { useRef } from "react";
import { useUserContext } from "../context/userContext";
import Navbar from './Navbar'
import { useState, useEffect } from 'react';
import { useMyHook } from './myHook';
import GoogleIcon from '@mui/icons-material/Google';
import GuestIcon from '@mui/icons-material/AccountCircle'; // Example icon for guest
import SignUpIcon from '@mui/icons-material/AppRegistration'; // Example icon for signup

const theme = createTheme();
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
  const { signInUser, signInWithGuestLink, forgotPassword } = useUserContext();
  const { signInWithGoogle, signInWithGuest } = useUserContext();
  const { user, user_loading } = useUserContext();
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
    <div>
      {user_loading ? (
        <div>{t.loading}</div>
      ) : (
        <div>
          
          <div className="container">
            <div style={width > 768 ? { width: '550px', margin: '0 auto' } : {}}>
  
              <div className={width > 768 ? 'card2 mt-50 mb-50' : ''}>
                <div style={{ padding: '0px 12px' }} className={width > 768 ? 'main' : ''}>
                  <ThemeProvider theme={theme}>
                    <Container component="main" maxWidth="xs">
                      <CssBaseline />
                      <Box
                        sx={{
                          marginTop: 0,
                          marginLeft: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                          <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                          {t.signIn}
                        </Typography>
                        <div className="error message" style={{ display: errorVisibility, color: 'red' }}>
                          {error}
                        </div>
                        {user_not_verified ? (
                          <div style={{ color: 'red' }}>{user_not_verified}</div>
                        ) : (
                          <div></div>
                        )}

                        {/* Language Selection Dropdown */}

                        <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
                          <Grid container spacing={2}>
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
                            />
                            <TextField
                              margin="normal"
                              required
                              fullWidth
                              name="password"
                              label={t.password}
                              type="password"
                              id="password"
                              autoComplete="current-password"
                            />
                          </Grid>
                          <Grid container spacing={2}>
                            <Button
                              type="submit"
                              fullWidth
                              variant="contained"
                              sx={{ mt: 3, mb: 2, backgroundColor: '#1976d2', color: 'white' }} // Softer blue
                              startIcon={<SignUpIcon />}
                            >
                              {t.signInButton}
                            </Button>

                            <Button
                              onClick={signInWithGoogle}
                              fullWidth
                              variant="contained"
                              sx={{ mb: 2, backgroundColor: '#db4437', color: 'white' }} // Softer red
                              startIcon={<GoogleIcon />}
                              role="button"
                            >
                              {t.googleSignIn}
                            </Button>

                            <Button
                              fullWidth
                              variant="contained"
                              sx={{ mb: 2, backgroundColor: '#9e9e9e', color: 'white' }} // Softer gray
                              startIcon={<GuestIcon />}
                              role="button"
                              onClick={signInWithGuest}
                            >
                              {t.guestSignIn}
                            </Button>

                            <Button
                              fullWidth
                              variant="contained"
                              sx={{ mb: 2, backgroundColor: '#388e3c', color: 'white' }} // Softer green
                              startIcon={<SignUpIcon />}
                              role="button"
                              onClick={() => {
                                window.location.href = `/signup`;
                              }}
                            >
                              Sign Up
                            </Button>

                            <Grid container>
                              <Grid item xs>
                                <Link
                                  style={{ cursor: 'pointer', color: '#1976d2' }} // Softer link color
                                  onClick={forgotPasswordHandler}
                                  variant="body2"
                                >
                                  {t.resetPassword}?
                                </Link>
                              </Grid>
                            </Grid>
                          </Grid>

                        </Box>
                      </Box>
                    </Container>
                  </ThemeProvider>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


