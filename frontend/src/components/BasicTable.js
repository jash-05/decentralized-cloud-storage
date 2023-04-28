import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import moment from 'moment';
// import { Link } from '@mui/material';
import { NavLink } from 'react-router-dom';
// import OptionsMenu from './Options';
import { IconButton, Tooltip } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';


export default function BasicTable({ headers, rowData, page, options, handleDeleteFile, handleDownloadFile, handleDeleteBucket }) {


    return (
        <TableContainer component={Paper} style={{ borderRadius: "10px", overflowY: "scroll", height: "70vh" }} >
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        {
                            headers?.map((header) => (
                                < TableCell align="left" > <b>{header}</b></TableCell>
                            ))

                        }
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {

                        page === "bucket" ?

                            rowData?.map((row) =>
                            (
                                <TableRow
                                    key={row?.ID}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        <NavLink
                                            to={`/buckets/bucket/${row?.ID}`}
                                            state={{ payload: row }}>
                                            {row?.BucketNameAlias}
                                        </NavLink>
                                    </TableCell>
                                    {row?.StorageBackend == "web3" ? <TableCell sx={{ backgroundColor: "#FFD817", fontWeight: "600" }} align="center"><span>{(row?.StorageBackend)?.toUpperCase()}</span>
                                    </TableCell> :
                                        <TableCell sx={{ backgroundColor: "#70A1EB", fontWeight: "600" }} align="center"><span>{(row.StorageBackend)?.toUpperCase()}</span></TableCell>}
                                    <TableCell align="center">{row?.Files ? row.Files.length : 0}</TableCell>
                                    <TableCell align="center">{moment(row?.CreationTime).format('LLL')}</TableCell>
                                    <Tooltip title="Delete">
                                        <IconButton>
                                            <DeleteIcon sx={{
                                                ":hover": {
                                                    color: "red"
                                                },
                                                color: "black"
                                            }} tooltip='delete' />
                                        </IconButton>
                                    </Tooltip>
                                </TableRow>
                            ))

                            :
                            rowData?.map((row) =>
                            (
                                <TableRow
                                    key={row?.ID}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {row?.Name}
                                    </TableCell>
                                    <TableCell align="left">{(row?.SizeInGB).toFixed(5)}</TableCell>
                                    <TableCell align="left">{row?.Type}</TableCell>
                                    {/* <OptionsMenu options={options} fileName={row?.Name} fileId={row?.ID} /> */}
                                    <TableCell sx={{ width: "100px" }} >
                                        <Tooltip title="Download">

                                            <IconButton>
                                                <FileDownloadIcon sx={{
                                                    ":hover": {
                                                        color: "#2196f3"
                                                    },
                                                    color: "black"
                                                }} onClick={
                                                    () => (handleDownloadFile)(row?.Name)} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton>
                                                <DeleteIcon sx={{
                                                    ":hover": {
                                                        color: "red"
                                                    },
                                                    color: "black"
                                                }} tooltip='delete' onClick={
                                                    () => (handleDeleteFile)(row?.ID)} />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                    }
                </TableBody>
            </Table>
        </TableContainer >
    );
}