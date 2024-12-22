import axios from "axios";
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

export async function PostThread(userEntry: Thread): Promise<Boolean> {
    try {
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
            console.error("No authentication token found");
            return false;
        }
        console.log("debug here");
        const response = await api.post("/createThread", userEntry, {
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json"
            }
        });
        return true;
    } catch (error) {
        console.log(error);
        return false;
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