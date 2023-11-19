
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
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useUserContext } from "../context/userContext";
import React, { useRef } from "react";
import Navbar from './Navbar'
import { useState, useEffect } from 'react';
import { useMyHook } from './myHook';


const theme = createTheme();

export default function SignUp() {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  const { user, user_loading} = useUserContext();
  const [errorVisibility, setErrorVisibility] = useState("none");

  const { registerUser } = useUserContext();
  const onSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get('email');
    const name = data.get('NickName');
    const password = data.get('password');
  //  console.log((email && password && name))
    if (email && password && name) {
      const response = await registerUser(email, password, name);
      console(response)
    }

  };
  if (user) {
    setErrorVisibility("block");
    window.location.href = "/login";
  }
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

      // for translations sake
      const trans = JSON.parse(sessionStorage.getItem("translations"))
      const t = (text) => {
        // const trans = sessionStorage.getItem("translations")
     //   console.log(trans)
      //  console.log(sessionStorage.getItem("translationsMode"))
    
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
      {user_loading ?
        <div>
          {t("Loading...")}
        </div>
        :

        <div>
          <div>
            <div className="container">
              <div style={width > 768 ? { width: "550px", margin: "0 auto" } : {}}>
                <div className={width > 768 ? "card2 mt-50 mb-50" : ""}>
                  <div style={{ 'padding': '0px 12px' }} className={width > 768 ? "main" : ""}>

                    <ThemeProvider theme={theme}>
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
                            {t('Sign up')}
                          </Typography>
                          <div className='error message' style={{ display: errorVisibility, color: 'red' }}>{t("Please verify your email")}.</div>

                          <Box component="form" noValidate onSubmit={onSubmit} sx={{ mt: 3 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <TextField

                                  required
                                  fullWidth
                                  id="NickName"
                                  label={t("Nick name")}
                                  name="NickName"
                                  autoComplete="NickName"
                                  autoFocus
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  required
                                  fullWidth
                                  id="email"
                                  label={t("Email Address")}
                                  name="email"
                                  autoComplete="email"
                                />
                              </Grid>

                              <Grid item xs={12}>
                                <TextField
                                  required
                                  fullWidth
                                  name="password"
                                  label={t("Password")}
                                  type="password"
                                  id="password"
                                  autoComplete="new-password"
                                />
                              </Grid>
                              <Grid item xs={12}>

                              </Grid>
                            </Grid>
                            <Typography variant="body2">
                              {t("We would send you a link to verify your email") + "."}
                            </Typography>
                            <Button
                              type="submit"
                              fullWidth
                              variant="contained"
                              sx={{ mt: 3, mb: 2 }}
                            >
                              {t("SIGN UP")}
                            </Button>
                            <Grid container justifyContent="flex-end">
                              <Grid item>
                                <Link href="/login" variant="body2">
                                  {t("Already have an account? Sign in")}
                                </Link>
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
        </div>
      }
    </div>
  );
}

