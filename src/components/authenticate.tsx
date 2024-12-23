import { useEffect, useState } from "react";
import api from "./api";
export default function IsAuthenticated(): { isAuthenticated: boolean; isLoading: boolean } {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuthorised = async () => {
            const jwtToken = localStorage.getItem("jwtToken");
            if (jwtToken == null) {
                setIsAuthenticated(false);
                setIsLoading(false);
            } else {
                try {
                    const response = await api.get("/authenticate", {
                        headers: {
                            "Authorization": `Bearer ${jwtToken}`,
                            "Content-Type": "application/json"
                        }
                    })
                    setIsAuthenticated(true);
                } catch (error) {
                    localStorage.removeItem("jwtToken");
                    setIsAuthenticated(false);

                } finally {
                    setIsLoading(false);
                }
            }
        }
        checkAuthorised();
    }, [])
    console.log("isAuthenticated: ", isAuthenticated);
    return { isAuthenticated, isLoading };
}