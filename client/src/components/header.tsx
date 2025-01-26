import * as React from 'react';
import IsAuthenticated from '../services/authenticate';

import {
    Box, Button, Typography, AppBar, Toolbar, IconButton,
    Menu, Container, Avatar, Tooltip, MenuItem, Stack
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AdbIcon from '@mui/icons-material/Adb';
import { Link } from 'react-router-dom';

const pages: { [key: string]: string }[] =
    [{ 'Home': '/' }, { 'Create Thread': '/thread/create' }, { 'My Threads': '/mythreads' }];
const iconDropdown: { [key: string]: string }[] = [{ 'Log Out': '/user/logout' }];

function LogInSignUpButtons() {
    const ButtonStyles = {
        // swap background & font color from Bar
        backgroundColor: 'white',
        color: '#1976D2',
        '&:hover': {
            backgroundColor: '#448aff',
        },
    }

    return (
        <Box>
            <Stack direction="row" spacing={2}>
                <Button variant="contained" href="/user/login" sx={ButtonStyles}>Log In</Button>
                <Button variant="contained" href="/user/signup" sx={ButtonStyles}>Sign up</Button>
            </Stack>
        </Box>
    );
}

// From MUI with some tweaking
export default function Header() {
    const { isAuthenticated, isLoading } = IsAuthenticated();
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const username = localStorage.getItem("username");

    const openNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const openUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const closeNavMenu = () => { setAnchorElNav(null); };

    const closeUserMenu = () => { setAnchorElUser(null); };

    if (isLoading) {
        return null;
    }

    return (<>
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Box sx={{ textDecoration: 'none', }}>
                        <Link to={'/'} style={{ color: 'inherit', textDecoration: 'none' }}>
                            <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                        </Link>
                    </Box>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        Forum
                    </Typography>
                    {isAuthenticated
                        ? <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={openNavMenu}
                                color="inherit"
                            >
                                <MenuIcon></MenuIcon>
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={closeNavMenu}
                                sx={{ display: { xs: 'block', md: 'none' } }}
                            >
                                {pages.map((page) => {
                                    let key: string = Object.keys(page)[0];
                                    let href: string = page[key];
                                    return (
                                        <Box sx={{ textDecoration: 'none' }} key={key}>
                                            <Link to={href} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                <MenuItem onClick={closeNavMenu} >
                                                    <Typography sx={{ textAlign: 'center' }}>{key}</Typography>
                                                </MenuItem>
                                            </Link>
                                        </Box>
                                    )
                                })}
                            </Menu>
                        </Box>
                        : <></>}
                    <Box sx={{ textDecoration: 'none' }}>
                        <Link to={'/'} style={{ color: 'inherit', textDecoration: 'none' }}>
                            <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                        </Link>
                    </Box>
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        Forum
                    </Typography>
                    {isAuthenticated
                        ? <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {pages.map((page) => {
                                let key: string = Object.keys(page)[0];
                                let href: string = page[key];
                                return (
                                    <Box sx={{ textDecoration: 'none' }} key={key}>
                                        <Link to={href} style={{ color: 'inherit', textDecoration: 'none' }}>
                                            <Button
                                                onClick={closeNavMenu}
                                                // align login and logout buttons to the right
                                                sx={{ my: 2, color: 'white', display: 'block' }}
                                            >
                                                {key}
                                            </Button>
                                        </Link>
                                    </Box>
                                )
                            })}
                        </Box>
                        : <></>}
                    {!(isAuthenticated)
                        ? <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <LogInSignUpButtons></LogInSignUpButtons>
                        </Box>
                        : <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <Tooltip title="Open settings">
                                <IconButton onClick={openUserMenu} sx={{ p: 0 }}>
                                    <Avatar>{username == null ? '' : username[0].toUpperCase()}</Avatar>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={closeUserMenu}
                            >
                                {iconDropdown.map((page) => {
                                    let key: string = Object.keys(page)[0];
                                    let href: string = page[key];
                                    return (
                                        <Box sx={{ textDecoration: 'none' }} key={key}>
                                            <Link to={href} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                <MenuItem onClick={closeUserMenu}>
                                                    <Typography sx={{ textAlign: 'center' }}>{key}</Typography>
                                                </MenuItem>
                                            </Link>
                                        </Box>
                                    )
                                })}
                            </Menu>
                        </Box>
                    }
                </Toolbar>
            </Container>
        </AppBar>
    </>
    );
}