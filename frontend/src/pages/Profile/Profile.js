import React from 'react'
import '../../styles/Buckets.css'
import '../../styles/Profile.css'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ModeIcon from '@mui/icons-material/Mode';
import IconButton from '@mui/material/IconButton';

const Profile = () => {
    return (
        <div className="profile-wrapper">
            <div className='profile-header'>
                <h1>Profile</h1>
            </div>
            {/* <div className='profile-form-wrapper'> */}
            <Box
                className='profile-form-wrapper'
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
            >
                <div className='horizontal-field-group-wrapper'>

                    <div>

                        <TextField
                            id="read-only-user-name-input"
                            label="User Name"
                            defaultValue="User Name"
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </div>
                    <div>

                        <TextField
                            id="outlined-read-only-input-2"
                            label="Email"
                            defaultValue="email@adress.com"
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </div>
                </div>
                <div className='horizontal-field-group-wrapper'>

                    <div>

                        <TextField
                            id="read-only-first-name-input"
                            label="First Name"
                            defaultValue="Jane"
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <IconButton aria-label="edit" size="large">
                            <ModeIcon />
                        </IconButton>
                    </div>
                    <div>

                        <TextField
                            id="read-only-last-name-input"
                            label="Last Name"
                            defaultValue="Doe"
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <IconButton aria-label="edit" size="large">
                            <ModeIcon />
                        </IconButton>
                    </div>
                </div>
                <div>
                    <TextField
                        id="outlined-password-input"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                    />

                    <IconButton aria-label="edit" size="large">
                        <ModeIcon />
                    </IconButton>
                </div>
                <div>
                    <TextField
                        id="outlined-mobile-input"
                        label="Phone Number"
                        defaultValue="698 785 7852"
                        autoComplete="current-password"
                    />

                    <IconButton aria-label="edit" size="large">
                        <ModeIcon />
                    </IconButton>
                </div>
                <div>
                    <TextField
                        id="outlined-region-input"
                        label="Region"
                        defaultValue="United States"
                        autoComplete="current-password"
                    />

                    <IconButton aria-label="edit" size="large">
                        <ModeIcon />
                    </IconButton>
                </div>
            </Box>
        </div>
    )
}

export default Profile