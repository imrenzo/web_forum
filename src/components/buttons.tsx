import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// when user is not logged in yet
export function LogInSignUpButtons() {
    return (
        <Box>
            <Stack direction="row" spacing={2}>
                <Button variant="outlined" href="/login">Log In</Button>
                <Button variant="contained" href="/signup">Sign up</Button>
            </Stack>
        </Box>
    )
}

// when user is logged in
export function LoggedInButtons() {
    let navigate = useNavigate();
    function HandleLogout() {
        localStorage.removeItem("jwtToken");
        console.log("logged out");
        navigate('/');
        window.location.reload();
    }
    return (
        <Box>
            <Stack direction="row" spacing={2}>
                <Button variant="outlined" href="/myprofile">Profile</Button>
                <Button variant="contained" onClick={HandleLogout}>Log Out</Button>
            </Stack>
        </Box>
    )
}