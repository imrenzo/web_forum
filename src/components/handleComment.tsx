import { AxiosError } from "axios";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreateJWTHeader } from "../apiService/apiService";
import api from "./api";
import NotFound from "../pages/notFound";

// routing into the different methods
export default function HandleComment() {
    const method = useParams().method;
    const commentID = useParams().id;

    if (method == "create") {
        if (commentID != undefined) {
            console.log("invalid url");
            return NotFound();
        }
        return (<></>);
    } else if (method == "update" && commentID) {
        return HandleUpdateComment(commentID as string);
    } else if (method == "delete" && commentID) {
        return HandleDeleteComment(commentID as string);
    } else {
        console.log("invalid method");
        return NotFound();
    }
}

export async function CreateComment(comment: string, threadId: string): Promise<{ success: Boolean, errorStatus: number | null }> {
    try {
        const jwtHeader = CreateJWTHeader();
        if (jwtHeader == null) {
            console.error();
            return { success: false, errorStatus: 401 };
        }
        console.log("Sending to backend post request")
        console.log(comment);

        const response = await api.post(`/comment/${threadId}`, comment, { headers: jwtHeader });
        console.log("successfully commented")
        return { success: true, errorStatus: null };
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response) {
                if (error.response.status == 401) {
                    localStorage.removeItem("username");
                    localStorage.removeItem("jwtToken");
                }
                return { success: false, errorStatus: error.response.status };
            } else {
                return { success: false, errorStatus: 500 };
            }
        }
        return { success: false, errorStatus: 404 };
    }
}

function HandleUpdateComment(commentID: string) {
    return (<></>)
}

function HandleDeleteComment(commentID: string) {
    let navigate = useNavigate();
    const [run, setRun] = useState(false);

    async function DeleteComment(commentID: string): Promise<{ success: Boolean, errorStatus: number | null, threadID: number | null }> {
        try {
            const jwtHeader = CreateJWTHeader();
            if (jwtHeader == null) {
                console.error();
                return { success: false, errorStatus: 401, threadID: null };
            }
            console.log("Sending to backend delete request");
            const response = await api.delete(`/comment/delete/${commentID}`, { headers: jwtHeader });
            console.log("response success")
            return { success: true, errorStatus: null, threadID: response.data as number };
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                if (error.response) {
                    console.log(error.response.data)
                    if (error.response.status == 403) {
                        localStorage.removeItem("username");
                        localStorage.removeItem("jwtToken");
                    }
                    return { success: false, errorStatus: error.response.status, threadID: null };
                } else {
                    console.log("no response: ", error.response)
                    return { success: false, errorStatus: 500, threadID: null };
                }
            }
            return { success: false, errorStatus: 404, threadID: null };
        }
    }


    async function HandleDeleteRequest(commentID: string) {
        const response = await DeleteComment(commentID);
        if (response.success) {
            console.log(`successfully deleted comment, id: ${commentID}`);
            navigate(`/thread_id/${response.threadID}`);
        } else {
            const status = response.errorStatus as number;
            navigate(`/error/${status}`);
        }
    }

    if (!run) {
        setRun(true);
        HandleDeleteRequest(commentID);
    }

    return (<></>);
}