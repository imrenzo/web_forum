import { FormEvent, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import NotFound from '../pages/notFound';
import { formStyles } from '../components/stylesheet';

import { Button } from '@mui/material';

export default function UserMethod() {
    let method = useParams().method;

    if (method == "login") {
        return LogIn();
    } else if (method == "logout") {
        return LogOut();
    } else if (method == "signup") {
        return SignUp();
    } else {
        console.log("invalid method");
        return NotFound();
    }
}

function LogIn() {
    const [userData, setUserdata] = useState<{ username: string; password: string }>({ username: '', password: '' });
    const [invalidCred, setInvalidCred] = useState<boolean>(false);
    let navigate = useNavigate();

    function HandleSubmit(event: FormEvent) {
        event.preventDefault();

        if (userData.username === '' || userData.password === '') {
            setInvalidCred(true);
            setUserdata({ username: '', password: '' });
            console.log("invalid credentials");
        } else {
            axios
                .post("http://localhost:8080/user/login", userData)
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

function LogOut() {
    let navigate = useNavigate();
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

function SignUp() {
    const [userData, setUserdata] = useState<{ username: string; password: string }>({ username: '', password: '' });
    const [invalidCred, setInvalidCred] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    let navigate = useNavigate();

    function HandleSubmit(event: FormEvent) {
        event.preventDefault();

        if (userData.username === '' || userData.password === '') {
            setErrorMessage('Please enter a username/ password');
            setInvalidCred(true);
            setUserdata({ username: '', password: '' });
            console.log("invalid credentials");
        } else {
            axios
                .post("http://localhost:8080/signup", userData)
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