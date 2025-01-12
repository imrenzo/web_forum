import * as React from 'react';
import { useParams, Link, useNavigate, Navigate } from "react-router";
import { Box } from "@mui/material";
import Header from "../components/header";
import { useEffect, useState } from "react";
import { GetThread, ThreadWithComments, Comments } from "../types/types";
import FormatDate from "../components/dateformat";
import { CheckIsOwner, GetThreadWithComments } from '../apiService/apiService';
import { PageBoxStyle } from "../components/stylesheet";

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CommentIcon from '@mui/icons-material/Comment';
import AddCommentIcon from '@mui/icons-material/AddComment';
import Toolbar from '@mui/material/Toolbar';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';

function DropDown({ threadId }: { threadId: number }) {
    // const username = localStorage.getItem("username");
    const [isOwner, setIsOwner] = useState(false);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const OpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const CloseUserMenu = () => { setAnchorElUser(null); };

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
                    <Tooltip title="Open settings">
                        <IconButton onClick={OpenUserMenu} sx={{ p: 0 }}>
                            <MoreVertIcon></MoreVertIcon>
                        </IconButton>
                    </Tooltip>
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
                        <Link to={`/thread/delete/${threadId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <MenuItem>
                                <Typography sx={{ textAlign: 'center', }}>Delete Thread</Typography>
                            </MenuItem>
                        </Link>
                    </Menu>
                </Box>
            </Toolbar>
        </Container>
        : <></>);
}

function ThreadCard({ thread }: { thread: GetThread }) {
    return (
        <>
            <title>{thread.thread_id}</title>
            <Card sx={{ width: '100%' }}>
                <CardHeader
                    avatar={
                        <Avatar sx={{ bgcolor: red[500] }} >
                            {thread == null ? <></> : <p>{thread.username}</p>}
                        </Avatar>
                    }
                    action={<DropDown threadId={thread.thread_id}></DropDown>}
                    title={thread == null ? '' : thread.username}
                    subheader={thread == null ? '' : FormatDate(thread.thread_date as string)}
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
                        <IconButton aria-label="view comment icon">
                            <CommentIcon />
                        </IconButton>
                        <Link to='/signup'>
                            <IconButton aria-label="add comment icon">
                                <AddCommentIcon />
                            </IconButton>
                        </Link>
                        <IconButton aria-label="add to favorites">
                            <>3&nbsp;</><FavoriteIcon />
                        </IconButton>
                        <IconButton aria-label="share">
                            <ShareIcon />
                        </IconButton>
                    </Box>
                </CardActions>
            </Card>
        </>
    )
}

function CommentsCard({ comments }: { comments: Comments }) {
    return (
        <Card sx={{ width: '100%', marginTop: 2 }}>
            {comments.map((comment) => (
                <Card key={comment.comment_id} style={{ border: "none", boxShadow: "none" }}>
                    <CardHeader
                        avatar={
                            <Avatar sx={{ bgcolor: red[500] }} >
                                {comment.username}
                            </Avatar>
                        }
                        action={
                            <IconButton aria-label="settings">
                                <MoreVertIcon />
                            </IconButton>
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
    let threadId = useParams().id;
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