import { FormEvent, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/header";
import { Thread } from "../types/types";
import { ValidateThreadInput, CreateJWTHeader } from "../apiService/apiService";
import NotFound from "./notFound";
import { PageBoxStyle } from "../components/stylesheet";
import api from "../components/api";

import { AxiosError } from "axios";
import { Box, Button } from "@mui/material";
import TextField from '@mui/material/TextField';

const methods = ["create", "update", "delete"];
const methodsFunctions = [HandleCreateThread, HandleUpdateThread, HandleDeleteThread];

// routing into the different methods
export default function HandleThread(method: { method: string }) {
    const index = methods.indexOf(method.method);
    if (index !== -1) {
        return methodsFunctions[index]();
    } else {
        console.log("invalid method");
        return NotFound({ errorStatus: 404 });
    }
}

// HandleCreateThread and HandleUpdateThread have many similarities but logic is nested within own ftn
function HandleCreateThread() {
    // op_id handled in controllers.tsx
    const [userEntry, setUserEntry] = useState<Thread>({ title: '', content: '' });
    const [validEntry, setValidEntry] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>('');

    let navigate = useNavigate();

    async function PostThread(userEntry: Thread): Promise<{ success: Boolean, errorStatus: number | null }> {
        try {
            const jwtHeader = CreateJWTHeader();
            if (jwtHeader == null) {
                console.error();
                return { success: false, errorStatus: 401 };
            }
            console.log("Sending to backend post request")
            // error with response
            console.log(userEntry);
            const response = await api.post("/createThread", userEntry, { headers: jwtHeader });
            console.log("successfully posted")
            return { success: true, errorStatus: null };
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                if (error.response) {
                    if (error.response.status == 401) {
                        localStorage.removeItem("username");
                        localStorage.removeItem("jwtToken");
                    }
                    return { success: false, errorStatus: error.response.status };
                } else {
                    return { success: false, errorStatus: 500 };
                }
            }
            return { success: false, errorStatus: 404 };
        }
    };

    async function HandleRequest(event: FormEvent) {
        event.preventDefault();
        const { isValid, errorMessage } = ValidateThreadInput(userEntry);
        console.log("valid: ", isValid);
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
                <form onSubmit={HandleRequest}>
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

function HandleUpdateThread() {
    return (<></>);
}

function HandleDeleteThread() {
    console.log("deleting...");
    let postId = useParams().num;
    console.log("postId: ", postId);
    let navigate = useNavigate();

    async function DeleteThread(postID: string): Promise<{ success: Boolean, errorStatus: number | null }> {
        try {
            const jwtHeader = CreateJWTHeader();
            if (jwtHeader == null) {
                console.error();
                return { success: false, errorStatus: 401 };
            }
            console.log("Sending to backend delete request");
            const response = await api.delete(`/delete_thread/${postID}`, { headers: jwtHeader });
            if (response.status != 204) {
                return { success: false, errorStatus: 400 };
            }
            return { success: true, errorStatus: null };
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                if (error.response) {
                    if (error.response.status == 403) {
                        localStorage.removeItem("username");
                        localStorage.removeItem("jwtToken");
                    }
                    return { success: false, errorStatus: error.response.status };
                } else {
                    return { success: false, errorStatus: 500 };
                }
            }
            return { success: false, errorStatus: 404 };
        }
    }

    async function HandleRequest(postId: string) {
        const response = await DeleteThread(postId);
        if (response.success) {
            console.log(`successfully deleted thread post id: ${postId}`);
            navigate('/');
            window.location.reload();
        } else {
            NotFound({ errorStatus: response.errorStatus as number });
            window.location.reload();
        }
    }

    if (postId) {
        HandleRequest(postId);
    }

    return (<></>);
}
