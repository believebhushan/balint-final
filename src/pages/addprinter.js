import React,{useState, useEffect} from 'react';
import PrinterDataService from '../services/printers.services.js';
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

    const [printername, setPrintername] = useState("");

    const [remotecode, setRemotecode] = useState("");

    //const [printerstatus, setPrinterstatus] = useState("");

    const [message , setMessage] = useState({error: false , msg : ""});

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        // if(getOperatorDetail === null || getOperatorDetail === 'undefined'){
        //     setMessage({error: true , msg : "Login first"});
        //     return;
        // }

        if(getOperatorDetail.location === ""){
            setMessage({error: true , msg : "Location Code is Manadatory"});
            return;
        }

        const trimprint = printername.trim();
        if(printername === "" || trimprint === "" || printername == 'undefined' || trimprint == 'undefined'){
            setMessage({error: true , msg : "Printer Name is Manadatory"});
            return;
        }


        const trimremote = remotecode.trim();
        if(remotecode === "" || trimremote === "" || remotecode == 'undefined' || trimremote == 'undefined'){
            setMessage({error: true , msg : "remote Code is Manadatory"});
            return;
        }

        // const trimstatus = printerstatus.trim();
        // if(printerstatus === "" || trimstatus === "" || printerstatus == 'undefined' || trimstatus == 'undefined'){
        //     setMessage({error: true , msg : "Select printer status"});
        //     return;
        // }

        const this_existing_data = await PrinterDataService.getPrinterByName(trimprint);
        if(this_existing_data.length > 0){
            setMessage({error: true , msg : "Printer already exist"});
            return;
        }

        try{

            const printerAdd = {
                printerName : printername,
                remoteAccessCode : trimremote,
                status : 1,
                created_at : Date.now(),
                last_used_at : Date.now(),
                capsule1 : '',
                capsule2 : '',
                capsule3 : '',
                capsule4 : '',
                capsule5 : '',
                location : getOperatorDetail.location,
                token : '',
            }

            const this_result =  await PrinterDataService.addPrinter(printerAdd);
            if(this_result){
                setMessage({error: false , msg : "Printer add Successfully!"});
                setTimeout(() => {
                    navigate("/dashboard");
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
                <div className="row mt-4">
                    <div className="col-md-6"><h6 className="display-6 mt-6"><strong>Add User :</strong></h6></div>
                    <div className="col-md-6 text-end"><Link to='/dashboard' className="btn btn-sm btn-primary">Back</Link></div>
                </div>
                { message?.msg && ( <div className={message?.error ? "alert alert-danger alert-dismissible fade show" : "alert alert-success alert-dismissible fade show"} role="alert">{ message?.msg} <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick ={()=> setMessage("")}><span aria-hidden="true">&times;</span></button></div> )}
                <form onSubmit={handleSubmit} className="container w-60">
                    <div className="form-outline mb-4">
                        <label className="form-label" >User Name</label>
                        <input type="text" id="typeRemotecodeX-2" className="form-control form-control-lg" value={printername} onChange={(e) => setPrintername(e.target.value)} /> 
                    </div>


                    <div className="form-outline mb-4">
                        <label className="form-label" >Remote Code</label>
                        <input type="text" id="typeRemotecodeX-2" className="form-control form-control-lg" value={remotecode} onChange={(e) => setRemotecode(e.target.value)} /> 
                    </div>

                    {/* <div className="form-outline mb-4">
                        <label className="form-label" >Printer Status</label>
                        <select className="form-select" aria-label="Default select example" value={printerstatus} onChange={(e) => setPrinterstatus(e.target.value)}>
                            <option value="">-- select status --</option>
                            <option value="Idle">Idle</option>
                            <option value="Paused">Paused</option>
                        </select>
                    </div> */}

                    <button className="btn btn-primary btn-sm btn-block" type="submit">Add Printer</button>
                </form>
            </div>

        </>
    );  
}

export default AddPrinter;
