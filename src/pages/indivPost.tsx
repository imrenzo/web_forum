import { useParams } from "react-router";
import { Box } from "@mui/material";
import { BoxStyle } from "../components/stylesheet";
import Header from "../components/header";
// authenticate jwt if verified, load stuff, else go to login pg


function Post() {
    let id = useParams().num;
    return (
        <>
            <Box sx={BoxStyle}>
                <Header isAuthenticated={true}></Header>
                <p>{id}</p>
            </Box>
        </>
    );
}

export default Post;