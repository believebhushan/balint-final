import React,{useState, useEffect} from 'react';
import JobDataService from '../services/jobs.services.js';
import { useNavigate, Link } from "react-router-dom";
import Navbar from '../component/navbar.js';

/** Handle login process */
const AddPrinter = () => {
    const navigate = useNavigate();
   
    const getOperator = localStorage.getItem("getOperator");
    const getOperatorDetail = getOperator ? JSON.parse(getOperator) : null;

    useEffect(() => {
         /**If No loggedin user found then refirect to login page */
         if(getOperatorDetail == null || getOperatorDetail == 'undefined'){
             navigate("/login");
         }
    }, [getOperatorDetail]);


    const [shape, setShape] = useState("");
    const [capsule, setCapsule] = useState("");
    const [jobstatus , setJobstatus] = useState("");
    const [email  ,   setEmail] = useState("");
    const [notified  , setNotified] = useState("");

    const [message , setMessage] = useState({error: false , msg : ""});

    const handleSubmit = async (event) => {

        event.preventDefault();
        setMessage("");

        if(getOperatorDetail.remoteAccessCode === ""){
            setMessage({error: true , msg : "Location Code is Manadatory"});
            return;
        }

        const trimshape = shape.trim();
        if(shape === "" || trimshape === "" || shape == 'undefined' || trimshape == 'undefined'){
            setMessage({error: true , msg : "Shape is Manadatory"});
            return;
        }

        const trimcapsule = capsule.trim();
        if(capsule === "" || trimcapsule === "" || capsule == 'undefined' || trimcapsule == 'undefined'){
            setMessage({error: true , msg : "Capsule is Manadatory"});
            return;
        }

        const trimjobstatus = jobstatus.trim();
        if(jobstatus === "" || trimjobstatus === "" || jobstatus == 'undefined' || trimjobstatus == 'undefined'){
            setMessage({error: true , msg : "Status is Manadatory"});
            return;
        }


        const trimemail = email.trim();
        if(email === "" || trimemail === "" || email == 'undefined' || trimemail == 'undefined'){
            setMessage({error: true , msg : "Email is Manadatory"});
            return;
        }

        //const trimnotified = notified.trim();
        // if(notified === "" || trimnotified === "" || notified == 'undefined' || trimnotified == 'undefined'){
        //     setMessage({error: true , msg : "Printer Name is Manadatory"});
        //     return;
        // }

        try{

            const requestAdd = {
                remoteAccessCode : getOperatorDetail.remoteAccessCode,
                print_from       : Date.now(),
                jobstatus        : trimjobstatus,
                shape            : trimshape,
                capsule          : trimcapsule,
                last_updated     : Date.now(),
                email            : trimemail,
                notified         : notified && notified != 'undefined' ? 1 : '',
                created_at       : Date.now(),
                status           : 1,
            }

            const this_result =  await JobDataService.addJob(requestAdd);
            if(this_result){
                setMessage({error: false , msg : "Request add Successfully!"});
                setTimeout(() => {
                    navigate("/print-jobs");
                }, 1000);
            }else{
                setMessage({error: true , msg : "Oops! SOme error occured"});
            }

        }catch (err){
            setMessage({error: true , msg : err.message });
        };
    };

    return (
        <>
            <div className="container-fluid vh-100" style={{ backgroundColor : "#FFF"}}>
                <Navbar />
                <div className="row mt-4" >
                    <div className="col-md-6"><h6 className="display-6 mt-6"><strong>Add Request :</strong></h6></div>
                    <div className="col-md-6 text-end"><Link to='/print-jobs' className="btn btn-sm btn-primary">Back</Link></div>
                </div>
                { message?.msg && ( <div className={message?.error ? "alert alert-danger alert-dismissible fade show" : "alert alert-success alert-dismissible fade show"} role="alert">{ message?.msg} <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick ={()=> setMessage("")}><span aria-hidden="true">&times;</span></button></div> )}
                <form onSubmit={handleSubmit} className="container w-60">

                    <div className="form-outline mb-4">
                        <label className="form-label" >Shape</label>
                        <select className="form-select" aria-label="Default select example" value={shape} onChange={(e) => setShape(e.target.value)}>
                            <option value="">-- select shape --</option>
                            <option value="Honeycomb">Honeycomb</option>
                            <option value="Flower of Life">Flower of Life</option>
                            <option value="Fibonacci">Fibonacci</option>
                            <option value="Salamandra">Salamandra</option>
                            <option value="Shrimp">Shrimp</option>
                        </select>
                    </div>

                    <div className="form-outline mb-4">
                        <label className="form-label" >Capsule</label>
                        <select className="form-select" aria-label="Default select example" value={capsule} onChange={(e) => setCapsule(e.target.value)}>
                            <option value="">-- select capsule --</option>
                            <option value="Mango">Mango</option>
                            <option value="Coconut">Coconut</option>
                            <option value="Cherry">Cherry</option>
                            <option value="Tangerine">Tangerine</option>
                            <option value="Maracuja">Maracuja</option>
                        </select>
                    </div>

                    <div className="form-outline mb-4">
                        <label className="form-label" >Status</label>
                        <select className="form-select" aria-label="Default select example" value={jobstatus} onChange={(e) => setJobstatus(e.target.value)}>
                            <option value="">-- select status --</option>
                            <option value="Served">Served</option>
                            <option value="Printed">Printed</option>
                            <option value="SOS">SOS</option>
                            <option value="To Print">To Print</option>
                        </select>
                    </div>

                    <div className="form-outline mb-4">
                        <label className="form-label" >Email</label>
                        <input type="email" id="typeRemotecodeX-2" className="form-control form-control-lg" value={email} onChange={(e) => setEmail(e.target.value)} /> 
                    </div>

                    <div className="form-outline mb-4">
                        <label className="form-label" >Notified ?</label>

                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value={notified}  onChange={(e) => setNotified(e.target.checked)} />
                        </div>
                    </div>

                    <button className="btn btn-primary btn-sm btn-block" type="submit">Add Request</button>
                </form>
            </div>

        </>
    );  
}

export default AddPrinter;
