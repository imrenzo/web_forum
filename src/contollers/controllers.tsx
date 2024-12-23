import axios, { AxiosError } from "axios";
import { PostWithComments, Thread } from "../types/types";
import api from "../components/api";

export async function GetAllPostsOnly() {
    try {
        const response = await axios.get("http://localhost:8080/");
        return response.data;
    } catch (error) {
        console.log(error);
        return [];
    }
};

export async function GetPostWithComments(postId: string): Promise<{ isValid: boolean; errorMessage: string; output: PostWithComments | null }> {
    try {
        const response = await api.get(`/post_id/${postId}`);
        return { isValid: true, errorMessage: '', output: response.data };
    } catch (error) {
        console.log(error);
        return { isValid: false, errorMessage: "Thread does not exist", output: null };
    }
}

export function ValidateThreadInput(userEntry: Thread): { isValid: boolean; errorMessage: string } {
    if (userEntry.title == '' || userEntry.content == '') {
        return { isValid: false, errorMessage: "Both title and content needs to be filled in" };
    }
    return { isValid: true, errorMessage: '' };

}

export async function PostThread(userEntry: Thread): Promise<{ success: Boolean, errorStatus: number | null }> {
    try {
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
            console.error();
            return { success: false, errorStatus: 401 };
        }
        const response = await api.post("/createThread", userEntry, {
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json"
            }
        });
        return { success: true, errorStatus: null };
    } catch (error: unknown) {
        // console.log(error);
        // return false;
        if (error instanceof AxiosError) {
            if (error.response) {
                // let errorStatus = error.response.status;
                // let errorText = error.response.data;
                // console.log("error.response: ", error.response);
                // console.log("error.response.status: ", error.response.status);
                // console.error("Your session has expired. Please log in again.");
                localStorage.removeItem("jwtToken");
                return { success: false, errorStatus: error.response.status };
            } else {
                return { success: false, errorStatus: 500 };
            }
        }
        return { success: false, errorStatus: 404 };
    }
}

export function ValidateJWT(token: any) {
    // try {
    //     const response = api.get("/validate", token);
    //     return true;
    // } catch (error) {
    //     console.log("Invalid JWT");
    //     return false;
    // }

}