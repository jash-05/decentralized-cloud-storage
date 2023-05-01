import React, { useRef, useCallback } from 'react'
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import logo from '../../assets/logo.png'
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { simpleToast } from '../../services/utils';

const Register = () => {

    const navigate = useNavigate();
    const firstName = useRef();
    const lastName = useRef();
    const email = useRef();
    const password = useRef();
    const confirmPassword = useRef();
    const phoneNumber = useRef();
    const city = useRef();
    const state = useRef();
    const country = useRef();
    // const [firstName, setFirstName] = useState('')
    // const [lastName, setLastName] = useState('')
    // const [emailAddress, setEmailAddress] = useState('')
    // const [password, setPassword] = useState('')
    // const [confirmPassword, setConfirmPassword] = useState('')
    // const [phoneNumber, setPhoneNumber] = useState('')


    const handleRegister = async event => {
        event.preventDefault();

        console.log("here")
        const data = new FormData(event.currentTarget);

        const payload = {
            firstName: data.get('firstName'),
            lastName: data.get('lastName'),
            email: data.get('email'),
            password: data.get('password'),
            confirmPassword: data.get('confirmPassword'),
            phoneNumber: data.get('phoneNumber'),
            city: data.get('city'),
            state: data.get('state'),
            country: data.get('country'),
        }
        console.log(payload)

        try {
            const res = await axios.post('http://localhost:8081/renter/register', payload)
            console.log("New user created", res)
            simpleToast("Registration Successful", "success")
            navigate('/login')
        }
        catch (err) {
            simpleToast("Failed to register!", "error")
            console.log(err)
        }
    }

    return (

        <div className='landing-page-wrapper'>
            <Container component="main" maxWidth="md" sx={{ minHeight: "600px", }}>
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
                        paddingBottom: "5%"
                    }}
                >
                    <img style={{ maxHeight: "80px", minHeight: "80px" }} src={logo} alt="logo" />


                    <br />
                    <Typography component="h1" variant="h5">
                        <b>
                            Register
                        </b>
                    </Typography>
                    <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
                        <Grid container>
                            <Grid item xs={5.5}>
                                <TextField
                                    ref={firstName}
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    name="firstName"
                                    autoComplete="firstName"
                                    autoFocus
                                />
                            </Grid>

                            <Grid item xs={1}>
                            </Grid>
                            <Grid item xs={5.5}>

                                <TextField
                                    ref={lastName}
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="lastName"
                                    autoFocus
                                />
                            </Grid>
                        </Grid>
                        <TextField
                            ref={email}
                            margin="normal"
                            required
                            fullWidth
                            id="register-email"
                            label="Email Address"
                            name="email"
                            autcomplete="email"
                            type="email"
                            autoFocus
                        />
                        <TextField
                            ref={password}
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                        />
                        <TextField
                            ref={confirmPassword}
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            id="confirmPassword"
                            autoComplete="confirm-password"
                        />

                        <Grid container>
                            <Grid item xs={6}>
                                <TextField
                                    ref={phoneNumber}
                                    margin="normal"
                                    fullWidth
                                    id="phoneNumber"
                                    label="Phone Number"
                                    name="phoneNumber"
                                    autoComplete="phoneNumber"
                                    autoFocus
                                    type='number'
                                />
                            </Grid>
                        </Grid>
                        <Grid container>
                            <Grid item xs={4}>
                                <TextField
                                    ref={city}
                                    margin="normal"
                                    fullWidth
                                    id="city"
                                    label="City"
                                    name="city"
                                    autoComplete="city"
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={0.5}>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    ref={state}
                                    margin="normal"
                                    fullWidth
                                    id="state"
                                    label="State"
                                    name="state"
                                    autoComplete="state"
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={0.5}>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    ref={country}
                                    margin="normal"
                                    fullWidth
                                    id="country"
                                    label="Country"
                                    name="country"
                                    autoComplete="country"
                                    autoFocus
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Create Account
                        </Button>
                        <Link href="/login" variant="body2">
                            {"Already have an account? Login"}
                        </Link>
                    </Box>
                </Box>
            </Container>

        </div>
    )
}

export default Register