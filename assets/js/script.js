// /assets/js/script.js
import { getDatabases, getDepartments } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const dbSelect = document.querySelector('#dbSelect');
    const viewDataBtn = document.querySelector('#fetchDB');
    const tableBody = document.querySelector('#departmentsTable tbody');
    const searchInput = document.querySelector('#searchInput');
    const paginationControls = document.querySelector('#paginationControls');

    let detachmentsData = [];
    let currentPage = 1;
    let currentData = [];
    let currentColumns = [];
    let itemsPerPage = getItemsPerPage();
    const detachmentsCol = ['dept_code', 'dept_name', 'sec_code', 'sec_name'];

    function getItemsPerPage() {
        const screenHeight = window.innerHeight;
        if (screenHeight <= 653) return 10;
        if (screenHeight <= 965) return 20;
        return 25;
    }

    // Fetch and Populate Databases for Selection
    async function populateDatabases() {
        try {
            const databases = await getDatabases();
            if (!databases?.length) return;

            if (dbSelect) {
                databases.forEach((db) => {
                    const option1 = new Option(db.label, db.value);
                    dbSelect.appendChild(option1);
                });
            }
        } catch (err) {
            console.error('Error fetching databases:', err);
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
            tableBody.innerHTML = '<tr><td colspan="8">No results found.</td></tr>';
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

        const navWrapper = document.createElement('div');
        navWrapper.classList.add('pagination-inner');
        
        const leftGroup = document.createElement('div');
        leftGroup.classList.add('pagination-group');
        if (currentPage > 1) {
            leftGroup.appendChild(createPaginationButton('◀◀', () => goToPage(1)));
            leftGroup.appendChild(createPaginationButton('◀', () => goToPage(currentPage -1)));
        }

        // Page summary in the middle
        const pageSummary = document.createElement('span');
        pageSummary.textContent = `Page ${currentPage} of ${totalPages}`;
        pageSummary.classList.add('page-summary');

        const rightGroup = document.createElement('div');
        rightGroup.classList.add('pagination-group');
        if (currentPage < totalPages) {
            rightGroup.appendChild(createPaginationButton('▶', () => goToPage(currentPage + 1)));
            rightGroup.appendChild(createPaginationButton('▶▶', () => goToPage(totalPages)));
        }

        // Append in proper order
        navWrapper.appendChild(leftGroup);
        navWrapper.appendChild(pageSummary);
        navWrapper.appendChild(rightGroup);
        paginationControls.appendChild(navWrapper);
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