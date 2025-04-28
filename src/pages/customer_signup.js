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

// 静态翻译对象
const translations = {
  en: {
    signUp: 'Sign Up',
    nickName: 'Nick Name',
    email: 'Email Address',
    password: 'Password',
    signUpButton: 'SIGN UP',
    haveAccount: 'Already have an account? Sign in',
    verifyInfo: 'We will send you a link to verify your email.',
    verifyPrompt: 'Please verify your email.',
    loading: 'Loading...',
    langLabel: 'EN / 中文',
  },
  zh: {
    signUp: '注册',
    nickName: '昵称',
    email: '电子邮件地址',
    password: '密码',
    signUpButton: '注册',
    haveAccount: '已有账户？登录',
    verifyInfo: '我们会发送验证邮件链接。',
    verifyPrompt: '请验证您的邮箱。',
    loading: '加载中…',
    langLabel: 'EN / 中文',
  },
};

export default function SignUp() {
  // 翻译和语言状态
  const [language, setLanguage] = useState('en');
  const t = translations[language];
  const handleLanguageChange = (e, newLang) => {
    if (newLang) setLanguage(newLang);
  };

  // 本地存储监听示例
  const { id, saveId } = useMyHook(null);
  useEffect(() => {}, [id]);

  // 用户状态
  const { user, user_loading, registerUser } = useUserContext();
  const [errorVisible, setErrorVisible] = useState(false);

  // 注册表单提交
  const onSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get('email');
    const name = data.get('nickName');
    const password = data.get('password');
    if (email && name && password) {
      const err = await registerUser(email, password, name);
      if (err) {
        setErrorVisible(true);
      }
      // 注册成功后，context 里的 user 会更新，触发下面的重定向
    }
  };

  // 注册后自动跳转
  useEffect(() => {
    if (user) {
      window.location.href = '/account';
    }
  }, [user]);

  // 响应式宽度（若有需要可用）
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
                {t.signUp}
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
                  {t.verifyPrompt}
                </Box>
              )}

              <Box component="form" noValidate onSubmit={onSubmit} sx={{ width: '100%' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="nickName"
                      label={t.nickName}
                      name="nickName"
                      autoComplete="nickName"
                      autoFocus
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label={t.email}
                      name="email"
                      autoComplete="email"
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
                      autoComplete="new-password"
                    />
                  </Grid>
                </Grid>

                <Typography variant="body2" sx={{ mt: 2 }}>
                  {t.verifyInfo}
                </Typography>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {t.signUpButton}
                </Button>

                <Grid container justifyContent="flex-end">
                  <Grid item>
                    <Link href="/account" variant="body2">
                      {t.haveAccount}
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
