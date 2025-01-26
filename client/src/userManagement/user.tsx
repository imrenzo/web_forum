import { FormEvent, useState, useEffect } from 'react';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import NotFound from '../pages/notFound';
import { formStyles } from '../components/stylesheet';
import api from '../services/api';

import {
    Box, Button, Typography, AppBar, Toolbar, Container
} from '@mui/material';
import AdbIcon from '@mui/icons-material/Adb';
import { Link } from 'react-router-dom';

export default function UserMethod() {
    const method = useParams().method;
    const navigate = useNavigate();
    console.log(method);

    if (method === "login") {
        return LogIn(navigate);
    } else if (method === "logout") {
        return LogOut(navigate);
    } else if (method === "signup") {
        return SignUp(navigate);
    } else {
        console.log("invalid method");
        return NotFound();
    }
}

function LogIn(navigate: NavigateFunction) {
    const [userData, setUserdata] = useState<{ username: string; password: string }>({ username: '', password: '' });
    const [invalidCred, setInvalidCred] = useState<boolean>(false);

    function HandleSubmit(event: FormEvent) {
        event.preventDefault();

        if (userData.username === '' || userData.password === '') {
            setInvalidCred(true);
            setUserdata({ username: '', password: '' });
            console.log("invalid credentials");
        } else {
            api.post("/user/login", userData)
                .then(function (response) {
                    setInvalidCred(false);
                    localStorage.setItem("jwtToken", response.data.token);
                    localStorage.setItem("username", userData.username);
                    console.log("logged in");
                    navigate('/');
                    window.location.reload();
                })
                .catch(function (response) {
                    setInvalidCred(true);
                })
        }
    }

    return (<>
        <Helmet>
            <title>Login</title>
        </Helmet>
        <Box sx={formStyles}>
            <Header></Header>
        </Box>
        <br></br>
        <Box sx={{
            border: 1,
            paddingTop: 2,
            paddingBottom: 2,
            ...formStyles
        }}>
            <form onSubmit={HandleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className='form'>
                    <div>
                        <input type='text' id='username' placeholder='Enter Username'
                            value={userData.username}
                            onChange={event => setUserdata(prevState => ({
                                ...prevState, username: event.target.value
                            }))}>
                        </input>
                    </div>
                    <div>
                        <input type='password' id='password' placeholder='Enter Password'
                            value={userData.password} onChange={event => setUserdata(prevState => ({
                                ...prevState, password: event.target.value
                            }))}>
                        </input>
                    </div>
                </div>
                <br></br>
                <div style={{ textAlign: 'center' }}>
                    {invalidCred && <p id="hiddenText" style={{ color: 'red' }}>Invalid username/ password</p>}
                    <Button variant='outlined' type="submit">Log In</Button>
                </div>
            </form>
        </Box>
    </>
    );
}

function LogOut(navigate: NavigateFunction) {
    useEffect(() => {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("username");
        console.log("logged out");
        navigate('/');
        window.location.reload();
    }, [])
    return (
        <></>
    );
}

function SignUp(navigate: NavigateFunction) {
    const [userData, setUserdata] = useState<{ username: string; password: string }>({ username: '', password: '' });
    const [invalidCred, setInvalidCred] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    function HandleSubmit(event: FormEvent) {
        event.preventDefault();

        if (userData.username === '' || userData.password === '') {
            setErrorMessage('Please enter a username/ password');
            setInvalidCred(true);
            setUserdata({ username: '', password: '' });
            console.log("invalid credentials");
        } else {
            api.post("/user/signup", userData)
                .then(function (response) {
                    console.log('successfully registered');
                    console.log(response.data.token);
                    setInvalidCred(false);
                    localStorage.setItem("jwtToken", response.data.token);
                    localStorage.setItem("username", userData.username);
                    console.log("successfully signed up & logged in");
                    navigate('/');
                    window.location.reload();
                })
                .catch(function (response) {
                    if (response.status === 409) {
                        setErrorMessage('Username is already taken');
                        setInvalidCred(true);
                    }
                })
        }
    };

    return (<>
        <Helmet>
            <title>Sign Up</title>
        </Helmet>
        <Box sx={formStyles}>
            <Header></Header>
        </Box>
        <br></br>
        <Box sx={{
            border: 1,
            paddingTop: 2,
            paddingBottom: 2,
            ...formStyles
        }}>
            <form onSubmit={HandleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className='form'>
                    <div>
                        <input type='text' id='username' placeholder='Enter Username'
                            value={userData.username}
                            onChange={event => setUserdata(prevState => ({
                                ...prevState, username: event.target.value
                            }))}>
                        </input>
                    </div>
                    <div>
                        <input type='password' id='password' placeholder='Enter Password'
                            value={userData.password} onChange={event => setUserdata(prevState => ({
                                ...prevState, password: event.target.value
                            }))}>
                        </input>
                    </div>
                </div>
                <br></br>
                <div style={{ textAlign: 'center' }}>{invalidCred && <p id="hiddenText" style={{ color: 'red' }}>{errorMessage}</p>}
                    <Button variant='contained' type="submit">Sign Up</Button>
                </div>
            </form>
        </Box>
    </>
    );
}

function Header() {
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
                </Toolbar>
            </Container>
        </AppBar>
    </>
    );
}