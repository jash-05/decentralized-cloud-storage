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
    // const firstName = useRef();
    // const lastName = useRef();
    // const email = useRef();
    // const password = useRef();
    // const phoneNumber = useRef();
    // const city = useRef();
    // const state = useRef();
    // const country = useRef();
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mobile, setMobile] = useState('')
    const [location, setLocation] = useState('')

    const CustomIconStyle = { height: "100%", verticalAlign: "-30%", marginRight: "5%" }

    useEffect(() => {
        getDashboardDetails();
    }, []);

    const getDashboardDetails = async () => {
        const response = await axios("http://localhost:8081/renter/getProfile", { params: { renterId: localStorage.getItem('renterId') } });
        console.log(response.data.renter)
        setUserData(response.data.renter);
        setFirstName(response.data.renter.firstName)
        setLastName(response.data.renter.lastName)
        setEmail(response.data.renter.email)
        setPassword(response.data.renter.password)
        setMobile(response.data.renter.mobile)
        setLocation(response.data.renter.location)

    }
    const handleUpdateProfile = async event => {
        event.preventDefault();
        // const data = new FormData(event.currentTarget);

        // const payload = {
        //     firstName: data.get('firstName'),
        //     lastName: data.get('lastName'),
        //     email: data.get('email'),
        //     password: data.get('password'),
        //     phoneNumber: data.get('phoneNumber'),
        //     city: data.get('city'),
        //     state: data.get('state'),
        //     location: data.get('city') + ", " + data.get('state') + ", " + data.get('country'),
        // }

        const payload = {
            renterId: localStorage.getItem('renterId'),
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            mobile: mobile,
            location: location,
        }

        console.log("here", payload)

        try {
            const res = await axios.put('http://localhost:8081/renter/updateProfile', payload)
            console.log("Profile Updated", res.data)
            simpleToast("Profile updated successfully", "success")
            setEditMode(false);
            // setDep(res.data)
            getDashboardDetails();


        }
        catch (err) {
            simpleToast("Failed to update details!", "error")
            console.log(err)
        }
    }





    return (
        <div className="profile-wrapper">
            <div className='profile-header'>
                <h1>Profile</h1>
                <div>

                    <Button icon={<ModeIcon sx={CustomIconStyle} />} type="button" text="Edit" style={{ minWidth: "200px", fontSize: "18px", backgroundColor: "#70A1EB", }} onClick={() => setEditMode(!editMode)}></Button>
                    <Button icon={<SaveIcon sx={CustomIconStyle} />} type="button" text="Save" style={{ minWidth: "200px", fontSize: "18px", backgroundColor: "#FFD817", marginLeft: "10px" }} onClick={handleUpdateProfile} ></Button>
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
            >
                <div className='horizontal-field-group-wrapper'>



                    <TextField
                        id="read-only-user-name-input"
                        label="User Name"
                        // defaultValue={userData?.userName}
                        value={userData?.userName}
                        InputProps={{
                            readOnly: true,
                        }}
                        InputLabelProps={{ shrink: true }}
                    />
                </div>
                <div>

                    <TextField
                        id="outlined-read-only-input-2"
                        label="Email"
                        defaultValue={email}
                        value={email}
                        InputProps={{
                            disabled: !editMode,
                        }}
                        autoFocus
                        name={email}
                        onChange={(e) => setEmail(e.target.value)}
                        InputLabelProps={{ shrink: true }}

                    />
                </div>
                <div className='horizontal-field-group-wrapper'>
                    <div>
                        <TextField
                            id="read-only-first-name-input"
                            label="First Name"
                            defaultValue={firstName}
                            value={firstName}
                            InputProps={{
                                disabled: !editMode,
                            }}
                            onChange={(e) => setFirstName(e.target.value)}
                            InputLabelProps={{ shrink: true }}

                        />
                    </div>
                    <div>

                        <TextField
                            id="read-only-last-name-input"
                            label="Last Name"
                            defaultValue={lastName}
                            value={lastName}
                            InputProps={{
                                disabled: !editMode,
                            }}
                            onChange={(e) => setLastName(e.target.value)}
                            InputLabelProps={{ shrink: true }}

                        />
                    </div>
                </div>
                <div>
                    <TextField
                        id="outlined-password-input"
                        label="Password"
                        type="password"
                        defaultValue={"xxxxxxx"}
                        // value={password}
                        autoComplete="password"
                        InputProps={{
                            disabled: !editMode,
                        }}
                        onChange={(e) => setPassword(e.target.value)}
                        InputLabelProps={{ shrink: true }}

                    />
                </div>
                <div>
                    <TextField
                        id="outlined-mobile-input"
                        label="Phone Number"
                        defaultValue={mobile}
                        value={mobile}
                        autoComplete="mobile"
                        InputProps={{
                            disabled: !editMode,
                        }}
                        onChange={(e) => setMobile(e.target.value)}
                        InputLabelProps={{ shrink: true }}

                    />


                </div>

                <div>
                    <TextField
                        id="outlined-country-input"
                        label="Location"
                        defaultValue={location}
                        value={location}
                        autoComplete="location"
                        InputProps={{
                            disabled: !editMode,
                        }}
                        onChange={(e) => setLocation(e.target.value)}
                        InputLabelProps={{ shrink: true }}

                    />
                </div>
            </Box>
        </div>
    )
}

export default Profile