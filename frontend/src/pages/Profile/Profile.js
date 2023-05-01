import React, { useEffect, useState, useRef } from 'react'
import '../../styles/Buckets.css'
import '../../styles/Profile.css'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ModeIcon from '@mui/icons-material/Mode';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import { simpleToast } from '../../services/utils';
import Button from '../../components/Button';

const Profile = () => {

    const [userData, setUserData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [dep, setDep] = useState('');
    const firstName = useRef();
    const lastName = useRef();
    const email = useRef();
    const password = useRef();
    const phoneNumber = useRef();
    const city = useRef();
    const state = useRef();
    const country = useRef();

    const CustomIconStyle = { height: "100%", verticalAlign: "-30%", marginRight: "5%" }


    const handleUpdateProfile = async event => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);

        const payload = {
            firstName: data.get('firstName'),
            lastName: data.get('lastName'),
            email: data.get('email'),
            password: data.get('password'),
            phoneNumber: data.get('phoneNumber'),
            city: data.get('city'),
            state: data.get('state'),
            country: data.get('country'),
        }
        console.log(payload)

        // try {
        //     const res = await axios.post('http://localhost:8081/renter/updateProfile', payload)
        //     console.log("Profile Updated", res.data)
        //     simpleToast("Profile updated successfully", "success")
        //     setEditMode(false);
        //     setDep(res.data)

        // }
        // catch (err) {
        //     simpleToast("Failed to update details!", "error")
        //     console.log(err)
        // }
    }


    const getDashboardDetails = async () => {
        const response = await axios("http://localhost:8081/renter/getProfile", { params: { renterId: localStorage.getItem('renterId') } });
        console.log(response.data.renter)
        setUserData(response.data.renter);
    }


    useEffect(() => {
        getDashboardDetails();
    }, [dep]);

    return (
        <div className="profile-wrapper">
            <div className='profile-header'>
                <h1>Profile</h1>
                <div>

                    <Button icon={<ModeIcon sx={CustomIconStyle} />} type="button" text="Edit" style={{ minWidth: "200px", fontSize: "18px", backgroundColor: "#70A1EB", }} onClick={() => setEditMode(!editMode)}></Button>
                    <Button icon={<SaveIcon sx={CustomIconStyle} />} type="submit" text="Save" style={{ minWidth: "200px", fontSize: "18px", backgroundColor: "#FFD817", marginLeft: "10px" }} ></Button>
                </div>
            </div>
            {/* <div className='profile-form-wrapper'> */}
            <br />
            <br />
            <br />
            <Box
                className='profile-form-wrapper'
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
                onSubmit={handleUpdateProfile}
            >
                <div className='horizontal-field-group-wrapper'>



                    <TextField
                        id="read-only-user-name-input"
                        label="User Name"
                        defaultValue="User Name"
                        value={userData?.userName}
                        InputProps={{
                            readOnly: true,
                        }}
                        ref={firstName}
                    />
                </div>
                <div>

                    <TextField
                        id="outlined-read-only-input-2"
                        label="Email"
                        defaultValue="email@adress.com"
                        value={userData?.email}
                        InputProps={{
                            readOnly: true,
                        }}
                        ref={email}
                    />
                </div>
                <div className='horizontal-field-group-wrapper'>
                    <div>
                        <TextField
                            id="read-only-first-name-input"
                            label="First Name"
                            defaultValue={userData?.firstName}
                            // defaultValue="Jane"
                            InputProps={{
                                disabled: !editMode,
                            }}
                            ref={firstName}
                        />
                    </div>
                    <div>

                        <TextField
                            id="read-only-last-name-input"
                            label="Last Name"
                            defaultValue={userData?.lastName}
                            // defaultValue="Doe"
                            InputProps={{
                                disabled: !editMode,
                            }}
                            ref={lastName}
                        />
                    </div>
                </div>
                <div>
                    <TextField
                        id="outlined-password-input"
                        label="Password"
                        type="password"
                        defaultValue={userData?.password}
                        autoComplete="password"
                        InputProps={{
                            disabled: !editMode,
                        }}
                        ref={password}
                    />
                </div>
                <div>
                    <TextField
                        id="outlined-mobile-input"
                        label="Phone Number"
                        defaultValue="698 785 7852"
                        // defaultValue={userData?.phoneNumber}
                        autoComplete="current-password"
                        InputProps={{
                            disabled: !editMode,
                        }}
                        ref={phoneNumber}
                    />


                </div>
                <div>
                    <TextField
                        id="outlined-city-input"
                        label="City"
                        defaultValue="San Jose"
                        autoComplete="city"
                        InputProps={{
                            disabled: !editMode,
                        }}
                        ref={city}

                    />
                </div>
                <div>
                    <TextField
                        id="outlined-state-input"
                        label="State"
                        defaultValue="California"
                        autoComplete="state"
                        InputProps={{
                            disabled: !editMode,
                        }}
                        ref={state}

                    />
                </div>
                <div>
                    <TextField
                        id="outlined-country-input"
                        label="Country"
                        defaultValue="United States"
                        autoComplete="country"
                        InputProps={{
                            disabled: !editMode,
                        }}
                        ref={country}

                    />
                </div>
            </Box>
        </div>
    )
}

export default Profile