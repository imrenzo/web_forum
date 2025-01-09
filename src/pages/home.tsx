import * as React from 'react';
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { GetThreadsCardsProps } from '../types/types';
import Header from "../components/header";
import FormatDate from "../components/dateformat";
import { PageBoxStyle } from "../components/stylesheet";
import axios from "axios";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CommentIcon from '@mui/icons-material/Comment';
import AddCommentIcon from '@mui/icons-material/AddComment';

function AllThreads({ threads }: GetThreadsCardsProps) {
    return (
        <>
            {threads === null
                ? <Box>
                    <br></br>
                    <Typography variant='body1'>No threads yet. Create the first Thread!</Typography >
                </Box>
                : <Box>
                    {threads.map((item) =>
                        <Link key={item.thread_id} to={`/thread_id/${item.thread_id}`} style={{ textDecoration: 'none' }}>
                            <Card variant="outlined" sx={{ width: '100%', marginTop: 2 }}>
                                <React.Fragment>
                                    <CardContent>
                                        <Typography variant="h5" component="div">
                                            {item.thread_title}
                                        </Typography>
                                        <br></br>
                                        <Typography variant='body1' sx={{}}>
                                            {item.thread_info}
                                        </Typography>
                                    </CardContent>
                                </React.Fragment>
                                <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'space-between', }}>
                                    <Typography variant='subtitle1'>
                                        {FormatDate(item.thread_date)}
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
    const [threads, setThreads] = useState<any[]>([]);

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const response = await axios.get("http://localhost:8080/");
                setThreads(response.data);
            } catch (error) {
                console.log(error);
                setThreads([]);
            }
        };
        fetchThreads();
    }, []);

    return (
        <>
            <title>Web Forum</title>
            <Box sx={PageBoxStyle}>
                <Header></Header>
                <AllThreads threads={threads}></AllThreads>
            </Box>
        </>
    );
}
