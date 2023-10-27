import React,{useState,useEffect} from 'react';
import Moment from 'moment';
import Navbar from '../component/navbar.js';
import { useNavigate, Link } from "react-router-dom";
import PrinterDataService from '../services/printers.services.js';
import Pagination from '../component/pagination.js';
import axios from 'axios';

const Dashboard = () => {
    const navigate = useNavigate();
    const [printerlist,setPrinterlist] = useState([]); 

    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);
    const [updatedRow,setUpdatedRow] = useState({id: null, values: {}});

    const instance = axios.create({baseURL: process.env.REACT_APP_API_URL});

    useEffect(() => {
       /**If No loggedin user found then refirect to login page */
        const getOperator = localStorage.getItem("getOperator");
        const getOperatorDetail = getOperator ? JSON.parse(getOperator) : null;
        if(getOperatorDetail == null || getOperatorDetail == 'undefined'){
            navigate("/login");
        }
        getAllPrinter();

        if(printerlist !== '' && printerlist !== 'undefined'){
            loginStatus();
            getAllPrinter();
        }


    }, []);


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
                alert(err.message);
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

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = printerlist.slice(indexOfFirstRecord, indexOfLastRecord);
    const nPages = Math.ceil(printerlist.length / recordsPerPage);

    const deleteHandler = async (id) => {
        if(id != '' && id != 'undefined'){
            await PrinterDataService.deletePrinter(id);
            getAllPrinter();
        }else{
            return ;
        }
    };

    const editHandler = (id,values)=>{
        if(updatedRow?.id == id){
            setUpdatedRow({id:null, values: {}});
        }
        else{
            setUpdatedRow({id:id, values: values});
        }
    }

    const handleUpdateRow=(value,id,key)=>{
        const cvalue = {id: id,values: {...updatedRow?.values}};
        cvalue.values[key]= value;
        setUpdatedRow(cvalue);
    }

    const UpdateHandler = async (id)=>{
        //console.log(updatedRow?.values);
        await PrinterDataService.updatePrinter(id,updatedRow?.values);

        window.location.reload(false);
        //getAllPrinter();
    }

    const refreshHandler = async(event) =>{
        if(printerlist !== '' && printerlist !== 'undefined'){
            loginStatus();
        }
    }

    return (
        <>
            <div className="container-fluid vh-100" style={{ backgroundColor : "#FFF"}}>
                <Navbar />
                <div className="row mt-4">
                    <div className="col-md-6"><h6 className="display-6 mt-6"><strong>Available Printers :</strong></h6></div>
                    <div className="col-md-6 text-end">
                        <button className="btn btn-sm btn-warning" onClick={(e)=> refreshHandler(e) } style={{marginRight: "10px"}} >Refresh</button>
                        <Link to='/add-printer' className="btn btn-sm btn-primary">New Printer</Link>
                    </div>
                </div>
                <table className="container table table-striped mt-6">
                    <thead className="bg-info">
                        <tr>
                            <th>Remote Access Code</th>
                            <th>User Name</th>
                            <th>Last Status</th>
                            <th>Capsule 1 (Green) </th>
                            <th>Capsule 2 (Orange) </th>
                            <th>Capsule 3 (Purple) </th>
                            <th>Capsule 4 (Red) </th>
                            <th>Capsule 5 (Yellow) </th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                    { 
                        currentRecords.map( (value, index) =>{
                            const nameValueHash = {
                                printerName: value.printerName,
                                capsule1: value?.capsule1,
                                capsule2: value?.capsule2,
                                capsule3: value?.capsule3,
                                capsule4: value?.capsule4,
                                capsule5: value?.capsule5
                            }
                            return(
                                <>
                                
                                <tr key={index}>
                                    <td>{ value.remoteAccessCode}</td> 
                                    <td>{ value.printerName}</td>
                                    <td>{ value.last_status} ({Moment(value.last_used_at).format('HH:ss') }) </td>
                                    <td>{ value.capsule1}</td>
                                    <td>{ value.capsule2}</td>
                                    <td>{ value.capsule3}</td>
                                    <td>{ value.capsule4}</td>
                                    <td>{ value.capsule5}</td>
                                    <td><button className="btn btn-sm btn-primary" onClick={(e)=> editHandler(value.id,nameValueHash) } style={ updatedRow?.id == value.id ? { display:'block'} : {display : 'block'} }    >{updatedRow?.id == value.id ? 'Hide' : 'Edit'}</button></td>

                                    <td><button className="btn btn-sm btn-danger" onClick={(e)=> deleteHandler(value.id) }>Delete</button></td>
                                </tr>
                                {
                                    updatedRow?.id == value.id && 
                                    <tr id={value?.id} key={"edit"+value?.id}>
                                    <td key={"remoteAccessCode"}> { value.remoteAccessCode}</td> 
                                    {
                                        (Object.keys(nameValueHash)).map((key)=>{
                                            return(
                                                <td> <input type='text' id={key} key={key} value={updatedRow?.values[key]} placeholder={key} onChange={(e)=>handleUpdateRow(e.target.value,value?.id,key)}/></td>
                                            )
                                        })
                                    }
                                    <td><button className="btn btn-sm btn-primary" onClick={(e)=> UpdateHandler(value.id) }>Update</button></td>
                                    </tr>
                                }
                                
                                </>
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


export default Dashboard;