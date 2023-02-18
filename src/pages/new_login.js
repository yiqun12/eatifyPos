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

const theme = createTheme();

export default function SignIn() {
  const [isTrue, setIsTrue] = React.useState(false);
  const [errorVisibility, setErrorVisibility] = useState("none");
  const [error, setError] = useState("");

  const emailRef = useRef();
  const { signInUser, forgotPassword } = useUserContext();
  const { signInWithGoogle, signInWithGuest } = useUserContext();
  const user = JSON.parse(localStorage.getItem('user'));
  const user_not_verified = JSON.parse(localStorage.getItem('user_not_verified'));
  if (user) {
    window.location.href = "/";
  }
  window.addEventListener('pagehide', () => {
    localStorage.removeItem('user_not_verified');
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
  return (
    <div
      style={{
      }}
    >
      {user ?
        <div>
          Loading...
        </div>
        :
        <>
          <div>
            <div className="container">
              <div style={width > 768 ? { width: "550px", margin: "0 auto" } : {}}>
                <div className={width > 768 ? "card2 mt-50 mb-50" : ""}>
                  <div style={{ 'padding': '0px 12px' }} className={width > 768 ? "main" : ""}>
                    <ThemeProvider theme={theme} >

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
                            Sign in
                          </Typography>
                          <div className='error message' style={{ display: errorVisibility, color: 'red' }}>{error}</div>
                          {user_not_verified ? <div style={{ color: 'red' }}>{user_not_verified}</div> : <></>}
                          <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
                              <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
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
                                label="Password"
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
                                sx={{ mt: 3, mb: 2 }}
                              >
                                Sign In
                              </Button>


                              <Button onClick={signInWithGoogle}
                                fullWidth
                                variant="contained"
                                sx={{ mb: 2 }} role="button" >
                                Google Sign in</Button>
                              <Button
                                fullWidth
                                variant="contained"
                                sx={{ mb: 2 }} role="button" onClick={signInWithGuest} >
                                One Time Sign in</Button>
                                <Grid container>
                              <Grid item xs>
                                <Link style={{cursor: 'pointer' }} onClick={forgotPasswordHandler} variant="body2">
                                  Forgot password?
                                </Link>
                              </Grid>
                              <Grid item>
                                <Link href='/signup' variant="body2">
                                  {"Don't have an account? Sign Up"}
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

        </>
      }
    </div>
  );
}


