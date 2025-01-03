import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
    let navigate = useNavigate();
    useEffect(() => {
        localStorage.removeItem("jwtToken");
        console.log("logged out");
        navigate('/');
        window.location.reload();
    }, [])
    return (
        <></>
    );
}