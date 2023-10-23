import React,{useState,useEffect} from 'react';
import Moment from 'moment';
import Navbar from '../component/navbar.js';
import { useNavigate , Link} from "react-router-dom";
import JobDataService from '../services/jobs.services.js';
import Pagination from '../component/pagination.js';
import axios from 'axios';
import csvFile from "../dishIDs.csv";
import { readString } from 'react-papaparse';
import PrinterDataService from '../services/printers.services.js';


const Printjob = () => {

    const navigate = useNavigate();
    const [requestlist,setRequestlist] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);
    const [dishId, setDishId] = useState('');
    const [apitoken, setApioken] = useState('');
    const [eligbleapitoken, setEligbleApiToken] = useState('');
    const [capsulecolor, setCapsulecolor] = useState('');
    const [printerlist,setPrinterlist] = useState([]); 

    const instance = axios.create({baseURL: process.env.REACT_APP_API_URL});

    useEffect(() => {

       /**If No loggedin user found then refirect to login page */
        const getOperator = localStorage.getItem("getOperator");
        const getOperatorDetail = getOperator ? JSON.parse(getOperator) : null;
        if(getOperatorDetail === null || getOperatorDetail == 'undefined'){
            navigate("/login");
        }

        /** first fetch printer for get tokens */
        getAllPrinter();
        getAllJobs();
        if(printerlist !== '' && printerlist !== 'undefined'){
            updateToken();
        }

    }, []);


    const updateToken = async() => {
        await Promise.all(printerlist.map(async (printer) => {
            if(printer.token === null || printer.token === '' ){
               await logintoServer(printer.id,printer.printerName,printer.remoteAccessCode);
            }else{
                await fetchPrinterStatus(printer.token,printer.id);
            }
        }));
    }

    const getAllJobs = async() => {
        const this_Operator = localStorage.getItem("getOperator");
        const this_OperatorDetail = this_Operator ? JSON.parse(this_Operator) : null;
        const this_data = await JobDataService.getAllJobByLocationCode(this_OperatorDetail.location);
        setRequestlist(this_data);
    };

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = requestlist.slice(indexOfFirstRecord, indexOfLastRecord);
    const nPages = Math.ceil(requestlist.length / recordsPerPage);

    const deleteHandler = async (id) => {
        if(id != '' && id != 'undefined'){
            await JobDataService.deleteJob(id);
            getAllJobs();
        }else{
            return ;
        }
    };

    const printHandler = async (id) => {
        if(id != '' && id != 'undefined'){
            const jobDetail = await JobDataService.getJob(id);
            if(jobDetail){ 
                let dish2 = null;
                if(capsulecolor !== null && capsulecolor !== ''){
                    const papaconfig = {
                        complete: (results, file) => {
                            const dataRows = results.data;
                            dataRows.forEach(row => {
                                if((row[0].toLowerCase() ===  jobDetail.shape.toLowerCase()) && (row[1].toLowerCase() === capsulecolor.toLowerCase())){
                                    setDishId('');
                                    dish2= row[2];
                                    setDishId(dish2);
                                }
                            });
                        },
                        download: true,
                        error: (error, file) => {
                          console.log('error while parsing:', error, file);
                        },
                    };
                    readString(csvFile, papaconfig);
                }else{
                    const papaconfig = {
                        complete: (results, file) => {
                            const dataRows = results.data;
                            dataRows.forEach(row => {
                                if((row[0].toLowerCase() ===  jobDetail.shape.toLowerCase()) && (row[1].toLowerCase() === jobDetail.capsule.toLowerCase())){
                                    setDishId('');
                                    dish2= row[2];
                                    setDishId(dish2);
                                }
                            });
                        },
                        download: true,
                        error: (error, file) => {
                          console.log('error while parsing:', error, file);
                        },
                    };
                    readString(csvFile, papaconfig);
                }

                if(dishId !== null && dishId !== 'undefined'){
                    if(apitoken !== null){
                        printServer(dishId,jobDetail.id);
                    }   
                }
            }
        }else{
            return ;
        }
    };


    const printServer = async(dishId,jobId) =>{
        let this_dishId = null
        if(process.env.REACT_APP_ENVIRONMENT == 'local'){
            this_dishId  = 3;
        }else{
            this_dishId  = dishId;
        }
        let printToken = null;
        if(eligbleapitoken !== null && eligbleapitoken !== ''){
            printToken = eligbleapitoken;
        }else{
            printToken = apitoken;
        }

        if(this_dishId !== null ){
            const req_body = { "id": this_dishId };
            const headers = {
                'x-token': printToken,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            }
            const print_url = 'https://remote.naturalmachines.com/1/foodini/1/print';

            await axios.put(print_url, req_body,{
                headers: headers
            }).then(response => {
                console.log(response);
                console.log('success');

                const jobupdate = {
                    last_used_at : Date.now(),
                    jobstatus    : 'Completed',

                }
                JobDataService.updateJob(jobId,jobupdate);
                getAllJobs();

            }) .catch(err => {
                console.log(err);
                alert(err.message);
            });
        }
    }
    

    const refreshHandler = async(event) =>{
        if(printerlist !== '' && printerlist !== 'undefined'){
            if(printerlist !== '' && printerlist !== 'undefined'){
                loginStatus();
            }
        }
    }

    const loginStatus = async() => {
        await Promise.all(printerlist.map(async (printer) => {
            if(printer.token === null || printer.token === '' ){
               await logintoServer(printer.id,printer.printerName,printer.remoteAccessCode);
            }else{
                await fetchPrinterStatus(printer.token,printer.id);
            }
        }));
    }

    const getAllPrinter = async() => {
        const this_Operator = localStorage.getItem("getOperator");
        const this_OperatorDetail = this_Operator ? JSON.parse(this_Operator) : null;
        const this_data = await PrinterDataService.getAllPrinterByLocationCode(this_OperatorDetail.location);
        setPrinterlist(this_data);
    };



    const printerCapsule =  async()=>{
        if(printerlist){
            await Promise.all(printerlist.map(async (printer) => {
                if(printer.token !== null || printer.token !== '' ){
                    if(printer.last_status === 'Idle'){
                        if(printer.capsule1 !== null || printer.capsule1 !== '' ){
                            setEligbleApiToken(printer.token);
                            setCapsulecolor(printer.capsule1);
                        }else if(printer.capsule2 !== null || printer.capsule2 !== '' ){
                            setEligbleApiToken(printer.token);
                            setCapsulecolor(printer.capsule2);
                        }else if(printer.capsule3 !== null || printer.capsule3 !== '' ){
                            setEligbleApiToken(printer.token);
                            setCapsulecolor(printer.capsule3);
                        }else if(printer.capsule4 !== null || printer.capsule4 !== '' ){
                            setEligbleApiToken(printer.token);
                            setCapsulecolor(printer.capsule4);
                        }else if(printer.capsule5 !== null || printer.capsule5 !== '' ){
                            setEligbleApiToken(printer.token);
                            setCapsulecolor(printer.capsule5);
                        }else{
                            setEligbleApiToken('');
                            setCapsulecolor('');
                        }
                    }
                }
            }));
        }    

    }

    const fetchPrinterStatus=async(token,rowId)=>{
        if(token !== null){
            const headers = {
                'x-token': token,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            }
            const print_stats_url = 'https://remote.naturalmachines.com/1/foodini/1/stats';
            await instance.get(print_stats_url,  {
                headers: headers
            }).then(response => {
                if(response){
                    let printerStats = response.data.state;
                    if(rowId !== null){
                        let printerupdate = {
                            last_used_at : Date.now(),
                            last_status : printerStats,
                        }
                        PrinterDataService.updatePrinter(rowId,printerupdate);
                        if(printerStats === 'Idle'){
                            setApioken(token);
                        }
                        printerCapsule();
                    }
                }
            }) .catch(err => {
                console.log(err);
                if(rowId !== null){
                    let printerupdate = {
                        last_used_at : Date.now(),
                        last_status : 'Not available',
                    }
                    PrinterDataService.updatePrinter(rowId,printerupdate);
                }
            });
        }
        
    }
   

    const logintoServer = async(rowId,printerName,remoteCode) =>{
        let user =  printerName + '@' + remoteCode;
        if(printerName !== null && remoteCode !== null ){
            const req_body = {"login": user ,"password":"","remoteAccessCode":remoteCode };
            const headers = {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Accept' : '*/*',
            };
            const login_Url = 'https://remote.naturalmachines.com/1/user/login';
            await instance.post(login_Url, req_body,{
                headers: headers
            }).then(response => {
                let this_token = response.data.token;
                //window.localStorage.clear();
                window.localStorage.setItem("logintoken_"+printerName, this_token);
                let updateThis = {
                    last_used_at : Date.now(),
                    token : response.data.token
                }
                PrinterDataService.updatePrinter(rowId,updateThis);
            }) .catch(err => {
                console.log(err);
                alert(err.message);
            });
        }
    }

    return (
        <>
            <div className="container-fluid vh-100" style={{ backgroundColor : "#FFF"}}>
                <Navbar />
                <div className="row mt-4">
                    <div className="col-md-6"><h6 className="display-6 mt-6"><strong>Printing Jobs :</strong></h6></div>
                    <div className="col-md-6 text-end">
                    <button className="btn btn-sm btn-warning" onClick={(e)=> refreshHandler(e) }> Refresh</button>
                        {/* <Link to='/print-request' className="btn btn-sm btn-primary">New Request</Link> */}
                    </div>
                </div>

                <table className="container table table-striped mt-6">
                    <thead>
                        <tr>
                            <th>Print From</th>
                            <th>Shape</th>
                            <th>Capsule</th>
                            <th>Action</th>
                            <th>Last Update</th>
                            <th>Email</th>
                            <th>Notified</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        { 
                            currentRecords.map( (value, index) =>{
                                let checked = value.notified === 1 ? "true" : "";

                                if(!value.hasOwnProperty('jobstatus')){
                                    value.jobstatus = 'to print';
                                }

                                return(
                                    <tr key={ value.id}  >
                                        <td> {Moment(value.print_from).format('llll') } </td>
                                      
                                        <td>{ value.shape}</td>
                                        <td>{ value.capsule}</td>
                                        <td>{ value.jobstatus === 'to print' ?  (<button className="btn btn-sm btn-success" onClick={(e)=> printHandler(value.id) }>Print</button>) : ((<button className="btn btn-sm btn-default"  >Print</button>)) }</td>
                                        <td> {Moment(value.last_updated).format('llll') } </td>
                                        <td>{ value.email}</td>
                                        <td>
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" value="" checked={checked} />
                                            </div>
                                        </td>
                                        <td>{ value.jobstatus}</td>
                                        <td><button className="btn btn-sm btn-danger" onClick={(e)=> deleteHandler(value.id) }>Delete</button></td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
                <Pagination nPages={nPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </div>
            
        </>
    );

}


export default Printjob;