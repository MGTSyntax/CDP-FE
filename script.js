document.addEventListener('DOMContentLoaded', () => {
    const selectDatabase = document.querySelector('#dbSelect');
    const viewDataBtn = document.querySelector('#fetchDB')
    const tableBody = document.querySelector('#departmentsTable tbody');
    const searchInput = document.querySelector('#searchInput');
    const paginationControls = document.querySelector('#paginationControls');
    let detachmentsData = [];
    let currentPage = 1;

    function getItemsPerPage() {
        const screenHeight = window.innerHeight;
        console.log(screenHeight);
        if (screenHeight <= 653) {
            return 10;
        } else if (screenHeight > 653 && screenHeight <= 965) {
            return 20;
        } else {
            return 25;
        }
    }

    let itemsPerPage = getItemsPerPage();

    fetch('http://localhost:3100/databases')
        .then(response => response.json())
        .then(databases => {
            databases.forEach(db => {
                const option = document.createElement('option');
                option.value = db.value;
                option.textContent = db.label;
                selectDatabase.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching databases:', error));

    viewDataBtn.addEventListener('click', () => {
        const selectedDb = selectDatabase.value;
        if (!selectedDb) {
            alert('Please select database.');
            return;
        }

        fetch(`http://localhost:3100/departments?db=${selectedDb}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                detachmentsData = data;
                currentPage = 1;
                renderTable(detachmentsData);
                setupPagination(detachmentsData.length);
                searchInput.value = '';
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                tableBody.innerHTML = '<tr><td colspan="4">Error loading data</td></tr>';
            });
    });

    searchInput.value = '';
    searchInput.addEventListener('input', () => {
        const searchItem = searchInput.value.toLowerCase();
        const filteredData = detachmentsData.filter(detachment =>
            detachment.dept_name.toLowerCase().includes(searchItem) ||
            (detachment.sec_name && detachment.sec_name.toLowerCase().includes(searchItem))
        );
        currentPage = 1;
        renderTable(filteredData);
        setupPagination(detachmentsData.length);
    });

    function renderTable(data) {
        tableBody.innerHTML = '';

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = data.slice(startIndex, endIndex);

        if (pageData.length === 0) {
            tableBody.innerHTML = '<td colspan="4">No results found.</td>';
            return;
        }

        pageData.forEach(detachment => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${detachment.dept_code}</td>
                <td>${detachment.dept_name}</td>
                <td>${detachment.sec_code}</td>
                <td>${detachment.sec_name}</td>
            `;

            tableBody.appendChild(row);
        });
    }

    function setupPagination(totalItems) {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // First page button
        if (currentPage >= 1) {
            const firstButton = createPaginationButton('<<', () => {
                currentPage = 1;
                renderTable(detachmentsData);
                setupPagination(totalItems);
            });
            paginationControls.appendChild(firstButton);
        }

        // Previous page button
        if (currentPage > 1) {
            const prevButton = createPaginationButton('<', () => {
                currentPage--;
                renderTable(detachmentsData);
                setupPagination(totalItems);
            });
            paginationControls.appendChild(prevButton);
        }


        // Curent page of Last page summary
        const pageSummary = document.createElement('span');
        pageSummary.textContent = `Page ${currentPage} of ${totalPages}`;
        paginationControls.appendChild(pageSummary);

        // Next page button
        if (currentPage < totalPages) {
            const nextButton = createPaginationButton('>', () => {
                currentPage++;
                renderTable(detachmentsData);
                setupPagination(totalItems);
            });
            paginationControls.appendChild(nextButton);
        }

        // Last page button
        if (currentPage <= totalPages) {
            const lastButton = createPaginationButton('>>', () => {
                currentPage = totalPages;
                renderTable(detachmentsData);
                setupPagination(totalItems);
            });
            paginationControls.appendChild(lastButton);
        }
    }

    function createPaginationButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add('pagination-button');
        button.addEventListener('click', onClick);
        return button;
    }
});