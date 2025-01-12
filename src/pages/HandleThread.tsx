import { FormEvent, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import Header from "../components/header";
import { GetThread, Thread, ThreadWithComments } from "../types/types";
import { ValidateThreadInput, CreateJWTHeader, GetThreadWithComments } from "../apiService/apiService";
import NotFound from "./notFound";
import api from "../components/api";
import { PageBoxStyle } from "../components/stylesheet";

import { Box, Button } from "@mui/material";
import TextField from '@mui/material/TextField';

// routing into the different methods
export default function HandleThread() {
    let method = useParams().method;
    let id = useParams().id;

    if (method == "create") {
        if (id != undefined) {
            console.log("invalid url");
            return NotFound();
        }
        return HandleCreateThread();
    } else if (method == "update" && id) {
        return HandleUpdateThread(id as string);
    } else if (method == "delete" && id) {
        return HandleDeleteThread(id as string);
    } else {
        console.log("invalid method");
        return NotFound();
    }
}

// HandleCreateThread and HandleUpdateThread have many similarities but logic is nested within own ftn
function HandleCreateThread() {
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
            const response = await api.post("/thread/create", userEntry, { headers: jwtHeader });
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

    async function HandlePostRequest(event: FormEvent) {
        event.preventDefault();
        const { isValid, errorMessage } = ValidateThreadInput(userEntry);
        console.log("valid: ", isValid);
        if (!isValid) {
            setErrorMessage(errorMessage);
            setValidEntry(isValid);
            console.log(errorMessage);
            navigate('*');
        }
        const sendThread = await PostThread(userEntry);
        if (sendThread.success) {
            console.log('successfully created thread');
            setValidEntry(false);
            navigate('/');
        } else {
            // NotFound({ errorStatus: sendThread.errorStatus as number });
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
                <form onSubmit={HandlePostRequest}>
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

function HandleUpdateThread(threadId: string) {
    const [userEntry, setUserEntry] = useState<Thread>({ title: '', content: '' });
    const [validEntry, setValidEntry] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>('');

    let navigate = useNavigate();

    useEffect(() => {
        if (threadId) {
            const fetchData = async () => {
                console.log("Getting thread with comments");
                const { isValid, errorMessage, output } = await GetThreadWithComments(threadId as string);
                if (!isValid) {
                    console.log(errorMessage);
                    navigate('*');
                    return;
                }
                const ThreadWithComments = output as ThreadWithComments;
                const Thread = ThreadWithComments.thread as GetThread;
                setUserEntry({ title: Thread.thread_title, content: Thread.thread_info });
            };
            fetchData();
        }
    }, [threadId]);


    async function PutThread(userEntry: Thread): Promise<{ success: Boolean, errorStatus: number | null }> {
        try {
            const jwtHeader = CreateJWTHeader();
            if (jwtHeader == null) {
                console.error();
                return { success: false, errorStatus: 401 };
            }
            console.log("Sending to backend PUT request")
            console.log(userEntry);
            const response = await api.put(`/thread/update/${threadId}`, userEntry, { headers: jwtHeader });
            console.log("successfully updated thread")
            if (response.status != 204) {
                return { success: false, errorStatus: 400 };
            }
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

    async function HandlePutRequest(event: FormEvent) {
        event.preventDefault();
        console.log("sending put request");
        const { isValid, errorMessage } = ValidateThreadInput(userEntry);
        console.log("valid: ", isValid);
        if (!isValid) {
            setErrorMessage(errorMessage);
            setValidEntry(isValid);
            console.log(errorMessage);
            navigate('*');
        }
        const sendThread = await PutThread(userEntry);
        if (sendThread.success) {
            console.log('successfully created thread');
            setValidEntry(false);
            navigate(`/thread_id/${threadId}`);
            window.location.reload();
        } else {
            const errorStatus = sendThread.errorStatus as number;
            navigate(`/error/${errorStatus}`);
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
            <title>Update Thread</title>
            <Box sx={PageBoxStyle}>
                <Header></Header>
                <form onSubmit={HandlePutRequest}>
                    <Box sx={{ marginTop: 1, marginBottom: 1, }}>
                        <TextField fullWidth label="Title" id="title" value={userEntry.title} onChange={handleInputChange} multiline />
                    </Box>
                    <Box sx={{ marginTop: 1, marginBottom: 1, }}>
                        <TextField fullWidth label="Content" id="content" value={userEntry.content} onChange={handleInputChange} multiline />
                    </Box>
                    <div style={{ textAlign: 'right' }}>{!validEntry && <p id="hiddenText" style={{ color: 'red' }}>{errorMessage}</p>}
                        <Button variant='contained' type="submit">Update thread</Button>
                    </div>
                </form>
            </Box>
        </>
    );
}

function HandleDeleteThread(threadId: string) {
    let navigate = useNavigate();

    async function DeleteThread(threadID: string): Promise<{ success: Boolean, errorStatus: number | null }> {
        try {
            const jwtHeader = CreateJWTHeader();
            if (jwtHeader == null) {
                console.error();
                return { success: false, errorStatus: 401 };
            }
            console.log("Sending to backend delete request");
            const response = await api.delete(`/thread/delete/${threadID}`, { headers: jwtHeader });
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

    async function HandleDeleteRequest(threadId: string) {
        const response = await DeleteThread(threadId);
        if (response.success) {
            console.log(`successfully deleted thread thread id: ${threadId}`);
            navigate('/');
        } else {
            const status = response.errorStatus as number;
            navigate(`/error/${status}`);
        }
    }

    if (threadId) {
        HandleDeleteRequest(threadId);
    }

    return (<></>);
}
