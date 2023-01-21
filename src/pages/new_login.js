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
import {Row, Col, Container} from "react-bootstrap"
import * as React from 'react';
import { useRef } from "react";
import { useUserContext } from "../context/userContext";
import Navbar from './Navbar'

const theme = createTheme();

export default function SignIn() {
  const [isTrue, setIsTrue] = React.useState(false);

  const emailRef = useRef();
  const { signInUser, forgotPassword } = useUserContext();
  const { signInWithGoogle, } = useUserContext();
  const user = JSON.parse(localStorage.getItem('user'));

  if (user) {
    window.location.href = "/";
  }
  const onSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    if (email && password) signInUser(email, password);
  };

  const forgotPasswordHandler = (e) => {
    const email = emailRef.current.value;
    console.log(email)
    if (email)
      forgotPassword(email).then(() => {
        emailRef.current.value = "";
        console.log("send")
      });
  }; 
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
            <Button    onClick={signInWithGoogle}
          fullWidth
          variant="contained"
          sx={{ mb: 2 }} role="button" >
            Google Sign in</Button>
            </Grid>
            <Grid container>
              <Grid item xs>
                <Link style={{cursor: 'pointer'}} onClick={forgotPasswordHandler} variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href='/signup' variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>


      </Container>

    </ThemeProvider>
    </>
        }
    </div>
  );
}


