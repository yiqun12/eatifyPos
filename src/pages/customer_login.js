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
// 新增下面三个导入
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Container from '@mui/material/Container';
import EmailIcon from '@mui/icons-material/Email';
import PasswordIcon from '@mui/icons-material/Password';
import GoogleIcon from '@mui/icons-material/Google';
import PersonIcon from '@mui/icons-material/Person';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import './button.css';
import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import { useUserContext } from "../context/userContext";
import { useMyHook } from './myHook';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B00',  // 暖橙色
      light: '#FF8533',
      dark: '#CC5500',
    },
  },
  components: {
    MuiToggleButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#FF6B00',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#FF8533',
            },
          },
        },
      },
    },
  },
});// 静态翻译对象
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
    langLabel: 'EN / 中文'
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
    langLabel: 'EN / 中文'
  },
};

export default function SignIn() {
  const { id, saveId } = useMyHook(null);
  useEffect(() => {}, [id]);

  const { signInUser, signInWithGoogle, signInWithGuest } = useUserContext();
  const { user, user_loading } = useUserContext();
  const user_not_verified = JSON.parse(sessionStorage.getItem('user_not_verified'));

  const emailRef = useRef();
  const [errorVisibility, setErrorVisibility] = useState("none");
  const [error, setError] = useState("");
  const [language, setLanguage] = useState('en');
  const t = translations[language];

  // 语言切换处理函数
  const handleLanguageChange = (event, newLang) => {
    if (newLang) setLanguage(newLang);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    if (email && password) {
      const errorMsg = await signInUser(email, password);
      if (errorMsg) {
        setErrorVisibility("block");
        setError(errorMsg);
      }
    }
  };

  return (
    <div className=" ">
      {user_loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-orange-600">{t.loading}</div>
        </div>
      ) : (
        <Container component="main" maxWidth="sm" className="py-12">
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: 3,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                <LockOutlinedIcon sx={{ fontSize: 32 }} />
              </Avatar>

              {/* —— 在这里插入中英文切换按钮 —— */}
              <ToggleButtonGroup
                value={language}
                exclusive
                onChange={handleLanguageChange}
                sx={{ mb: 2 }}
                size="small"
                aria-label={t.langLabel}
              >
                <ToggleButton value="en" aria-label="English">
                  EN
                </ToggleButton>
                <ToggleButton value="zh" aria-label="中文">
                  中文
                </ToggleButton>
              </ToggleButtonGroup>
              {/* —— 切换按钮结束 —— */}

              <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                {t.signIn}
              </Typography>

              {errorVisibility === "block" && (
                <Box
                  sx={{
                    width: '100%',
                    mb: 2,
                    p: 2,
                    bgcolor: 'error.light',
                    color: 'error.dark',
                    borderRadius: 1,
                    textAlign: 'center',
                  }}
                >
                  {error}
                </Box>
              )}

              {user_not_verified && (
                <Box
                  sx={{
                    width: '100%',
                    mb: 2,
                    p: 2,
                    bgcolor: 'error.light',
                    color: 'error.dark',
                    borderRadius: 1,
                    textAlign: 'center',
                  }}
                >
                  {user_not_verified}
                </Box>
              )}

              <Box component="form" onSubmit={onSubmit} noValidate sx={{ width: '100%' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
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
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{ py: 1.5, mt: 1, mb: 1 }}
                    >
                      {t.signInButton}
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      onClick={signInWithGoogle}
                      fullWidth
                      variant="outlined"
                      sx={{ py: 1.5, mb: 1 }}
                      startIcon={<GoogleIcon />}
                    >
                      {t.googleSignIn}
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      onClick={signInWithGuest}
                      fullWidth
                      variant="outlined"
                      sx={{ py: 1.5 }}
                      startIcon={<PersonIcon />}
                    >
                      {t.guestSignIn}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign: 'center' }}>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => (window.location.href = '/ForgotPassword')}
                      sx={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                      <RestartAltIcon sx={{ mr: 0.5 }} />
                      {t.resetPassword}?
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </ThemeProvider>
        </Container>
      )}
    </div>
  );
}
