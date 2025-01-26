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
import { CreateJWTHeader } from '../services/apiService';
import { AxiosError } from 'axios';

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
    } else if (method === "change_password") {
        return ChangePassword(navigate);
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
                    {invalidCred && <p id="errorMessage" style={{ color: 'red' }}>Invalid username/ password</p>}
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
                <div style={{ textAlign: 'center' }}>{invalidCred && <p id="errorMessage" style={{ color: 'red' }}>{errorMessage}</p>}
                    <Button variant='contained' type="submit">Sign Up</Button>
                </div>
            </form>
        </Box>
    </>
    );
}

function ChangePassword(navigate: NavigateFunction) {
    const [prevPassword, setPrevPassword] = useState<string>("");
    const [newPassword1, setNewPassword1] = useState<string>("");
    const [newPassword2, setNewPassword2] = useState<string>("");
    const [invalidCred, setInvalidCred] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [changedPassword, setChangedPassword] = useState<boolean>(false);

    function ClearInputFields() {
        setPrevPassword("");
        setNewPassword1("");
        setNewPassword2("");
    }

    function HandleSubmit(event: FormEvent) {
        event.preventDefault();

        if (prevPassword === "" || newPassword1 === "" || newPassword2 === "") {
            setInvalidCred(true);
            ClearInputFields();
            setErrorMessage("Please fill in all fields");
        } else if (newPassword1 !== newPassword2) {
            setInvalidCred(true);
            setErrorMessage("Please ensure new passwords match");
        } else {
            const jwtHeader = CreateJWTHeader();
            if (jwtHeader == null) {
                console.error();
                navigate('/error/404');
            }
            console.log("Sending to backend change password request");
            api.post("/user/change_password", { prevPassword: prevPassword, newPassword: newPassword1 }, { headers: jwtHeader! })
                .then(function (response) {
                    setInvalidCred(false);
                    console.log("successfully changed password");
                    localStorage.removeItem("jwtToken");
                    localStorage.setItem("jwtToken", response.data.token);
                    setInvalidCred(false);
                    setChangedPassword(true);

                    // redirect after 5 seconds
                    setTimeout(() => {
                        navigate('/');
                        window.location.reload();
                    }, 5000)
                })
                .catch(function (error) {
                    if (error instanceof AxiosError) {
                        if (error.response) {
                            if (error.response.status === 401) {
                                setErrorMessage(error.response.data);
                                ClearInputFields();
                                setInvalidCred(true);
                            } else {
                                ClearInputFields();
                                setErrorMessage(error.response.data);
                                navigate(`/error/${error.response.status}`);
                            }
                        } else {
                            ClearInputFields();
                            setErrorMessage("unknown error");
                            navigate(`/error/404`);
                        }
                    }
                })

        }
    }
    return (<>
        <Helmet>
            <title>Change Password</title>
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
                        <input type='password' id='oldPassword' placeholder='Enter Old Password'
                            value={prevPassword}
                            onChange={event => setPrevPassword(event.target.value)}
                            autoComplete='off'
                        >
                        </input>
                    </div>
                    <div>
                        <input type='password' id='newPassword1' placeholder='Enter New Password'
                            value={newPassword1}
                            onChange={event => setNewPassword1(event.target.value)}
                            autoComplete='off'
                        >
                        </input>
                    </div>
                    <div>
                        <input type='password' id='newPassword2' placeholder='Re-enter New Password'
                            value={newPassword2}
                            onChange={event => setNewPassword2(event.target.value)}
                            autoComplete='off'
                        >
                        </input>
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    {invalidCred ? <p id="errorMessage" style={{ color: 'red' }}>{errorMessage}</p> : <br></br>}
                    <Button variant='outlined' type="submit">Submit</Button>
                    {changedPassword && (<>
                        <Typography variant='body1' sx={{ marginTop: 1 }}>Successfully changed password!</Typography>
                        <Typography variant='body1'>Redirecting to home in 5 seconds...</Typography>
                    </>)
                    }
                </div>
            </form>
        </Box>
    </>)
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
