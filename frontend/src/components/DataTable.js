import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
    { field: 'id', headerName: 'ID', width: 160 },
    { field: 'name', headerName: 'Name', width: 160 },
    { field: 'network', headerName: 'Network', width: 160 },
    { field: 'created', headerName: 'Created On', width: 160 },
    { field: 'objects', headerName: 'Objects', width: 160 },
];

// const rows = [
//     { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
//     { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
//     { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
//     { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
//     { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
//     { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
//     { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
//     { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
//     { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
// ];

export default function DataTable({ data }) {
    return (
        <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={data}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                rowSelectionOnClick={false}
            />
        </div>
    );
}