import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputField from './InputField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
// import SelectOptions from './SelectOptions';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    minHeight: 400,
    bgcolor: 'background.paper',
    border: 'none',
    boxShadow: 24,
    borderRadius: '25px',
    p: 4,
};


export default function BasicModal({ open, handleClose, network, handleCreateNewBucket, handleNetworkChange, handleNameChange }) {

    const [alignment, setAlignment] = React.useState('web');

    const handleChange = (event, newAlignment) => {
        setAlignment(newAlignment);
    };
    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={open}
                onClose={handleClose}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Fade in={open}>
                    <Box align="center" sx={style}>
                        <Typography id="transition-modal-title" variant="h4" component="h2">
                            Create New Bucket
                        </Typography>
                        <br />
                        <br />
                        <Typography id="transition-modal-description" sx={{ mt: 4 }}>
                            Type in a name for your new bucket.
                            <br />
                            Enter lowercase alphanumeric characters only, no spaces.
                        </Typography>
                        <br />
                        <InputField
                            handleNameChange={handleNameChange}
                            placeholder="test-bucket" />
                        <Typography id="transition-modal-description" sx={{ mt: 4 }}>
                            Choose your preferred network.
                        </Typography>

                        <ToggleButtonGroup
                            fullWidth={true}
                            size='large'
                            value={network}
                            exclusive
                            onChange={handleNetworkChange}
                            aria-label="Platform"
                            color='primary'
                        >
                            <ToggleButton value="storj">StorJ</ToggleButton>
                            <ToggleButton value="web3">Web3</ToggleButton>
                        </ToggleButtonGroup>

                        <br />
                        <br />
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Button sx={{ fontSize: "20px" }} variant="contained" onClick={handleCreateNewBucket}>Create</Button>
                        </div>
                    </Box>
                </Fade>
            </Modal>
        </div >
    );
}