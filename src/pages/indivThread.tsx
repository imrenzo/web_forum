import * as React from 'react';
import { useParams, Link, useNavigate, Navigate } from "react-router";
import Header from "../components/header";
import { FormEvent, useEffect, useState } from "react";
import { CreateComment } from '../components/handleComment';
import { ValidateCommentInput } from '../apiService/apiService';
import FormatDate from "../components/dateformat";
import { CheckIsOwner, GetThreadWithComments } from '../apiService/apiService';
import { GetThread, ThreadWithComments, Comments } from "../types/types";
import { PageBoxStyle } from "../components/stylesheet";

import {
    Card, CardContent, CardHeader, CardActions, Avatar, IconButton, Typography,
    Toolbar, Menu, Container, Tooltip, MenuItem, TextField, Box, Button
} from '@mui/material';
import { red } from '@mui/material/colors';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddCommentIcon from '@mui/icons-material/AddComment';

function ThreadDropDownButton({ threadId }: { threadId: number }) {
    let navigate = useNavigate();
    const [isOwner, setIsOwner] = useState(false);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const OpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const CloseUserMenu = () => { setAnchorElUser(null); };

    function handleDeleteThread() {
        const confirmed = window.confirm("Are you sure you want to delete this thread?");
        if (confirmed) {
            navigate(`/thread/delete/${threadId}`);
            console.log("here");
        }
        CloseUserMenu();
    };

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
    }, []);

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
                        <Link to={`/thread/update/${threadId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <MenuItem onClick={CloseUserMenu}>
                                <Typography sx={{ textAlign: 'center' }}>Edit Thread</Typography>
                            </MenuItem>
                        </Link>
                        <MenuItem onClick={handleDeleteThread}>
                            <Typography sx={{ textAlign: 'center', }}>Delete Thread</Typography>
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </Container>
        : <></>);
}

function CommentDropDownButton({ commentID }: { commentID: number }) {
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const OpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const CloseUserMenu = () => { setAnchorElUser(null); };

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
                        {/* <Link to={`/comment/update/${commentID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <MenuItem onClick={CloseUserMenu}>
                                <Typography sx={{ textAlign: 'center' }}>Edit Comment</Typography>
                            </MenuItem>
                        </Link> */}
                        <Link to={`/comment/delete/${commentID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <MenuItem>
                                <Typography sx={{ textAlign: 'center', }}>Delete Comment</Typography>
                            </MenuItem>
                        </Link>
                    </Menu>
                </Box>
            </Toolbar>
        </Container>
    )
}

function ThreadCard({ thread }: { thread: GetThread }) {
    const [addCommentBox, setAddCommentBox] = useState(false);
    const [comment, setComment] = useState("");
    const [errorMessage, setErrorMessage] = useState<string>('');
    const navigate = useNavigate();
    const threadId = useParams().id;

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { id, value } = event.target;
        setComment(value);
    }

    async function HandleAddComment(event: FormEvent) {
        event.preventDefault();
        const { isValid, errorMessage } = ValidateCommentInput(comment);
        console.log("valid: ", isValid);
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
                    <Typography variant="h5" sx={{ color: 'text.primary', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '700' }}>
                        {thread == null ? <></> : <>{thread.thread_title}</>}
                    </Typography>
                    <Typography>&nbsp;</Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {thread == null ? <></> : <>{thread.thread_info}</>}
                    </Typography>
                </CardContent>
                <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'space-between', }}>
                    <Typography variant='subtitle1'>
                        {FormatDate(thread.thread_date as string)}
                    </Typography>
                    <Box>
                        <Tooltip title="Add Comment">
                            <IconButton aria-label="add comment button" onClick={() => setAddCommentBox(!addCommentBox)}>
                                <AddCommentIcon sx={{ fontSize: 40 }} />
                            </IconButton>
                        </Tooltip>
                        {/* <IconButton aria-label="like button">
                            <>3&nbsp;</><FavoriteIcon />
                        </IconButton> */}
                    </Box>
                </CardActions>
            </Card >
            <Card sx={addCommentBox ? { marginTop: 1, display: 'block' } : { marginTop: 1, display: 'none' }}>
                <form onSubmit={HandleAddComment}>
                    <Box sx={{ marginTop: 1 }}>
                        <TextField fullWidth label="Add Comment" id="comment" value={comment} onChange={handleInputChange} multiline />
                    </Box>
                    <div style={{ textAlign: 'right' }}>
                        <p id="hiddenText" style={{ color: 'red' }}>{errorMessage}</p>
                        <Button variant='contained' type="submit">Post Comment</Button>
                    </div>
                </form>
            </Card>
        </>
    )
}

function CommentsCard({ comments }: { comments: Comments }) {
    const username = localStorage.getItem("username");

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
                            comment.username == username ? <CommentDropDownButton commentID={comment.comment_id} /> : <></>
                        }
                        title={comment.username}
                        subheader={FormatDate(comment.comment_date)}
                    />
                    <CardContent sx={{ overflow: 'hidden', }}>
                        <Typography variant="body1" sx={{ color: 'text.primary', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {comment.comment_info}
                        </Typography>
                        <Typography>
                            {comment.commenter_id}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Card>
    );
}

export default function LoadIndivThread() {
    // get individual thread and comments
    const [data, setData] = useState<ThreadWithComments>({ thread: null, comments: null });
    const threadId = useParams().id;
    let navigate = useNavigate();

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
    }, [threadId]);


    return (
        <>
            <Box sx={PageBoxStyle}>
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