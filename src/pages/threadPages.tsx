import * as React from 'react';
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import { GetThreadsCardsProps } from '../types/types';
import Header from "../components/header";
import FormatDate from "../components/dateformat";
import { CreateJWTHeader } from '../apiService/apiService';
import api from '../components/api';
import { PageBoxStyle } from "../components/stylesheet";

import CommentIcon from '@mui/icons-material/Comment';
import AddCommentIcon from '@mui/icons-material/AddComment';
import { Tooltip, CardActions, CardContent, Typography, IconButton, Box, Card } from '@mui/material';

function AllThreads({ threads }: GetThreadsCardsProps) {
    return (
        <>
            {threads === null
                ? <Box>
                    <br></br>
                    <Typography variant='body1'>No threads yet. Create your first Thread!</Typography >
                </Box>
                : <Box>
                    {threads.map((item) =>
                        // <Link key={item.thread_id} to={`/thread_id/${item.thread_id}`} style={{ textDecoration: 'none' }}>
                        <Card key={item.thread_id} variant="outlined" sx={{ width: '100%', marginTop: 2 }}>
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
                                    <Link to={`/thread_id/${item.thread_id}`}>
                                        <Tooltip title="View Comment">
                                            <IconButton aria-label="view comment icon">
                                                <CommentIcon sx={{ fontSize: 40 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Link>
                                </Box>
                            </CardActions>
                        </Card>
                        // </Link>

                    )}
                </Box>
            }
        </>
    );
}

export function MyThreads() {
    const [threads, setThreads] = useState<any[]>([]);

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
                <Box sx={{ marginTop: 2, }}>
                    <Typography sx={{ display: 'inline' }}>Category: </Typography>
                    <select id="moduleFilterSelect">
                        <option value={20}>Twenty</option>
                        <option value={21}>Twenty one</option>
                        <option value={22}>Twenty one and a half</option>
                    </select>
                </Box>
                <AllThreads threads={threads}></AllThreads>
            </Box>
        </>
    );
}
