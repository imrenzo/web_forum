import axios from "axios";
import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import OutlinedCard from "../components/card";
import Header from "../components/header";
import { BoxStyle } from "../components/stylesheet";

function Home() {
    let [data, setData] = useState<any[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (token == null) {
            setIsAuthenticated(false);
        } else {
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        axios
            .get("http://localhost:8080/")
            .then(function (response) {
                setData(response.data)
            })
            .catch(function (error) {
                console.error('Error fetching data:', error);  // Error handling
            });
    }, []);

    return (
        <>
            <title>Web Forum</title>
                <Box sx={BoxStyle}>
                    <Header isAuthenticated={isAuthenticated}></Header>
                    <OutlinedCard posts={data}></OutlinedCard>
                </Box>
        </>
    );
}

export default Home;