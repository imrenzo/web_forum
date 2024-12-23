import { Link } from 'react-router-dom';
import Header from '../components/header';
import { PageBoxStyle } from '../components/stylesheet';

import { Box } from '@mui/material';

export default function NotFound(errorStatus: { errorStatus: number }) {
    return (
        <>
            <Box sx={PageBoxStyle}>
                <title>Error</title>
                <Header></Header>
                <div>
                    <h1>{errorStatus.errorStatus}
                    </h1>
                    <p>Oops! The page you're looking for doesn't exist.</p>
                    <Link to="/" >Go back to Home</Link>
                </div>
            </Box>
        </>
    );
};
