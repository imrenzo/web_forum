import { FormEvent, useState, useEffect } from "react";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import Header from "../components/header";
import { GetThread, Thread, ThreadWithComments, Categories } from "../types/types";
import { CreateJWTHeader, ValidateThreadInput, GetThreadWithComments, GetCategories } from "../services/apiService";
import NotFound from "./notFound";
import api from "../services/api";
import { pageBoxStyle } from "../components/stylesheet";
import { Box, Button, FormControl, InputLabel, Select, TextField, MenuItem, SelectChangeEvent } from "@mui/material";
import { Helmet } from "react-helmet";

// routing into the different methods
export default function HandleThread() {
    const method = useParams().method;
    const id = useParams().id;

    if (method === "create") {
        if (id !== undefined) {
            console.log("invalid url");
            return NotFound();
        }
        return HandleCreateThread();
    } else if (method === "update" && id) {
        return HandleUpdateThread(id as string);
    } else {
        console.log("invalid method");
        return NotFound();
    }
}

function HandleCreateThread() {
    const navigate = useNavigate();
    const [userEntry, setUserEntry] = useState<Thread>({ title: '', content: '' });
    const [validEntry, setValidEntry] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [categories, setCategories] = useState<Categories>([]);
    const [selectedCategory, setSelectedCategory] = useState("Others");

    const selectCategoryClick = (event: SelectChangeEvent) => {
        setSelectedCategory(event.target.value as string);
    };

    async function HandlePostRequest(event: FormEvent) {
        event.preventDefault();
        // validate thread input
        const { isValid, errorMessage } = ValidateThreadInput(userEntry);
        if (!isValid) {
            setErrorMessage(errorMessage);
            setValidEntry(isValid);
            console.log(errorMessage);
            return;
        }

        // validate category input
        if (selectedCategory === '') {
            setErrorMessage("Please select a category");
            setValidEntry(false);
            console.log(errorMessage);
            return;
        }

        if (categories.find((category) => category.category_name === selectedCategory) === undefined) {
            setErrorMessage("Invalid Category input, please reload page");
            setValidEntry(isValid);
            console.log(errorMessage);
            return;
        }

        // make post request
        try {
            const jwtHeader = CreateJWTHeader();
            if (jwtHeader == null) {
                console.error();
                navigate("/error/401");
            }
            console.log("Sending to backend post thread request")
            const response = await api.post("/thread",
                { createThread: userEntry, category: selectedCategory }, { headers: jwtHeader! });
            console.log('successfully updated thread');
            setValidEntry(false);
            const threadID = response.data;
            navigate(`/thread_id/${threadID}`);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                if (error.response) {
                    if (error.response.status === 401) {
                        localStorage.removeItem("username");
                        localStorage.removeItem("jwtToken");
                        navigate("/error/401");
                    }
                    const errorStatus = error.response.status as number;
                    navigate(`/error/${errorStatus}`);
                } else {
                    navigate("/error/500");
                }
            }
            navigate("/error/404");
        }
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { id, value } = event.target;
        setUserEntry(prevState => ({
            ...prevState,
            [id]: value,
        }));
    }

    useEffect(() => {
        const getCategories = async () => {
            const { success, errorStatus, output } = await GetCategories();
            if (success) {
                setCategories(output as Categories);
            }
            else {
                navigate(`/error/${errorStatus}`);
            }
        }
        getCategories();
    }, [navigate]);

    return (
        <>
            <Helmet>
                <title>Create Thread</title>
            </Helmet>
            <Box sx={pageBoxStyle}>
                <Header></Header>
                <form onSubmit={HandlePostRequest}>
                    <Box sx={{ marginTop: 1, marginBottom: 1, }}>
                        <TextField fullWidth label="Title" id="title" value={userEntry.title} onChange={handleInputChange} multiline />
                    </Box>
                    <Box sx={{ marginTop: 1, marginBottom: 1, }}>
                        <TextField fullWidth label="Content" id="content" value={userEntry.content} onChange={handleInputChange} multiline />
                    </Box>
                    <FormControl fullWidth>
                        <InputLabel id="selectSubjectLabel">Subject</InputLabel>
                        <Select
                            labelId="selectSubject"
                            id="selectSubject"
                            label="Subject"
                            value={selectedCategory}
                            onChange={selectCategoryClick}
                        >
                            {categories.filter((category) => category.category_name !== "Others").map((category) => (
                                <MenuItem key={category.category_id} value={category.category_name}>
                                    {category.category_name}
                                </MenuItem>
                            ))};
                            <MenuItem key={"Others"} value={"Others"}>Others</MenuItem>
                        </Select>
                    </FormControl>
                    <Box sx={{ textAlign: 'right', }}>
                        {!validEntry ? <p id="hiddenText" style={{ color: 'red' }}>{errorMessage}</p> : <br></br>}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant='contained' type="submit">Submit</Button>
                        </Box>
                    </Box>
                </form>
            </Box>
        </>
    );
}

function HandleUpdateThread(threadId: string) {
    const [userEntry, setUserEntry] = useState<Thread>({ title: '', content: '' });
    const [validEntry, setValidEntry] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const navigate = useNavigate();

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
    }, [threadId, navigate]);

    async function HandlePutRequest(event: FormEvent) {
        event.preventDefault();
        // validate thread input
        const { isValid, errorMessage } = ValidateThreadInput(userEntry);
        if (!isValid) {
            setErrorMessage(errorMessage);
            setValidEntry(isValid);
            console.log(errorMessage);
            navigate('*');
        }

        try {
            const jwtHeader = CreateJWTHeader();
            if (jwtHeader == null) {
                console.error();
                navigate("/error/401");
            }
            console.log("Sending to backend PUT thread request")
            console.log(userEntry);
            const response = await api.put(`/thread/${threadId}`, userEntry, { headers: jwtHeader! });
            if (response.status !== 204) {
                navigate("/error/500");
            }
            console.log("successfully updated thread");
            setValidEntry(false);
            navigate(`/thread_id/${threadId}`);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                if (error.response) {
                    if (error.response.status === 401) {
                        localStorage.removeItem("username");
                        localStorage.removeItem("jwtToken");
                        navigate("/error/401");
                    }
                    navigate(`/error/${error.response.status}`);
                } else {
                    navigate("/error/500");
                }
            }
            navigate("/error/404");
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
            <Box sx={pageBoxStyle}>
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

export async function HandleDeleteThread(threadID: string, navigate: NavigateFunction) {
    try {
        const jwtHeader = CreateJWTHeader();
        if (jwtHeader == null) {
            console.error();
            navigate("/error/401");
        }
        console.log("Sending to backend delete thread request");
        const response = await api.delete(`/thread/${threadID}`, { headers: jwtHeader! });
        if (response.status !== 204) {
            navigate(`/error/500`);
        }
        console.log(`successfully deleted thread, id: ${threadID}`);
        navigate('/');
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response) {
                if (error.response.status === 403) {
                    localStorage.removeItem("username");
                    localStorage.removeItem("jwtToken");
                    navigate(`/error/403`);
                }
                navigate(`/error/${error.response.status}`);
            } else {
                navigate(`/error/500`);
            }
        }
        navigate(`/error/404`);
    }
}
