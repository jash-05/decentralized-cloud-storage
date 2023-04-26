import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function AlertDialogSlide({ open, handleClose, handleFileUpload, fileList }) {

    return (
        <div>
            {/* <Button variant="outlined" onClick={handleClickOpen}>
                Slide in alert dialog
            </Button> */}
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>
                    <h2>
                        Confirm File Upload
                    </h2>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        <b>
                            {

                                fileList ? <span>
                                    Are you sure you want to upload the following files?
                                </span> :
                                    <span>
                                        No Files Selected!
                                    </span>
                            }
                        </b>
                        {
                            fileList && Object.keys(fileList).map((file, i) => (
                                <div key={i}>
                                    {fileList[file].name}
                                </div>
                            ))

                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    {
                        fileList && <Button onClick={handleFileUpload}>Confirm</Button>
                    }
                    {
                        !fileList && <Button disabled onClick={handleFileUpload}>Confirm</Button>

                    }
                    <Button onClick={handleClose}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}