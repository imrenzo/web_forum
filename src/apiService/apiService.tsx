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
};

export function ValidateThreadInput(userEntry: Thread): { isValid: boolean; errorMessage: string } {
    if (userEntry.title == '' || userEntry.content == '') {
        return { isValid: false, errorMessage: "Both title and content needs to be filled in" };
    }
    return { isValid: true, errorMessage: '' };

};

export function CreateJWTHeader(): { "Authorization": string; "Content-Type": string } | null {
    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) {
        return null;
    }
    return {
        "Authorization": `Bearer ${jwtToken}`,
        "Content-Type": "application/json"
    }
}


export async function PostThread(userEntry: Thread): Promise<{ success: Boolean, errorStatus: number | null }> {
    try {
        const jwtHeader = CreateJWTHeader();
        if (jwtHeader == null) {
            console.error();
            return { success: false, errorStatus: 401 };
        }
        console.log("Sending to backend post request")
        // error with response
        console.log(userEntry);
        const response = await api.post("/createThread", userEntry, { headers: jwtHeader });
        console.log("successfully posted")
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
};

export async function DeleteThread(postID: string): Promise<{ success: Boolean, errorStatus: number | null }> {
    try {
        const jwtHeader = CreateJWTHeader();
        if (jwtHeader == null) {
            console.error();
            return { success: false, errorStatus: 401 };
        }
        console.log("Sending to backend delete request");
        const response = await api.delete(`/delete_thread/${postID}`, { headers: jwtHeader });
        if (response.status != 204) {
            return { success: false, errorStatus: 400 };
        }
        return { success: true, errorStatus: null };
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response) {
                if (error.response.status == 403) {
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

export async function CheckIsOwner(postId: number): Promise<{ success: Boolean, errorStatus: number | null }> {
    try {
        const jwtHeader = CreateJWTHeader();
        if (jwtHeader == null) {
            console.error();
            return { success: false, errorStatus: 401 }
        };
        console.log("sending response");
        const response = await api.post("/checkpostowner", postId, { headers: jwtHeader });
        console.log("success");
        return { success: true, errorStatus: null };
    } catch (error: unknown) {
        // anything else is unauthorised so should not show dropdown options to update/ delete post
        return { success: false, errorStatus: 401 };
    }
}