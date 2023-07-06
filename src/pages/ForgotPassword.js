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

const theme = createTheme();

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
  const { signInUser, forgotPassword } = useUserContext();
  const { signInWithGoogle, } = useUserContext();
  const user = JSON.parse(sessionStorage.getItem('user'));
  const user_not_verified = JSON.parse(sessionStorage.getItem('user_not_verified'));
  if (user) {
    window.location.href = "/";
  }
  window.addEventListener('beforeunload', () => {
    sessionStorage.removeItem('user_not_verified');
  });

  const forgotPasswordHandler = (e) => {
    const email = emailRef.current.value;
    //console.log(email)
    if (email)
      forgotPassword(email).then(() => {
        emailRef.current.value = "";
       // console.log("send")
        alert("Email was sent")
        window.location.href = "/login";
      });

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
  //width > 640 ?

  // for translate
  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = (text) => {
    // const trans = sessionStorage.getItem("translations")
    //console.log(trans)
   // console.log(sessionStorage.getItem("translationsMode"))

    if (trans != null) {
      if (sessionStorage.getItem("translationsMode") != null) {
        // return the translated text with the right mode
        if (trans[text] != null) {
            if (trans[text][sessionStorage.getItem("translationsMode")] != null)
              return trans[text][sessionStorage.getItem("translationsMode")]
        }
      }
    } 
    // base case to just return the text if no modes/translations are found
    return text
  }

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
                  <div style={{ 'padding': '10px 12px' }} className={width > 768 ? "main" : ""}>

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
                          <Typography component="h1" variant="h5" sx={{ m: 1 }}>
                            {t("Forgot your password")}?

                          </Typography>

                          <div className='error message' style={{ display: errorVisibility, color: 'red' }}>{error}</div>
                          {user_not_verified ? <div style={{ color: 'red' }}>{user_not_verified}</div> : <></>}
                          <Box component="form" noValidate sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
                              <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label={t("Enter Email Address")}
                                name="email"
                                autoComplete="email"
                                autoFocus
                                inputRef={emailRef}
                              />
                            </Grid>
                            <Grid container spacing={2}>
                              <Button
                                onClick={forgotPasswordHandler}
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                              >
                                {t("Confirm")}
                              </Button>

                            </Grid>
                            <Grid container>
                              <Grid item xs>
                              </Grid>
                              <Grid item>
                                <Typography variant="body2">
                                  {t("We would send you a link to reset password")}
                                </Typography>
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


