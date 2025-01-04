import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Button } from '@mui/material';
import { formStyles } from '../components/stylesheet';

export default function LogIn() {
    const [userData, setUserdata] = useState<{ username: string; password: string }>({ username: '', password: '' });
    const [invalidCred, setInvalidCred] = useState<boolean>(false);
    let navigate = useNavigate();

    // // ensure user doesn't have JWT token at login page
    // useEffect(() => {
    //     localStorage.removeItem("jwtToken");
    // }, []);

    function HandleSubmit(event: FormEvent) {
        event.preventDefault();

        if (userData.username === '' || userData.password === '') {
            setInvalidCred(true);
            setUserdata({ username: '', password: '' });
            console.log("invalid credentials");
        } else {
            axios
                .post("http://localhost:8080/login", userData)
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