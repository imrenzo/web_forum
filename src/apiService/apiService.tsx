import axios, { AxiosError } from "axios";
import { GetThreadWithComments, Thread } from "../types/types";
import api from "../components/api";

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

export async function CheckIsOwner(threadId: number): Promise<{ success: Boolean, errorStatus: number | null }> {
    try {
        const jwtHeader = CreateJWTHeader();
        if (jwtHeader == null) {
            console.error();
            return { success: false, errorStatus: 401 }
        };
        console.log("sending response");
        const response = await api.post("/checkthreadowner", threadId, { headers: jwtHeader });
        console.log("success");
        return { success: true, errorStatus: null };
    } catch (error: unknown) {
        // anything else is unauthorised so should not show dropdown options to update/ delete thread
        return { success: false, errorStatus: 401 };
    }
}