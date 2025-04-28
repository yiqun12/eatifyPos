import React, { useState, useEffect, useRef } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useUserContext } from '../context/userContext';

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

// 静态翻译对象
const translations = {
  en: {
    forgotTitle: 'Forgot your password?',
    enterEmail: 'Enter Email Address',
    confirm: 'Confirm',
    resetInfo: 'We will send you a link to reset your password.',
    loading: 'Loading...',
    langLabel: 'EN / 中文',
  },
  zh: {
    forgotTitle: '忘记密码？',
    enterEmail: '输入电子邮件地址',
    confirm: '确认',
    resetInfo: '我们会发送重置密码的链接。',
    loading: '加载中…',
    langLabel: 'EN / 中文',
  },
};

export default function ForgotPassword() {
  // 语言切换
  const [language, setLanguage] = useState('en');
  const t = translations[language];
  const handleLanguageChange = (e, newLang) => {
    if (newLang) setLanguage(newLang);
  };

  // 用户状态 & 操作
  const { user, user_loading, forgotPassword } = useUserContext();
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const emailRef = useRef();

  // 如果已登录，跳回 /account
  useEffect(() => {
    if (user) {
      window.location.href = '/account';
    }
  }, [user]);

  // 发送重置邮件
  const handleConfirm = async () => {
    const email = emailRef.current.value;
    if (!email) {
      setErrorMsg('请输入邮箱');
      setErrorVisible(true);
      return;
    }
    try {
      await forgotPassword(email);
      alert('Email was sent');
      window.location.href = '/account';
    } catch (err) {
      setErrorMsg(err.message || '发送失败');
      setErrorVisible(true);
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

              {/* 语言切换按钮 */}
              <ToggleButtonGroup
                value={language}
                exclusive
                onChange={handleLanguageChange}
                size="small"
                sx={{ mb: 2 }}
                aria-label={t.langLabel}
              >
                <ToggleButton value="en">EN</ToggleButton>
                <ToggleButton value="zh">中文</ToggleButton>
              </ToggleButtonGroup>

              <Typography component="h1" variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                {t.forgotTitle}
              </Typography>

              {errorVisible && (
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
                  {errorMsg}
                </Box>
              )}

              <Box component="form" noValidate sx={{ width: '100%' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label={t.enterEmail}
                      name="email"
                      autoComplete="email"
                      autoFocus
                      inputRef={emailRef}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      onClick={handleConfirm}
                      fullWidth
                      variant="contained"
                      sx={{ py: 1.5 }}
                    >
                      {t.confirm}
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" align="center">
                      {t.resetInfo}
                    </Typography>
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
