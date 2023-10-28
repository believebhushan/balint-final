import React ,{useState,useEffect} from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Navbar = () => {

    const [operator,setOperator] = useState(''); 

    useEffect(() => {
        /**If No loggedin user found then refirect to login page */
         const getOperator = localStorage.getItem("getOperator");
         const getOperatorDetail = getOperator ? JSON.parse(getOperator) : null;

         if(getOperatorDetail !== null && getOperatorDetail !== 'undefined'){
            setOperator(getOperatorDetail);
        }
     }, []);


    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-info mt-2">
                <div className="container-fluid">
                    <Link to='#' className="navbar-brand">Dashboard</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNavDropdown">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link to='/' className="nav-link" aria-current="page">Printer</Link>
                            </li>
                            <li className="nav-item">
                                <Link to='/print-jobs' className="nav-link" >Jobs</Link>
                            </li>
                            <li className="nav-item ProfileName">
                                <h6>Welcome Back { operator.location } !</h6>
                            </li>
                            <li className="nav-item logout">
                                <Link to='/logout' className="nav-link" >Logout</Link>
                            </li>
                            
                        </ul>
                    </div>
                </div>
            </nav>

        </>
    );
}    

export default Navbar;