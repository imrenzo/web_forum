import { AxiosError } from "axios";
import { NavigateFunction } from "react-router-dom";
import { CreateJWTHeader } from "../services/apiService";
import api from "./api";

// routing into the different methods [update comment handled in indivThread.tsx]
export default async function CreateComment(comment: string, threadID: string): Promise<{ success: Boolean, errorStatus: number | null }> {
    try {
        const jwtHeader = CreateJWTHeader();
        if (jwtHeader == null) {
            console.error();
            return { success: false, errorStatus: 401 };
        }
        console.log("Sending to backend post comment request")
        await api.post(`/comment/${threadID}`, comment, { headers: jwtHeader });
        console.log("successfully commented")
        return { success: true, errorStatus: null };
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response) {
                if (error.response.status === 401) {
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

export async function HandleDeleteComment(commentID: string, navigate: NavigateFunction) {
    try {
        const jwtHeader = CreateJWTHeader();
        if (jwtHeader == null) {
            console.error();
            return { success: false, errorStatus: 401, threadID: null };
        }
        console.log("Sending to backend delete comment request");
        await api.delete(`/comment/${commentID}`, { headers: jwtHeader });
        console.log(`successfully deleted comment, id: ${commentID}`);
        window.location.reload();
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response) {
                console.log(error.response.data)
                if (error.response.status === 403) {
                    localStorage.removeItem("username");
                    localStorage.removeItem("jwtToken");
                    navigate("/error/403");
                }
                navigate(`/error/${error.response.status}`);
            } else {
                console.log("no response: ", error.response)
                navigate("/error/500");
            }
        }
        navigate("/error/404");
    }
}