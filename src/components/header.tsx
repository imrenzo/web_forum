import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import { Typography } from '@mui/material';
import { LogInSignUpButtons, LoggedInButtons } from './buttons';

function Header({isAuthenticated}: {isAuthenticated: Boolean}) {
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
export default Header;