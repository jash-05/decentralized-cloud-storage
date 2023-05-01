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
    const mobile = useRef();
    const location = useRef();
    // const [firstName, setFirstName] = useState('')
    // const [lastName, setLastName] = useState('')
    // const [emailAddress, setEmailAddress] = useState('')
    // const [password, setPassword] = useState('')
    // const [confirmPassword, setConfirmPassword] = useState('')
    // const [phoneNumber, setPhoneNumber] = useState('')


    const handleRegister = async event => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);

        const payload = {
            firstName: data.get('firstName'),
            lastName: data.get('lastName'),
            email: data.get('email'),
            password: data.get('password'),
            confirmPassword: data.get('confirmPassword'),
            mobile: data.get('mobile'),
            location: data.get('location'),
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
                                    ref={mobile}
                                    margin="normal"
                                    fullWidth
                                    id="mobile"
                                    label="Phone Number"
                                    name="mobile"
                                    autoComplete="mobile"
                                    autoFocus
                                    type='number'
                                />
                            </Grid>
                        </Grid>
                        <Grid container>
                            <Grid item xs={7}>
                                <TextField
                                    ref={location}
                                    margin="normal"
                                    fullWidth
                                    id="location"
                                    label="Location"
                                    name="location"
                                    autoComplete="location"
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