import Axios from "axios";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import GoogleLogin from 'react-google-login';
import axios from "axios";
import './button.css';
import Card from 'react-bootstrap/Card';
import {Row, Col, Container} from "react-bootstrap"
import signin_pic from './sigin.png';
import * as React from 'react';
const theme = createTheme();

export default function SignIn() {
    const [isTrue, setIsTrue] = React.useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    Axios({
        method: "POST",
        data: {
          email: data.get('email'),
          password: data.get('password'),
        },
        withCredentials: true,
        url: "http://localhost:8080/login",
      }).then((res) => console.log(res))
      .catch((error) => {
        console.log(error.response.data); // "The username or password is incorrect"
      });
      setIsTrue(true);
  };
  const handleLogout  = () => {
    Axios({
      method: "get",
      withCredentials: true,
      url: "http://localhost:8080/logout",
    }).then((res) => console.log(res))
    .catch((error) => {
        console.log(error.response.data); // "The username or password is incorrect"
      });
      setIsTrue(false);
 };
 
  return (
    <div
    style={{
    }}
>
{isTrue ?
  <div>
        <Button
              sx={{ mt: 3, mb: 2 }}
              onClick={handleLogout}
            >
              logout
            </Button>
  </div>
        :
    <ThemeProvider theme={theme} >

      <Container component="main" maxWidth="xs">

            <CssBaseline />
        <Box
          sx={{
            marginTop: 0,
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
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
            <Button               type="submit"
          fullWidth
          variant="contained"
          sx={{ mb: 2 }} role="button" >
            Google Sign in</Button>
            </Grid>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
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
        }
    </div>
  );
}



