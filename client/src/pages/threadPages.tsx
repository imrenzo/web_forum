import * as React from 'react';
import { FormEvent, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AxiosError } from "axios";
import { HandleDeleteThread } from './threadMethods';
import CreateComment, { HandleDeleteComment } from '../services/handleComment';
import { ValidateCommentInput } from '../services/apiService';
import { GetThreadsCardsProps, Categories, GetThread, ThreadWithComments, Comments, Comment } from '../types/types';
import Header from "../components/header";
import FormatDate from "../components/dateformat";
import { CreateJWTHeader, GetCategories, CheckIsOwner, GetThreadWithComments } from '../services/apiService';
import api from '../services/api';
import { pageBoxStyle } from "../components/stylesheet";

import CommentIcon from '@mui/icons-material/Comment';
import {
    Tooltip, CardActions, CardContent, Typography, IconButton, Box,
    Card, MenuItem, Select, SelectChangeEvent, Chip,
    FormControl, InputLabel, CardHeader, Avatar,
    Toolbar, Menu, Container, TextField, Button,
} from '@mui/material';
import { red } from '@mui/material/colors';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddCommentIcon from '@mui/icons-material/AddComment';
import SearchIcon from "@mui/icons-material/Search";
import { Helmet } from 'react-helmet';

// for threads in homepage
function AllThreads({ threads }: { threads: GetThreadsCardsProps }) {
    return (
        <>
            {threads.length === 0
                ? <Box>
                    <br></br>
                    <Typography variant='body1'>No threads yet. Create the first Thread!!</Typography >
                </Box>
                : <Box>
                    {threads.map((threads) =>
                        <Card key={threads.thread_id} variant="outlined" sx={{ width: '100%', marginTop: 2 }}>
                            <React.Fragment>
                                <CardContent>
                                    <Typography variant="h4" component="div">
                                        {threads.thread_title}
                                    </Typography>
                                    <br></br>
                                    <Chip label={threads.category_name} />
                                    <br></br>
                                    <br></br>
                                    <Typography variant='body1'>
                                        {threads.thread_info}
                                    </Typography>
                                </CardContent>
                            </React.Fragment>
                            <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'space-between', }}>
                                <Typography variant='subtitle1'>
                                    &nbsp;By {threads.username}: {FormatDate(threads.thread_date)}
                                </Typography>
                                <Box>
                                    <Link to={`/thread_id/${threads.thread_id}`}>
                                        <Tooltip title="View Comment">
                                            <IconButton aria-label="view comment icon">
                                                <CommentIcon sx={{ fontSize: 35 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Link>
                                </Box>
                            </CardActions>
                        </Card>
                    )}
                </Box>
            }
        </>
    );
}

// for individiual threads
function ThreadCard({ thread }: { thread: GetThread }) {
    const [addCommentBox, setAddCommentBox] = useState(false);
    const [comment, setComment] = useState("");
    const [errorMessage, setErrorMessage] = useState<string>('');
    const navigate = useNavigate();
    const [isOwner, setIsOwner] = useState(false); //prevent dropdown ftn from rerendering
    const threadId = useParams().id;

    // post req to backend
    async function HandleAddComment(event: FormEvent) {
        event.preventDefault();
        const { isValid, errorMessage } = ValidateCommentInput(comment);
        if (!isValid) {
            setErrorMessage(errorMessage);
            console.log(errorMessage);
            return;
        }

        const createComment = await CreateComment(comment, threadId as string);
        if (createComment.success) {
            console.log('successfully created comment');
            navigate(`/thread_id/${threadId}`);
            window.location.reload();
        } else {
            const errorStatus = createComment.errorStatus as number;
            navigate(`/error/${errorStatus}`);
        }
    }

    function ThreadDropDownButton({ threadId }: { threadId: number }) {
        const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
        const OpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
            setAnchorElUser(event.currentTarget);
        };

        const CloseUserMenu = () => { setAnchorElUser(null); };

        function handleDeleteThread() {
            CloseUserMenu();
            const confirmed = window.confirm("Are you sure you want to delete this thread?");
            if (confirmed) {
                HandleDeleteThread(String(threadId), navigate);
            }
        };

        function handleUpdateThread() {
            CloseUserMenu();
            navigate(`/thread/update/${threadId}`);
        }

        useEffect(() => {
            const verifiedOwner = async () => {
                const verifyOwner = await CheckIsOwner(threadId);
                console.log("is owner? ", verifyOwner.success);
                if (verifyOwner.success) {
                    setIsOwner(true);
                } else {
                    setIsOwner(false);
                }
            }
            verifiedOwner();
        }, [threadId]);

        return (isOwner
            ? <Container maxWidth="xs">
                <Toolbar disableGutters>
                    <Box sx={{ flexGrow: 0 }}>
                        <IconButton onClick={OpenUserMenu} sx={{ p: 0 }}>
                            <MoreVertIcon></MoreVertIcon>
                        </IconButton>
                        <Menu
                            sx={{ mt: '45px' }}
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={CloseUserMenu}
                        >
                            <MenuItem onClick={handleUpdateThread}>
                                <Typography sx={{ textAlign: 'center' }}>Edit Thread</Typography>
                            </MenuItem>
                            <MenuItem onClick={handleDeleteThread}>
                                <Typography sx={{ textAlign: 'center', }}>Delete Thread</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
            : <></>);
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { id, value } = event.target;
        setComment(value);
    }

    return (
        <>
            <title>{thread.thread_id}</title>
            <Card sx={{ width: '100%' }}>
                <CardHeader
                    avatar={
                        <Avatar sx={{ bgcolor: red[500] }} >
                            {thread == null ? <></> : <p>{thread.username[0].toUpperCase()}</p>}
                        </Avatar>
                    }
                    action={<ThreadDropDownButton threadId={thread.thread_id}></ThreadDropDownButton>}
                    title={thread == null ? '' : <Typography>{thread.username}</Typography>}
                />
                <CardContent sx={{ overflow: 'hidden', }}>
                    <Typography variant="h5"
                        sx={{ color: 'text.primary', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '700' }}>
                        {thread == null ? <></> : <>{thread.thread_title}</>}
                    </Typography>
                    <Typography>&nbsp;</Typography>
                    <Typography variant="body1"
                        sx={{ color: 'text.primary', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {thread == null ? <></> : <>{thread.thread_info}</>}
                    </Typography>
                </CardContent>
                <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'space-between', }}>
                    <Typography variant='subtitle1'>
                        &nbsp;{FormatDate(thread.thread_date as string)}
                    </Typography>
                    <Box>
                        <Tooltip title="Add Comment">
                            <IconButton aria-label="add comment button" onClick={() => setAddCommentBox(!addCommentBox)}>
                                <AddCommentIcon sx={{ fontSize: 35 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </CardActions>
            </Card >
            <Card sx={addCommentBox ? { marginTop: 1, display: 'block' } : { marginTop: 1, display: 'none' }}>
                <form onSubmit={HandleAddComment}>
                    <Box sx={{ marginTop: 1 }}>
                        <TextField fullWidth label="Add Comment" id="addComment" value={comment} onChange={handleInputChange} multiline />
                    </Box>
                    <div style={{ textAlign: 'right' }}>
                        <p id="errorMessage" style={{ color: 'red' }}>{errorMessage}</p>
                        <Button variant='contained' type="submit">Post Comment</Button>
                    </div>
                </form>
            </Card>
        </>
    )
}

// for individiual threads
function CommentsCard({ comments }: { comments: Comments }) {
    const navigate = useNavigate();
    const username = localStorage.getItem("username");
    const [newComment, setNewComment] = useState<string>("");
    const [commentID, setCommentID] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    // put req to backend
    async function HandleUpdateComment(event: FormEvent) {
        event.preventDefault();
        // validate comment input
        const { isValid, errorMessage } = ValidateCommentInput(newComment);
        if (!isValid) {
            setErrorMessage(errorMessage);
            console.log(errorMessage);
            return;
        }
        try {
            const jwtHeader = CreateJWTHeader();
            if (jwtHeader == null) {
                console.error();
                return { success: false, errorStatus: 401, threadID: null };
            }

            // send put request
            console.log("Sending to backend PUT comment request");
            const response = await api.put(`/comment/${commentID}`, newComment, { headers: jwtHeader });
            if (response.status === 204) {
                console.log("successfully commented");
                window.location.reload();
            } else {
                navigate("/error/500");
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response) {
                    if (error.response.status === 401) {
                        localStorage.removeItem("username");
                        localStorage.removeItem("jwtToken");
                    }
                    navigate(`/error/${error.response.status}`);
                } else {
                    navigate(`/error/500`);
                }
            }
            navigate(`/error/404`);
        }
    }

    function CommentDropDownButton({ commentID }: { commentID: number }) {
        const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
        const OpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
            setAnchorElUser(event.currentTarget);
        };

        const CloseUserMenu = () => { setAnchorElUser(null); };

        function UpdateCommentClick() {
            CloseUserMenu();
            setCommentID(commentID);
            const currentComment = comments.find(comment => comment.comment_id === commentID) as Comment;
            setNewComment(currentComment.comment_info);
        };

        function DeleteCommentClick() {
            CloseUserMenu();
            const confirmed = window.confirm("Are you sure you want to delete this comment?");
            if (confirmed) {
                HandleDeleteComment(String(commentID), navigate);
            }
        };

        return (
            <Container maxWidth="xs">
                <Toolbar disableGutters>
                    <Box sx={{ flexGrow: 0 }}>
                        <IconButton onClick={OpenUserMenu} sx={{ p: 0 }}>
                            <MoreVertIcon></MoreVertIcon>
                        </IconButton>
                        <Menu
                            sx={{ mt: '45px' }}
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={CloseUserMenu}
                        >
                            <MenuItem onClick={UpdateCommentClick}>
                                <Typography sx={{ textAlign: 'center' }}>Edit Comment</Typography>
                            </MenuItem>
                            <MenuItem onClick={DeleteCommentClick}>
                                <Typography sx={{ textAlign: 'center', }}>Delete Comment</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        )
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { id, value } = event.target;
        setNewComment(value);
    }

    return (
        <Card sx={{ width: '100%', marginTop: 2 }}>
            {comments.map((comment) => (
                <Card key={comment.comment_id} style={{ border: "none", boxShadow: "none" }}>
                    <CardHeader
                        avatar={
                            <Avatar sx={{ bgcolor: red[500] }} >
                                {comment.username[0].toUpperCase()}
                            </Avatar>
                        }
                        action={
                            comment.username === username ? <CommentDropDownButton commentID={comment.comment_id} /> : <></>
                        }
                        title={comment.username}
                        subheader={FormatDate(comment.comment_date)}
                    />
                    {commentID === comment.comment_id
                        ? <Box sx={{ m: 1, }}>
                            <form onSubmit={HandleUpdateComment}>
                                <Box>
                                    <TextField fullWidth label="Comment" id="updateCommentBox" value={newComment} onChange={handleInputChange} multiline />
                                </Box>
                                <div style={{ textAlign: 'right' }}>
                                    <p id="errorMessage" style={{ color: 'red' }}>{errorMessage}</p>
                                    <Button variant='contained' type="submit">Submit</Button>
                                </div>
                            </form>
                        </Box>
                        : <CardContent sx={{ overflow: 'hidden', }}>
                            <Typography variant="body1"
                                sx={{ color: 'text.primary', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                                {comment.comment_info}
                            </Typography>
                        </CardContent>
                    }
                </Card>
            ))}
        </Card>
    );
}

export function LoadIndivThread() {
    // get individual thread and comments
    const [data, setData] = useState<ThreadWithComments>({ thread: null, comments: null });
    const threadId = useParams().id;
    const navigate = useNavigate();

    useEffect(() => {
        if (threadId) {
            const fetchData = async () => {
                console.log("Getting thread with comments");
                const { isValid, errorMessage, output } = await GetThreadWithComments(threadId as string);
                if (!isValid) {
                    console.log(errorMessage);
                    navigate('*');
                    window.location.reload();
                    return;
                }
                setData(output as ThreadWithComments);
            };
            fetchData();
        }
    }, [threadId, navigate]);


    return (
        <>
            <Box sx={pageBoxStyle}>
                <Header></Header>
                <Card variant="outlined" sx={{ width: '100%' }}>
                    {data.thread != null
                        ? <ThreadCard thread={data.thread as GetThread}></ThreadCard>
                        : <></>}
                </Card>
                {data.comments != null
                    ? <CommentsCard comments={data.comments}></CommentsCard>
                    : <></>
                }
            </Box>
        </>
    );
}

export function MyThreads() {
    const [threads, setThreads] = useState<GetThreadsCardsProps>([]);
    const [categories, setCategories] = useState<Categories>([]);
    const [getCategories, setGetCategories] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [fetchedData, setFetchedData] = useState<boolean>(false);

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const jwtHeader = CreateJWTHeader();
                if (jwtHeader == null) {
                    console.error();
                    return { success: false, errorStatus: 401 };
                }
                console.log("Sending to backend get request");
                const response = await api.get("/mythreads", { headers: jwtHeader });
                if (response.data == null) {
                    setThreads([]);
                } else {
                    setThreads(response.data);
                }
                setFetchedData(true);
            } catch (error) {
                console.log(error);
                setThreads([]);
            }
        };

        const getCategories = async () => {
            const { success, errorStatus, output } = await GetCategories();
            if (success) {
                if (output == null) {
                    setCategories([]);
                } else {
                    setCategories(output as Categories);
                }
            }
            else {
                setGetCategories(false);
                console.log("unable to get categories, error status: ", errorStatus);
            }
        }

        fetchThreads();
        getCategories();
    }, []);

    return (
        <>
            <Helmet>
                <title>Web Forum</title>
            </Helmet>
            <Box sx={pageBoxStyle}>
                <Header></Header>
                {getCategories
                    ? <CategoryFilter
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        categories={categories}
                    />
                    : <></>}
                {fetchedData
                    ? <AllThreads threads={threads.filter((thread) => selectedCategory === "All"
                        ? true : thread.category_name === selectedCategory)}></AllThreads>
                    : <></>}
            </Box>
        </>
    );
}

function CategoryFilter(
    { selectedCategory, setSelectedCategory, categories }:
        {
            selectedCategory: string,
            setSelectedCategory: React.Dispatch<React.SetStateAction<string>>,
            categories: Categories
        }
) {

    const selectCategoryClick = (setSelectedCategory: React.Dispatch<React.SetStateAction<string>>) => (event: SelectChangeEvent) => {
        setSelectedCategory(event.target.value as string);
    };

    return (
        <Box sx={{ marginTop: 2, }}>
            <FormControl fullWidth>
                <InputLabel id="selectSubjectLabel">Subject</InputLabel>
                <Select
                    labelId="selectSubject"
                    id="selectSubject"
                    label="Subject"
                    value={selectedCategory}
                    onChange={selectCategoryClick(setSelectedCategory)}
                >
                    <MenuItem key={"All"} value={"All"}>All</MenuItem>
                    {categories.filter((category) => category.category_name !== "Others").map((category) => (
                        <MenuItem key={category.category_id} value={category.category_name}>
                            {category.category_name}
                        </MenuItem>
                    ))};
                    <MenuItem key={"Others"} value={"Others"}>Others</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
}

function SearchBar({ setSearchValue }: { setSearchValue: React.Dispatch<React.SetStateAction<string[] | null>> }) {
    const HandleSearchSubmit = () => {
        const searchBarElement = document.getElementById("search-bar") as HTMLInputElement;
        if (searchBarElement) {
            const searchValue = searchBarElement.value;
            console.log("searchValue: ", searchValue);
            // filter to prevent inputs with multiple whitespace from affecting filter query later
            const slicedValues: string[] = searchValue.toLowerCase().split(" ").filter((value) => value !== "");
            if (slicedValues.length === 0) {
                setSearchValue(null);
            } else {
                setSearchValue(slicedValues);
            }
        } else {
            setSearchValue(null);
        }
    }
    return (
        <Box sx={{ marginTop: 2, }}>
            <FormControl fullWidth sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                <TextField
                    id="search-bar"
                    className="text"
                    label="Search"
                    variant="outlined"
                    placeholder="Search..."
                    size="small"
                    sx={{ width: '100%' }}
                    autoComplete="off"
                />
                <Tooltip title="Search" placement='top'>
                    <IconButton type="submit" aria-label="search" onClick={HandleSearchSubmit}>
                        <SearchIcon style={{ fill: "blue", fontSize: 35 }} />
                    </IconButton>
                </Tooltip>
            </FormControl>
        </Box>
    )
}

export default function Home() {
    const [threads, setThreads] = useState<GetThreadsCardsProps>([]);
    const [categories, setCategories] = useState<Categories>([]);
    const [getCategories, setGetCategories] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [fetchedData, setFetchedData] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string[] | null>(null);
    const [threadsLoaded, setThreadsLoaded] = useState<boolean>(false);
    const [categoriesLoaded, setCategoriesLoaded] = useState<boolean>(false);

    useEffect(() => {
        console.log("fetching threads and categories");
        const fetchThreads = async () => {
            try {
                const response = await api.get("/");
                if (Array.isArray(response.data)) {
                    setThreads(response.data);
                } else {
                    setThreads([]);
                }
                setFetchedData(true);
            } catch (error) {
                console.log(error);
                setThreads([]);
            } finally {
                setThreadsLoaded(true);
            }
        };

        const getCategories = async () => {
            const { success, errorStatus, output } = await GetCategories();
            if (success) {
                if (output == null) {
                    setCategories([]);
                } else {
                    setCategories(output as Categories);
                }
                setGetCategories(true);
                setCategoriesLoaded(true);
            }
            else {
                setGetCategories(false);
                console.log("unable to get categories, error status: ", errorStatus);
                setCategoriesLoaded(true);
            }
        }

        fetchThreads();
        getCategories();
    }, []);

    return (
        <>
            <Helmet>
                <title>Subject Forum</title>
            </Helmet>
            <Box sx={pageBoxStyle}>
                <Header></Header>
                {/* render everything below header together once backend calls done */}
                {threadsLoaded && categoriesLoaded && (<>
                    {getCategories
                        ? <CategoryFilter
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            categories={categories}
                        />
                        : <></>}
                    <SearchBar setSearchValue={setSearchValue}></SearchBar>
                    {fetchedData
                        ?
                        (threads.length === 0
                            ? <AllThreads threads={threads} />
                            : <AllThreads
                                threads={threads.filter((thread) => selectedCategory === "All" //filter by category
                                    ? true
                                    : thread.category_name === selectedCategory)
                                    .filter((thread) => {   // filter by searchValue
                                        if (searchValue === null) {
                                            return true;
                                        } else {
                                            const title: string = thread.thread_title.toLowerCase()
                                            const info: string = thread.thread_info.toLowerCase()
                                            console.log("searchValue: ", searchValue)
                                            return searchValue.some((item) => {
                                                //check if any word in searchValue exactly matches title/info
                                                const regex = new RegExp(`\\b${item.toLowerCase()}\\b`, 'i');
                                                return (regex.test(title) || regex.test(info));
                                            })
                                        }
                                    })}
                            />)
                        : <></>}
                </>)}
            </Box >
        </>
    );
}
