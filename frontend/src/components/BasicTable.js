import * as React from 'react';
import { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import moment from 'moment';
import { NavLink } from 'react-router-dom';
import OptionsMenu from './Options';
import { IconButton, TablePagination, Tooltip } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';

export default function BasicTable({ headers, rowData = [], category, options, handleDeleteFile, handleDownloadFile, storageBackend }) {

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <>
            <TableContainer component={Paper} style={{ borderRadius: "10px", overflowY: "scroll", height: "70vh" }} >
                <Table stickyHeader sx={{ minWidth: 650 }} aria-label="simple table">
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

                            category === "bucket" ?

                                (
                                    ((rowsPerPage > 0) ? rowData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : rowData)?.map((row) =>
                                    (
                                        <TableRow
                                            key={row?.ID}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="td">
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
                                            <OptionsMenu options={options} bucketId={row?.ID} StorageBackend={row?.StorageBackend} />

                                            {/* <Tooltip title="Delete">
                                        <IconButton>
                                            <DeleteIcon sx={{
                                                ":hover": {
                                                    color: "red"
                                                },
                                                color: "black"
                                            }} tooltip='delete'
                                                onClick={() => (handleDeleteBucket)(row?.ID)} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Empty">
                                        <IconButton>
                                            <ClearIcon sx={{
                                                ":hover": {
                                                    color: "red"
                                                },
                                                color: "black"
                                            }} tooltip='empty'
                                                onClick={() => (handleEmptyBucket)(row?.ID)} />
                                        </IconButton>
                                    </Tooltip> */}
                                        </TableRow>
                                    ))
                                )

                                :
                                ((rowsPerPage > 0) ? rowData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : rowData)?.map((row) =>
                                (
                                    <TableRow
                                        key={row?.ID}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="td">
                                            {row?.Name}
                                        </TableCell>
                                        <TableCell align="left">{(row?.SizeInGB).toFixed(5)}</TableCell>
                                        <TableCell align="left">{row?.Type}</TableCell>
                                        <TableCell align="left">{moment(row?.CreationTime).format('LLL')}</TableCell>

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
                                                        () => (handleDownloadFile)(storageBackend, row?.Cid, row?.Name)} />
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
                                                        () => (handleDeleteFile)(storageBackend, row?.ID)} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                        }

                    </TableBody>
                </Table>
            </TableContainer >
            <TablePagination
                component="div"
                count={rowData?.length}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 15]}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage={<>Rows:</>}
                backIconButtonProps={{ backgroundColor: "primary", color: "secondary" }}
                nextIconButtonProps={{ color: "secondary" }}
                showFirstButton={true}
                showLastButton={true}
            />
        </>
    );
}