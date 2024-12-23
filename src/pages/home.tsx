import * as React from 'react';
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { GetAllPostsOnly } from '../contollers/controllers';
import { PostsCardsProps } from '../types/types';
import Header from "../components/header";
import FormatDate from "../components/dateformat";
import { PageBoxStyle } from "../components/stylesheet";

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CommentIcon from '@mui/icons-material/Comment';
import AddCommentIcon from '@mui/icons-material/AddComment';

function AllPosts({ posts }: PostsCardsProps) {
    return (
        <>
            {posts === null
                ? <Box>
                    <br></br>
                    <Typography variant='body1'>No posts yet. Create the first Thread!</Typography >
                </Box>
                : <Box>
                    {posts.map((item) =>
                        <Link key={item.post_id} to={`/post_id/${item.post_id}`} style={{ textDecoration: 'none' }}>
                            <Card variant="outlined" sx={{ width: '100%', marginTop: 2 }}>
                                <React.Fragment>
                                    <CardContent>
                                        <Typography variant="h5" component="div">
                                            {item.post_title}
                                        </Typography>
                                        <br></br>
                                        <Typography variant='body1' sx={{}}>
                                            {item.post_info}
                                        </Typography>
                                    </CardContent>
                                </React.Fragment>
                                <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'space-between', }}>
                                    <Typography variant='subtitle1'>
                                        {FormatDate(item.post_date)}
                                    </Typography>
                                    <Box>
                                        <IconButton aria-label="view comment icon">
                                            <CommentIcon />
                                        </IconButton>
                                        {/* <Link to='/signup'> */}
                                        <IconButton aria-label="add comment icon">
                                            <AddCommentIcon />
                                        </IconButton>
                                        {/* </Link> */}
                                    </Box>
                                </CardActions>
                            </Card>
                        </Link>

                    )}
                </Box>
            }
        </>
    );
}

export default function Home() {
    const [posts, setPosts] = useState<any[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const fetchedPosts = await GetAllPostsOnly();
            setPosts(fetchedPosts);
        };

        fetchPosts();
    }, []);

    return (
        <>
            <title>Web Forum</title>
            <Box sx={PageBoxStyle}>
                <Header></Header>
                <AllPosts posts={posts}></AllPosts>
            </Box>
        </>
    );
}
