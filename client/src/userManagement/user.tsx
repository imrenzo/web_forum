import { FormEvent, useState, useEffect } from 'react';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import NotFound from '../pages/notFound';
import { formStyles } from '../components/stylesheet';
import api from '../components/api';

import { Button } from '@mui/material';

export default function UserMethod() {
    const method = useParams().method;
    const navigate = useNavigate();
    console.log(method);

    if (method == "login") {
        return LogIn(navigate);
    } else if (method == "logout") {
        return LogOut(navigate);
    } else if (method == "signup") {
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

    return (
        <>
            <title>Login</title>
            <div style={formStyles}>
                <form onSubmit={HandleSubmit}>
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
                    <div style={{ textAlign: 'center' }}>{invalidCred && <p id="hiddenText" style={{ color: 'red' }}>Invalid username/ password</p>}
                        <Button variant='outlined' type="submit">Log In</Button>
                    </div>
                </form>
            </div>
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

    return (
        <div style={formStyles}>
            <form onSubmit={HandleSubmit}>
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

                <div style={{ textAlign: 'center' }}>{invalidCred && <p id="hiddenText" style={{ color: 'red' }}>{errorMessage}</p>}
                    <Button variant='contained' type="submit">Sign Up</Button>
                </div>
            </form>
        </div>

    );
}