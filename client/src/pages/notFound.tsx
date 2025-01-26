import { Link, useParams } from 'react-router-dom';
import Header from '../components/header';
import { pageBoxStyle } from '../components/stylesheet';

import { Box } from '@mui/material';

export default function NotFound() {
    const status = useParams().status;

    return (
        <>
            <Box sx={pageBoxStyle}>
                <title>Error</title>
                <Header></Header>
                <div>
                    <h1>{status !== undefined ? status : 404}
                    </h1>
                    <p>Oops! The page you're looking for doesn't exist.</p>
                    <Link to="/" >Go back to Home</Link>
                </div>
            </Box>
        </>
    );
};
