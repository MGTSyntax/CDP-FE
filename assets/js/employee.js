// /assets/js/employees.js
import { getDatabases, getEmployees } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
    const dbSelect = document.querySelector('#dbSelectEmp');
    const fetchBtn = document.querySelector('#fetchEmpBtn');

    let employeeData = [];
    const employeesCol = ['emp_code', 'emp_name', 'empsec_code', 'empsec_name'];
});