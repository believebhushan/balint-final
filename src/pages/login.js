import React,{useState, useEffect} from 'react';
import OperatorDataService from '../services/operator.services.js';
import { useNavigate } from "react-router-dom";

/** Handle login process */
const Loginform = () => {
    const navigate = useNavigate();
    useEffect(() => {
        /** If Already login then redirect to dashboard */
        try {
            const getOperator = localStorage.getItem("getOperator");
            const getOperatorDetail = getOperator ? JSON.parse(getOperator) : null;
            if(getOperatorDetail !== null ){
                navigate("/dashboard");
            }
        }
           catch (e) {
           console.log(e); 
        }
    }, []);


    const [remotecode, setRemotecode] = useState("");
    const [message , setMessage] = useState({error: false , msg : ""});

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        if(remotecode === ""){
            setMessage({error: true , msg : "Location Code is Manadatory"});
            return;
        }
        try{
            const this_result =  await OperatorDataService.loginOperatorByCode(remotecode);
            if(this_result.length>0){
                setMessage({error: false , msg : "Login Successfully!"});
                const getOperator = this_result[0];
                const myJSON = JSON.stringify(getOperator);
                window.localStorage.clear();
                window.localStorage.setItem("getOperator", myJSON);
                setTimeout(() => {
                    navigate("/dashboard");
                }, 1000);
            }else{
                setMessage({error: true , msg : "Location not found"});
            }
        }catch (err){
            setMessage({error: true , msg : err.message });
        };
    };

    return (
        <>

        <section className="vh-100" style={{ backgroundColor : "#508bfc"}}>
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                        <div className="card shadow-2-strong" style={{borderRadius: "1rem"}}>

                        { message?.msg && ( <div className={message?.error ? "alert alert-danger alert-dismissible fade show" : "alert alert-success alert-dismissible fade show"} role="alert">{ message?.msg} <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick ={()=> setMessage("")}><span aria-hidden="true">&times;</span></button></div> )}

                            <div className="card-body p-5 text-center">
                                <h3 className="mb-5">Welcome, Operator! </h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-outline mb-4">
                                        <label className="form-label" >Location Code</label>
                                        <input type="text" id="typeRemotecodeX-2" className="form-control form-control-lg" value={remotecode} onChange={(e) => setRemotecode(e.target.value)} /> 
                                    </div>
                                    <button className="btn btn-primary btn-lg btn-block" type="submit">Login</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        </>
    );  
}

export default Loginform;
