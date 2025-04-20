import React, { useEffect } from "react";
import "./logout.css";

function Logout() {
    useEffect(()=> {
        localStorage.removeItem("token");
        window.location = "/"
    },[])
    return (
        <>
        </>
    );
}

export default Logout;
