import * as React from 'react';
import { useParams, Link, useNavigate } from "react-router";
import { Box } from "@mui/material";
import { BoxStyle } from "../components/stylesheet";
import Header from "../components/header";
import { useEffect, useState } from "react";
import { Post, Comments } from "../types/types";
import FormatDate from "../components/dateformat";
import IsAuthenticated from "../components/authenticate";
import { GetPostWithComments } from '../contollers/controllers';
import { PostWithComments } from '../types/types';

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


function DropDown({ postId }: { postId: number }) {
    const vertIconDropdown: { [key: string]: string }[] = [{ 'Edit': '/post_id/' }, { 'test': '/' }];
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const OpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const CloseUserMenu = () => { setAnchorElUser(null); };

    return (<>
        <Container maxWidth="xs">
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
                        <Link to={`/post_id/edit/${postId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <MenuItem onClick={CloseUserMenu}>
                                <Typography sx={{ textAlign: 'center' }}>Edit Thread</Typography>
                            </MenuItem>
                        </Link>
                        <Link to='/' style={{ textDecoration: 'none', color: 'inherit' }}>
                            <MenuItem>
                                <Typography sx={{ textAlign: 'center', }}>Share</Typography>
                            </MenuItem>
                        </Link>
                    </Menu>
                </Box>
            </Toolbar>
        </Container>
    </>
    );
}

function PostCard({ post }: { post: Post }) {
    return (
        <Card sx={{ width: '100%' }}>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: red[500] }} >
                        {post == null ? <></> : <p>{post.username}</p>}
                    </Avatar>
                }
                action={<DropDown postId={post.post_id}></DropDown>}
                title={post == null ? '' : post.username}
                subheader={post == null ? '' : FormatDate(post.post_date as string)}
            />
            <CardContent sx={{ overflow: 'hidden', }}>
                <Typography variant="h5" sx={{ color: 'text.primary', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '700' }}>
                    {post == null ? <></> : <>{post.post_title}</>}
                </Typography>
                <Typography>&nbsp;</Typography>
                <Typography variant="body1" sx={{ color: 'text.primary', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {post == null ? <></> : <>{post.post_info}</>}
                </Typography>
            </CardContent>
            <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'space-between', }}>
                <Typography variant='subtitle1'>
                    {FormatDate(post.post_date as string)}
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
    )
}

function CommentsCard({ comments }: { comments: Comments }) {
    return (
        <Card sx={{ width: '100%', marginTop: 2 }}>
            {comments.map((comment) => (
                <Card style={{ border: "none", boxShadow: "none" }}>
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
                    </CardContent>
                </Card>
            ))}
        </Card>
    );
}

export default function Page() {
    // get post and comments
    const [data, setData] = useState<PostWithComments>({ post: null, comments: null });
    let postId = useParams().num;
    let navigate = useNavigate();
    useEffect(() => {
        if (postId) {
            // const fetchData = async () => {
            //     const fetchedData: PostWithComments = await GetPostWithComments(postId as string);
            //     setData(fetchedData);
            // }
            // fetchData();
            const fetchData = async () => {
                const { isValid, errorMessage, output } = await GetPostWithComments(postId as string);
                if (!isValid) {
                    console.log(errorMessage);
                    navigate('*');
                    window.location.reload();
                    return;
                }
                setData(output as PostWithComments);
            };
            fetchData();
        }
    }, [postId]);


    return (
        <>
            <Box sx={BoxStyle}>
                <Header isAuthenticated={IsAuthenticated()}></Header>
                <Card variant="outlined" sx={{ width: '100%' }}>
                    {data.post != null
                        ? <PostCard post={data.post as Post}></PostCard>
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