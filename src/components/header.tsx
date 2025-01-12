import * as React from 'react';
import IsAuthenticated from './authenticate';
import { link } from './stylesheet';

import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import Stack from '@mui/material/Stack';

const pages: { [key: string]: string }[] = [{ 'Home': '/' }, { 'Create Thread': '/thread/create' }, { 'My Threads': '/mythreads' }];
const iconDropdown: { [key: string]: string }[] = [{ 'Settings': '/' }, { 'Log Out': '/user/logout' }];

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

    const OpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const OpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const CloseNavMenu = () => { setAnchorElNav(null); };

    const CloseUserMenu = () => { setAnchorElUser(null); };

    if (isLoading) {
        return null;
    }

    return (<>
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <a href='/' style={link}>
                        <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    </a>
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
                                onClick={OpenNavMenu}
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
                                onClose={CloseNavMenu}
                                sx={{ display: { xs: 'block', md: 'none' } }}
                            >
                                {pages.map((page) => {
                                    let key: string = Object.keys(page)[0];
                                    let href: string = page[key];
                                    return (
                                        <a href={href} style={link} key={key} >
                                            <MenuItem onClick={CloseNavMenu} >
                                                <Typography sx={{ textAlign: 'center' }}>{key}</Typography>
                                            </MenuItem>
                                        </a>
                                    )
                                })}
                            </Menu>
                        </Box>
                        : <></>}
                    <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
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
                                    <a href={href} style={link} key={key}>
                                        <Button
                                            onClick={CloseNavMenu}
                                            // align login and logout buttons to the right
                                            sx={{ my: 2, color: 'white', display: 'block' }}
                                        >
                                            {key}
                                        </Button>
                                    </a>
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
                                <IconButton onClick={OpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
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
                                onClose={CloseUserMenu}
                            >
                                {iconDropdown.map((page) => {
                                    let key: string = Object.keys(page)[0];
                                    let href: string = page[key];
                                    return (
                                        <a href={href} style={link} key={key}>
                                            <MenuItem onClick={CloseUserMenu}>
                                                <Typography sx={{ textAlign: 'center' }}>{key}</Typography>
                                            </MenuItem>
                                        </a>
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