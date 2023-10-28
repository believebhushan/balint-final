import React,{useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";

const Logout = () => {

    const navigate = useNavigate();
    useEffect(() => {
       /**If No loggedin user found then refirect to login page */
        const getOperator = localStorage.getItem("getOperator");
        const getOperatorDetail = getOperator ? JSON.parse(getOperator) : null;
        if(getOperatorDetail == null || getOperatorDetail == 'undefined'){
            navigate("/login");
        }else{
            window.localStorage.clear();
            navigate("/login");
        }

    }, []);

};

export default Logout;