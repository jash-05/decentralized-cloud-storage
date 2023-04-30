import * as React from 'react';
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
import { createTheme, rgbToHex, ThemeProvider } from '@mui/material/styles';
import logo from '../../assets/logo.png'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { simpleToast } from '../../services/utils';


const theme = createTheme();

export default function Login() {

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      email: data.get('email'),
      password: data.get('password'),
    }

    try {
      const res = await axios.post('http://localhost:8081/renter/login', payload)
      console.log("login successful", res.data)
      localStorage.setItem('renterId', res?.data?.renterId)
      simpleToast("Login Successful", "success")
      navigate(`/dashboard/${res?.data?.renterId}`)
    } catch (err) {
      simpleToast("Failed to login!", "error")
      console.error(err)
    }
  };

  return (
    <div className='landing-page-wrapper'>
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="sm" sx={{ minHeight: "600px", }}>
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: "rgb(255,255,255,0.8)",
              minHeight: "600px",
              borderRadius: "20px",
              paddingTop: "10%",
            }}
          >
            {/* <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar> */}

            <img style={{ maxHeight: "80px", minHeight: "80px" }} src={logo} alt="logo" />
            <br />
            <Typography component="h1" variant="h5">
              <b>
                Login
              </b>
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Grid>
                <Grid item xs={7}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    type="email"
                    autoFocus
                  />
                </Grid>
              </Grid>
              <Grid>
                <Grid item xs={7}>
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
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Login
              </Button>
              <Link href="/register" variant="body2">
                {"Don't have an account? Register"}
              </Link>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </div>
  );
}