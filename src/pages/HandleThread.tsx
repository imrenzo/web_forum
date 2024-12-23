import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import { Thread } from "../types/types";
import { ValidateThreadInput, PostThread } from "../contollers/controllers";
import NotFound from "./notFound";
import { PageBoxStyle } from "../components/stylesheet";

import { Box, Button } from "@mui/material";
import TextField from '@mui/material/TextField';


export function CreateThread() {
    /////////////////////// CHANGE op_id ///////////////////////
    const [userEntry, setUserEntry] = useState<Thread>({ op_id: 1, title: '', content: '' });
    const [validEntry, setValidEntry] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>('');

    let navigate = useNavigate();

    async function HandlePostThread(event: FormEvent) {
        event.preventDefault();

        const { isValid, errorMessage } = ValidateThreadInput(userEntry);
        if (!isValid) {
            setErrorMessage(errorMessage);
            setValidEntry(isValid);
            console.log(errorMessage);
            return NotFound({ errorStatus: 404 });
        }
        const sendThread = await PostThread(userEntry);
        if (sendThread.success) {
            console.log('successfully created thread');
            setValidEntry(false);
            navigate('/');
            window.location.reload();
        } else {
            NotFound({ errorStatus: sendThread.errorStatus as number });
            window.location.reload();
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
            <title>Create Thread</title>
            <Box sx={PageBoxStyle}>
                <Header></Header>
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


const methods = ["create", "update", "delete"];
const methodsFunctions = [CreateThread];

export default function HandleThread(method: { method: string }) {
    let navigate = useNavigate();
    const index = methods.indexOf(method.method);
    if (index !== -1) {
        return methodsFunctions[index]();
    } else {
        console.log("invalid method");
        return NotFound({ errorStatus: 404 });
    }
}

function UpdateThread() {
    return;
}

function DeleteThread() {
    return;
}
