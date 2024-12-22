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


export async function GetPostWithComments(postId: string): Promise<PostWithComments> {
    try {
        const response = await api.get(`/post_id/${postId}`);
        return response.data;
    } catch (error) {
        console.log(error);
        return { post: [], comments: [] };
    }
}

export async function PostThread(userEntry: Thread): Promise<Thread> {
    try {
        const response = await api.post("/createThread", userEntry);
        return response.data;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to create thread.");
    }
}