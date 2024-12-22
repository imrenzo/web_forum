import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/header";
import IsAuthenticated from "../components/authenticate";
import { BoxStyle } from "../components/stylesheet";
import { Thread } from "../types/types";
import { PostThread } from "../contollers/controllers";

import { Box, Button } from "@mui/material";
import TextField from '@mui/material/TextField';

export default function CreateThread() {
    /////////////////////// CHANGE op_id ///////////////////////
    const [userEntry, setUserEntry] = useState<Thread>({ op_id: 1, title: '', content: '' });
    const [validEntry, setValidEntry] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>('');

    let navigate = useNavigate();

    function HandlePostThread(event: FormEvent) {
        event.preventDefault();
        if (userEntry.title == '' || userEntry.content == '') {
            setErrorMessage("Both title and content needs to be filled in");
            setValidEntry(false);
            console.log("Invalid Inputs");
        } else {
            const sendThread = async () => {
                try {
                    const sendingThread = await PostThread(userEntry);
                    console.log('successfully registered');
                    setValidEntry(false);
                    navigate('/');
                    window.location.reload();
                } catch (error: any) {
                    console.log(error.message);
                    navigate('*');
                    window.location.reload();
                }
            };
            sendThread();
        }
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { id, value } = event.target;
        setUserEntry(prevState => ({
            ...prevState,
            [id]: value,
        }));
    }

    return (
        <>
            <Box sx={BoxStyle}>
                <Header isAuthenticated={IsAuthenticated()}></Header>
                <form onSubmit={HandlePostThread}>
                    <Box sx={{ marginTop: 1, marginBottom: 1, }}>
                        <TextField fullWidth label="Title" id="title" value={userEntry.title} onChange={handleInputChange} multiline />
                    </Box>
                    <Box sx={{ marginTop: 1, marginBottom: 1, }}>
                        <TextField fullWidth label="Content" id="content" value={userEntry.content} onChange={handleInputChange} multiline />
                    </Box>
                    <div style={{ textAlign: 'right' }}>{!validEntry && <p id="hiddenText" style={{ color: 'red' }}>{errorMessage}</p>}
                        <Button variant='contained' type="submit">Submit</Button>
                    </div>
                </form>
            </Box>
        </>
    );
}

