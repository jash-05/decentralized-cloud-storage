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
import OptionsMenu from './Options';


export default function BasicTable({ headers, rowData, page, options }) {


    return (
        <TableContainer component={Paper} style={{ overflowY: "scroll", height: "70vh" }} >
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        {
                            headers?.map((header) => (
                                < TableCell align="left" > <b>{header}</b></TableCell>
                            ))

                        }
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
                                    {row?.StorageBackend == "web3" ? <TableCell sx={{ backgroundColor: "orange" }} align="right"><span>{(row?.StorageBackend)?.toUpperCase()}</span>
                                    </TableCell> :
                                        <TableCell sx={{ backgroundColor: "#70A1EB" }} align="right"><span>{(row.StorageBackend)?.toUpperCase()}</span></TableCell>}
                                    <TableCell align="right">{row?.Files ? row.Files.length : 0}</TableCell>
                                    <TableCell align="right">{moment.utc(row?.CreationTime).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
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
                                    <OptionsMenu options={options} fileName={row?.Name} fileId={row?.ID} />
                                </TableRow>
                            ))

                    }

                </TableBody>
            </Table>
        </TableContainer >
    );
}