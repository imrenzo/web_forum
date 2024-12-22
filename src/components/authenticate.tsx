import { useEffect, useState } from "react";

export default function IsAuthenticated(): Boolean {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (token == null) {
            setIsAuthenticated(false);
        } else {
            setIsAuthenticated(true);
        }
    }, []);
    return (isAuthenticated);
}