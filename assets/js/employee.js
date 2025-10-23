// /assets/js/employee.js
import { getDatabases, getEmployees, getEmpProfile } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
    const dbSelect = document.querySelector('#dbSelectEmp');
    const fetchBtn = document.querySelector('#fetchEmpBtn');
    const searchInput = document.querySelector('#searchInput');
    const tableBody = document.querySelector("#employeesTable tbody");
    const paginationControls = document.querySelector("#paginationControls");

    // Modal elements
    const modal = document.querySelector("#employeeModal");
    const modalDetails = document.querySelector("#employeeDetails");
    const closeModalBtn = document.querySelector("#closeModal");
    const printProfileBtn = document.getElementById("printProfileBtn");

    let employeesData = [];
    let filteredData = [];
    let currentPage = 1;
    const itemsPerPage = getItemsPerPage();
    const currentColumns = ['ji_empNo', 'ji_fname', 'ji_mname', 'ji_lname', 'ji_extname', 'assignment', 'detachment'];

    function getItemsPerPage() {
        const h = window.innerHeight;
        if (h <= 653) return 10;
        if (h <= 965) return 20;
        return 25;
    }

    async function loadDatabases() {
        try {
            const dbs = await getDatabases();
            if (dbSelect && Array.isArray(dbs)) {
                dbSelect.innerHTML = '<option value="">-- Select --</option>';
                dbs.forEach((db) => {
                    const option = new Option(db.label, db.value);
                    dbSelect.appendChild(option);
                });
            }
        } catch (err) {
            console.error('Error fetching databases:', err);
        }
    }
    await loadDatabases();

    if (fetchBtn) {
        fetchBtn.addEventListener('click', async () => {
            const db = dbSelect.value;
            if (!db) return alert('Please select a database first.');

            employeesData = await getEmployees(db) || [];
            filteredData = employeesData;
            currentPage = 1;
            renderTable();
            renderPagination();
            searchInput.value = '';
        });
    }

    if (searchInput) {
        searchInput.value = '';
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.trim().toLowerCase();
            if (!term) {
                filteredData = employeesData;
            } else {
                filteredData = employeesData.filter((emp = {}) =>
                    (emp.ji_empNo || "").toLowerCase().includes(term) ||
                    (emp.ji_lname || "").toLowerCase().includes(term) ||
                    (emp.ji_fname || "").toLowerCase().includes(term) ||
                    (emp.assignment || "").toLowerCase().includes(term) ||
                    (emp.detachment || "").toLowerCase().includes(term)
                );
            }
            currentPage = 1;
            renderTable();
            renderPagination();
        });
    }

    function renderTable() {
        tableBody.innerHTML = '';
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = (filteredData || []).slice(startIndex, endIndex);

        const totalCols = currentColumns.length + 1;

        if (!pageData.length) {
            tableBody.innerHTML = `<tr><td colspan="${totalCols}">No results found.</td></tr>`;
            return;
        }

        pageData.forEach((emp) => {
            const row = document.createElement('tr');
            row.innerHTML = currentColumns.map(col => `<td>${emp[col] ?? ""}</td>`).join('');
            row.innerHTML += `<td><button class="view-btn" data-id="${emp.ji_empNo}">View Details</button></td>`;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.view-btn').forEach((btn) =>
            btn.addEventListener('click', async (e) => {
                const empNo = e.currentTarget.getAttribute("data-id");
                const emp = employeesData.find((x) => String(x.ji_empNo) === String(empNo));
                if (!emp) return alert("Employee not found.");

                const db = dbSelect.value;

                const fullProfile = await getEmpProfile(db, empNo);
                showEmployeeModal(emp, fullProfile);
            })
        );
    }

    function renderPagination() {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
        if (totalPages <= 1) return;

        const createButton = (label, page) => {
            const btn = document.createElement("button");
            btn.textContent = label;
            btn.className = "pagination-button";
            btn.disabled = page === currentPage;
            btn.onclick = () => {
                currentPage = page;
                renderTable();
                renderPagination();
            };
            return btn;
        };

        paginationControls.appendChild(createButton("◀◀", 1));
        paginationControls.appendChild(createButton("◀", Math.max(1, currentPage - 1)));

        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        paginationControls.appendChild(pageInfo);

        paginationControls.appendChild(createButton("▶", Math.min(totalPages, currentPage + 1)));
        paginationControls.appendChild(createButton("▶▶", totalPages));
    }

    function showEmployeeModal(emp = {}, fullProfile = null) {
        const basic = fullProfile.basicInfo || {};
        const personal = fullProfile.personalInfo || {};
        const job = fullProfile.jobInfo || {};
        const educ = fullProfile.educInfo || {};
        const email = fullProfile.emailaddInfo || {};
        const emergency = fullProfile.emergencyInfo || {};
        const family = fullProfile.familyInfo || {};
        const pemp = fullProfile.pempInfo || {};
        const disciplinary = fullProfile.disciplinaryInfo || {};
        const compensation = fullProfile.compensationInfo || {};

        const safe = (val) => val || "-";

        modalDetails.innerHTML = `
        <h2>${basic.ji_fname || emp.ji_fname} ${basic.ji_mname || emp.ji_mname || ""} ${basic.ji_lname || emp.ji_lname}</h2>
        <p><strong>Employee No:</strong> ${basic.ji_empNo || emp.ji_empNo}</p>

        <hr><h3>📋 Basic Information</h3>
        <p><strong>Birthdate:</strong> ${safe(personal.pi_dbirth)}</p>
        <p><strong>Address:</strong> ${safe(personal.pi_add)}</p>
        <p><strong>Contact No:</strong> ${safe(personal.pi_tel)}</p>
        <p><strong>Nationality:</strong> ${safe(personal.pi_nationality)}</p>
        <p><strong>Civil Status:</strong> ${safe(personal.pi_cstatus)}</p>

        <hr><h3>🏢 Job Information</h3>
        <p><strong>Department:</strong> ${safe(job.ji_dept || emp.assignment)}</p>
        <p><strong>Detachment:</strong> ${safe(job.ji_sec || emp.detachment)}</p>
        <p><strong>Position:</strong> ${safe(job.ji_pos)}</p>
        <p><strong>Date Hired:</strong> ${safe(job.ji_dateHired)}</p>

        <hr><h3>🎓 Educational Background</h3>
        <p><strong>School:</strong> ${safe(educ.educ_school)}</p>
        <p><strong>Degree:</strong> ${safe(educ.educ_type)}</p>

        <hr><h3>📧 Email Address</h3>
        <p><strong>Email:</strong> ${safe(email.email_add)}</p>

        <hr><h3>🚨 Emergency Contact</h3>
        <p><strong>Contact Name:</strong> ${safe(emergency.em_name)}</p>
        <p><strong>Contact Number:</strong> ${safe(emergency.em_telno)}</p>

        <hr><h3>💼 Previous Employment</h3>
        <p><strong>Company:</strong> ${safe(pemp.pe_comp)}</p>
        <p><strong>Position:</strong> ${safe(pemp.pe_pos)}</p>
        <p><strong>Reason for Leaving:</strong> ${safe(pemp.pe_rison)}</p>

        <hr><h3>💰 Account Numbers.</h3>
        <p><strong>Bank Account No.:</strong> ${safe(compensation.comp_bank)}</p>
        <p><strong>TIN:</strong> ${safe(personal.pi_tin)}</p>
        <p><strong>SSS No.:</strong> ${safe(personal.pi_sssno)}</p>
        <p><strong>Pagibig No.:</strong> ${safe(personal.pi_pagibig)}</p>
        <p><strong>PHIC No.:</strong> ${safe(personal.pi_philhealth)}</p>
    `;
        modal.style.display = "block";
    }

    if (closeModalBtn) closeModalBtn.onclick = () => (modal.style.display = "none");

    if (printProfileBtn) {
        printProfileBtn.addEventListener("click", async () => {
            const { jsPDF } = window.jspdf;
            if (!modalDetails) return;

            // Create a new PDF document
            const pdf = new jsPDF("p", "pt", "a4");

            // Add title
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(16);
            pdf.text("Personnel 201 File", 40, 40);
            pdf.setFontSize(11);
            pdf.text("Employee Profile Summary", 40, 60);

            // Convert HTML to PDF
            await pdf.html(modalDetails, {
                x: 40,
                y: 80,
                width: 520, // Adjust width for layout
                windowWidth: 900,
                autoPaging: "text",
                html2canvas: {
                    scale: 0.8, // Lower for faster render
                    useCORS: true,
                },
                callback: function (doc) {
                    const filename = `Personnel_${new Date().toISOString().split("T")[0]}.pdf`;
                    doc.save(filename);
                },
            });
        });
    }

    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = "none";
    };
});