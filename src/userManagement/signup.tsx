import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Button } from '@mui/material';
import { formStyles } from '../components/stylesheet';

export default function SignUp() {
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