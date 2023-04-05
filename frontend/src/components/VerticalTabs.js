import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Buckets from '../pages/Buckets/Buckets';
import { Container } from '@mui/material';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
            style={{ width: '100%' }}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div >
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};


function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

export default function VerticalTabs() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };



    return (
        <Box
            sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}
        >
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="Vertical tabs example"

                sx={{ borderRight: 2, borderColor: 'divider', height: '100vh', minWidth: '10%' }}
            >
                <Tab label="Dashboard" {...a11yProps(0)} />
                <Tab label="Buckets" {...a11yProps(1)} />
                <Tab label="Profile" {...a11yProps(2)} />
                <Tab label="Logout" {...a11yProps(3)} />
            </Tabs>
            <TabPanel value={value} index={0}>
                <div class="container display-wrapper"> Dashboard</div>
            </TabPanel>
            <TabPanel value={value} index={1}>
                <Container class="container display-wrapper"><Buckets /></Container>
            </TabPanel>
            <TabPanel value={value} index={2}>
                Profile
            </TabPanel>
            <TabPanel value={value} index={3}>
                Item Four
            </TabPanel>
            <TabPanel value={value} index={4}>
                Item Five
            </TabPanel>
            <TabPanel value={value} index={5}>
                Item Six
            </TabPanel>
            <TabPanel value={value} index={6}>
                Logout
            </TabPanel>
        </Box >
    );
}
