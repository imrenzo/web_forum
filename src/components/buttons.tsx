import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Sign } from 'node:crypto';

// when user is not logged in yet
export function LogInSignUpButtons() {
    return (
        <Stack direction="row" spacing={2}>
            <Button variant="outlined" href="/login">Log In</Button>
            <Button variant="contained" href="/signup">Sign up</Button>
        </Stack>
    )
}

// when user is logged in
export function LoggedInButtons() {
    return (
        <Stack direction="row" spacing={2}>
            <Button variant="outlined" href="/myprofile">Profile</Button>
            <Button variant="contained" href="/logout">Log Out</Button>
        </Stack>
    )
}