import { ThreadWithComments, Thread, Categories } from "../types/types";
import { AxiosError } from "axios";
import { ThreadWithComments, Thread, Categories } from "../types/types";
import { AxiosError } from "axios";
import api from "../components/api";

export function ValidateThreadInput(userEntry: Thread): { isValid: boolean; errorMessage: string } {
    if (userEntry.title == '' || userEntry.content == '') {
        return { isValid: false, errorMessage: "Both title and content needs to be filled in" };
    }
    return { isValid: true, errorMessage: '' };

};

export function ValidateCommentInput(comment: string): { isValid: boolean; errorMessage: string } {
    if (comment == '') {
        return { isValid: false, errorMessage: "Please fill in the comment before submitting" };
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

export async function CheckIsOwner(threadId: number): Promise<{ success: Boolean, errorStatus: number | null }> {
    try {
        const jwtHeader = CreateJWTHeader();
        if (jwtHeader == null) {
            console.error();
            return { success: false, errorStatus: 401 }
        };
        console.log("sending check thread owner");
        const response = await api.post("/checkthreadowner", threadId, { headers: jwtHeader });
        console.log("success");
        return { success: true, errorStatus: null };
    } catch (error: unknown) {
        // anything else is unauthorised so should not show dropdown options to update/ delete thread
        return { success: false, errorStatus: 401 };
    }
}

export async function GetThreadWithComments(threadId: string): Promise<{ isValid: boolean; errorMessage: string; output: ThreadWithComments | null }> {
    try {
        const response = await api.get(`/thread/read/${threadId}`);
        return { isValid: true, errorMessage: '', output: response.data };
    } catch (error) {
        console.log(error);
        return { isValid: false, errorMessage: "Thread does not exist", output: null };
    }
};

export async function GetCategories(): Promise<{ success: boolean, errorStatus: number | null, output: Categories | null }> {
    try {
        const response = await api.get("/categories/get");
        return { success: true, errorStatus: null, output: response.data as Categories };
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response) {
                if (error.response.status == 401) {
                    return { success: false, errorStatus: 401, output: null };
                }
                const errorStatus = error.response.status as number;
                return { success: false, errorStatus: errorStatus, output: null };
            } else {
                return { success: false, errorStatus: 500, output: null };
            }
        }
        return { success: false, errorStatus: 404, output: null };
    }
}