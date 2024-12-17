import { FormEvent, useEffect, useState } from 'react';
import CSS from "csstype";
import axios from "axios";

function MyApp() {
    const [userData, setUserdata] = useState({ username: '', password: '' });
    // const [password, setPassword] = useState('');
    const [validCred, setValidCred] = useState(false);

    const formStyles: CSS.Properties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '10%',
    }

    function HandleSubmit(event: FormEvent) {
        event.preventDefault();
        if (userData.username === '' || userData.password === '') {
            setValidCred(true);
            setUserdata({ username: '', password: '' });
            console.log("invalid credentials");
        } else {
            axios
                .post("http://localhost:8080/")
                .then(function (response) {
                    if (!response.data) {
                        setValidCred(false);
                    }
                })

        }
    }

    return (
        <div style={formStyles}>
            <form onSubmit={HandleSubmit}>
                <div className='form'>
                    <div>
                        <span>Username:&nbsp;</span>
                        <input type='text' id='username' placeholder='Enter Username'
                            value={userData.username}
                            onChange={event => setUserdata(prevState => ({
                                ...prevState, username: event.target.value
                            }))}>
                        </input>
                    </div>
                    <div>
                        <span>Password:&nbsp;&nbsp;</span>
                        <input type='password' id='password' placeholder='Enter Password'
                            value={userData.password} onChange={event => setUserdata(prevState => ({
                                ...prevState, password: event.target.value
                            }))}>
                        </input>
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>{validCred && <p id="hiddenText" style={{ color: 'red' }}>Invalid username/ password</p>}
                    <button>Log In</button>
                </div>
            </form>
        </div>

    );
}

export default MyApp;