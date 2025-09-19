// /assets/js/script.js
import { getDatabases, getDepartments, getEmployees } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // For detachments
    const dbSelect = document.querySelector('#dbSelect');
    const viewDataBtn = document.querySelector('#fetchDB');

    let detachmentsData = [];
    const detachmentsCol = ['dept_code', 'dept_name', 'sec_code', 'sec_name'];

    // For employees
    const dbSelectForEmp = document.querySelector('#dbSelectforEmp');
    const viewDataBtnforEmp = document.querySelector('#fetchDBforEmp');

    let employeeData = [];
    const employeesCol = ['emp_code', 'emp_name', 'empsec_code', 'empsec_name'];

    const tableBody = document.querySelector('#departmentsTable tbody');
    const searchInput = document.querySelector('#searchInput');
    const paginationControls = document.querySelector('#paginationControls');

    let currentPage = 1;
    let currentData = [];
    let currentColumns = [];
    let itemsPerPage = getItemsPerPage();

    function getItemsPerPage() {
        const screenHeight = window.innerHeight;
        if (screenHeight <= 653) {
            return 10;
        } else if (screenHeight > 653 && screenHeight <= 965) {
            return 20;
        } else {
            return 25;
        }
    }

    // Fetch and Populate Databases for Selection
    async function populateDatabases() {
        const databases = await getDatabases();

        if (dbSelect) {
            databases.forEach(db => {
                const option1 = new Option(db.label, db.value);
                dbSelect.appendChild(option1);
            });
        }

        if (dbSelectForEmp) {
            databases.forEach(db => {
                const option2 = new Option(db.label, db.value);
                dbSelectForEmp.appendChild(option2);
            });
        }
    }

    // Load Databases on Page Load
    await populateDatabases();

    // Click View Button to Fetch Departments and Detachments from Backend API
    if (viewDataBtn) {
        viewDataBtn.addEventListener('click', async () => {
            const selectedDb = dbSelect.value;
            if (!selectedDb) {
                alert('Please select database.');
                return;
            }

            detachmentsData = await getDepartments(selectedDb);
            currentData = detachmentsData;
            currentColumns = detachmentsCol;
            currentPage = 1;
            renderTable();
            setupPagination(detachmentsData.length);
            searchInput.value = '';
        });
    }

    // Click View Button to Fetch Employees from Backend API
    if (viewDataBtnforEmp) {
        viewDataBtnforEmp.addEventListener('click', async () => {
            const selectedDbEmp = dbSelectForEmp.value;
            if (!selectedDbEmp) {
                alert('Please select database.');
                return;
            }

            employeeData = await getEmployees(selectedDbEmp);
            currentData = employeeData;
            currentColumns = employeesCol;
            currentPage = 1;
            renderTable();
            setupPagination(employeeData.length);
        });
    }
    
    // Search results
    searchInput.value = '';
    searchInput.addEventListener('input', () => {
        const searchItem = searchInput.value.toLowerCase();
        const filteredData = currentData.filter(item =>
            item[currentColumns[1]].toLowerCase().includes(searchItem) ||
            (item[currentColumns[3]] && item[currentColumns[3]].toLowerCase().includes(searchItem))
        );
        currentPage = 1;
        renderTable(filteredData);
        setupPagination(detachmentsData.length);
    });

    // Render Table Data
    function renderTable(data = currentData) {
        tableBody.innerHTML = '';

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = data.slice(startIndex, endIndex);

        if (pageData.length === 0) {
            tableBody.innerHTML = '<td colspan="4">No results found.</td>';
            return;
        }

        pageData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = currentColumns.map(col => `<td>${item[col] || ''}</td>`).join('');
            tableBody.appendChild(row);
        });
    }

    // Pagination Setup
    function setupPagination(totalItems) {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Curent page of Last page summary
        const pageSummary = document.createElement('span');
        pageSummary.textContent = `Page ${currentPage} of ${totalPages}`;
        paginationControls.appendChild(pageSummary);

        if (currentPage > 1) {
            paginationControls.appendChild(createPaginationButton('<<', () => { goToPage(1); }));
            paginationControls.appendChild(createPaginationButton('<', () => { goToPage(currentPage -1); }));
        }

        if (currentPage < totalPages) {
            paginationControls.appendChild(createPaginationButton('>', () => { goToPage(currentPage + 1); }));
            paginationControls.appendChild(createPaginationButton('>>', () => { goToPage(totalPages); }));
        }
    }
        
    function createPaginationButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add('pagination-button');
        button.addEventListener('click', onClick);
        return button;
    }

    function goToPage(page) {
        currentPage = page;
        renderTable();
        setupPagination(currentData.length);
    }
});