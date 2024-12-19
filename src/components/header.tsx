import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import { Typography } from '@mui/material';
import { LogInSignUpButtons, LoggedInButtons } from './buttons';

interface AutoGridProps {
    isAuthenticated: Boolean;
}


export default function AutoGrid({ isAuthenticated }: AutoGridProps) {
    return (
        <Box sx={{ flexGrow: 1, marginTop: 2 }}>
            <Grid container spacing={3}>
                <Grid display="flex" justifyContent="flex-start" alignItems="center" size='grow'>
                    <Box>
                        <a href='/'>
                            <Typography>Web Forum</Typography>
                        </a>
                    </Box>
                </Grid>
                <Grid display='flex' justifyContent='right' size={6}>
                    {(isAuthenticated)
                        ? <LoggedInButtons></LoggedInButtons>
                        : <LogInSignUpButtons></LogInSignUpButtons>}
                </Grid>
            </Grid>
        </Box>
    );
}
