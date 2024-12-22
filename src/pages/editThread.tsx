import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/header";
import IsAuthenticated from "../components/authenticate";
import { Thread, PostWithComments, Post, Comments } from "../types/types";
import { ValidateThreadInput, PostThread, GetPostWithComments } from "../contollers/controllers";
import { BoxStyle } from "../components/stylesheet";

import { Box, Button } from "@mui/material";
import TextField from '@mui/material/TextField';

// export default function EditThread() {
//     /////////////////////// CHANGE op_id ///////////////////////


//     const [prevUserEntry, setPrevUserEntry] = useState<Thread>({ op_id: 1, title: '', content: '' });
//     const [validEntry, setValidEntry] = useState<boolean>(true);
//     const [errorMessage, setErrorMessage] = useState<string>('');

//     let navigate = useNavigate();

//     let postId = useParams().num;
//     useEffect(() => {
//         if (postId) {
//             const getData = async () => {
//                 const receivePostWithComments: PostWithComments = await GetPostWithComments(postId as string);
//                 if (receivePostWithComments): <{post: Post; comments: Comments}>
//                 // if (receivePostWithComments) {
//                 //     setPrevUserEntry((prevUserEntry) => ({
//                 //         ...prevUserEntry,
//                 //         title: receivePostWithComments.post,
//                 //     }));
//                 // }

//             }
//             fetchData();
//         }
//     }, [postId]);
//     // async function HandlePostThread(event: FormEvent) {
//     //     event.preventDefault();

//     //     const { isValid, errorMessage } = validateThreadInput(userEntry);
//     //     if (!isValid) {
//     //         setErrorMessage(errorMessage);
//     //         setValidEntry(isValid);
//     //         console.log(errorMessage);
//     //         return;
//     //     }

//     //     const sendThread = await PostThread(userEntry);
//     //     if (sendThread) {
//     //         console.log('successfully registered');
//     //         setValidEntry(false);
//     //         navigate('/');
//     //         window.location.reload();
//     //     } else {
//     //         console.log("Failed to create thread");
//     //         navigate('*');
//     //         window.location.reload();
//     //     }
//     // }
//     // function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
//     //     const { id, value } = event.target;
//     //     setUserEntry(prevState => ({
//     //         ...prevState,
//     //         [id]: value,
//     //     }));
//     // }

//     return (
//         <>
//             <Box sx={BoxStyle}>
//                 <Header isAuthenticated={IsAuthenticated()}></Header>
//                 <form onSubmit={HandlePostThread}>
//                     <Box sx={{ marginTop: 1, marginBottom: 1, }}>
//                         <TextField fullWidth label="Title" id="title" value={userEntry.title} onChange={handleInputChange} multiline />
//                     </Box>
//                     <Box sx={{ marginTop: 1, marginBottom: 1, }}>
//                         <TextField fullWidth label="Content" id="content" value={userEntry.content} onChange={handleInputChange} multiline />
//                     </Box>
//                     <div style={{ textAlign: 'right' }}>{!validEntry && <p id="hiddenText" style={{ color: 'red' }}>{errorMessage}</p>}
//                         <Button variant='contained' type="submit">Submit</Button>
//                     </div>
//                 </form>
//             </Box>
//         </>
//     );
// }
