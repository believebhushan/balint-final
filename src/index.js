import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import $ from 'jquery';
import Popper from 'popper.js';
import './index.css';
import App from './App';


import Loginform from './pages/login.js';
import Dashboard from './pages/dashboard.js';
import Logout from './pages/logout.js';
import Printjob from './pages/printjob.js';
import PageNotFound from './pages/pagenotfound.js';
import AddPrinter from './pages/addprinter.js';
import PrintRequest from './pages/printrequest.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        <Route path="login" element={<Loginform />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="logout" element={<Logout />} />
        <Route path="print-jobs" element={<Printjob />} />
        <Route path='add-printer' element={<AddPrinter />} />
        <Route path='print-request' element={<PrintRequest />} />
        <Route path='*' element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>  

  </React.StrictMode>
);

