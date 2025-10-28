// /assets/js/employee.js
import { getDatabases, getEmployees, getEmpProfile, logout } from "./api.js";

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

    let currentEmp = null;
    let currentFullProfile = null;
    let currentFullName = "";

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
        const pemp = fullProfile.pempInfo || {};
        const compensation = fullProfile.compensationInfo || {};
        const family = fullProfile.familyInfo || {};
        const disciplinary = fullProfile.disciplinaryInfo || {};

        const safe = (val) => val || "-";
        const fullName = `${basic.ji_fname || emp.ji_fname || ""} ${basic.ji_mname || emp.ji_mname || ""} ${basic.ji_lname || emp.ji_lname || ""}`.trim();

        currentEmp = emp;
        currentFullProfile = fullProfile;
        currentFullName = fullName;

        const sections = [
            {
                title: "📋 Basic Information",
                fields: {
                    "Employee No": basic.ji_empNo || emp.ji_empNo,
                    "Full Name": fullName,
                    "Birthdate": safe(personal.pi_dbirth),
                    "Address": safe(personal.pi_add),
                    "Contact No": safe(personal.pi_tel),
                    "Nationality": safe(personal.pi_nationality),
                    "Civil Status": safe(personal.pi_cstatus)
                },
            },
            {
                title: "🏢 Job Information",
                fields: {
                    "Department": safe(job.ji_dept || emp.assignment),
                    "Detachment": safe(job.ji_sec || emp.detachment),
                    "Position": safe(job.ji_pos),
                    "Date Hired": safe(job.ji_dateHired),
                },
            },
            {
                title: "🎓 Educational Background",
                fields: {
                    "School": safe(educ.educ_school),
                    "Degree": safe(educ.educ_type),
                },
            },
            {
                title: "📧 Email Address",
                fields: {
                    "Email": safe(email.email_add),
                },
            },
            {
                title: "🚨 Emergency Contact",
                fields: {
                    "Contact Name": safe(emergency.em_name),
                    "Contact Number": safe(emergency.em_telno),
                },
            },
            {
                title: "💼 Previous Employment",
                fields: {
                    "Company": safe(pemp.pe_comp),
                    "Position": safe(pemp.pe_pos),
                    "Reason for Leaving": safe(pemp.pe_rison),
                },
            },
            {
                title: "💰 Account & Government Numbers",
                fields: {
                    "Bank Account": safe(compensation.comp_bank),
                    "TIN": safe(personal.pi_tin),
                    "SSS": safe(personal.pi_sssno),
                    "Pagibig": safe(personal.pi_pagibig),
                    "PHIC": safe(personal.pi_philhealth),
                },
            },
        ];

        modalDetails.innerHTML = sections.map((sec, i) => `
            <div class="employee-section" data-index="${i}">
                <h3>${sec.title} <i class="fa-solid fa-chevron-up"></i></h3>
                <div class="section-content">
                    ${Object.entries(sec.fields)
                .map(([label, val]) => `<p><strong>${label}:</strong> ${val}</p>`)
                .join("")}
                </div>
            </div>
        `).join("");

        modalDetails.querySelectorAll(".employee-section h3").forEach((header) => {
            header.addEventListener("click", () => {
                const section = header.parentElement;
                section.classList.toggle("collapsed");
                const icon = header.querySelector("i");
                icon.classList.toggle("fa-chevron-up");
                icon.classList.toggle("fa-chevron-down");
            });
        });

        modal.style.display = "block";
    }

    if (closeModalBtn) closeModalBtn.onclick = () => (modal.style.display = "none");

    if (printProfileBtn) {
        printProfileBtn.addEventListener("click", async () => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF("p", "pt", "a4");

            // A4 dimensions
            const margin = 50;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const contentWidth = pageWidth - margin * 2;

            const basic = currentFullProfile.basicInfo || {};
            const personal = currentFullProfile.personalInfo || {};
            const job = currentFullProfile.jobInfo || {};
            const educ = currentFullProfile.educInfo || {};
            const email = currentFullProfile.emailaddInfo || {};
            const emergency = currentFullProfile.emergencyInfo || {};
            const pemp = currentFullProfile.pempInfo || {};
            const compensation = currentFullProfile.compensationInfo || {};

            const empNo = basic.ji_empNo || currentEmp.ji_empNo || "-";
            const fullName = `${basic.ji_fname || ""} ${basic.ji_mname || ""} ${basic.ji_lname || ""}`.trim();

            let y = margin;

            // try {
            //     const logo = await fetch("/assets/images/mibLogo.png").then(res => res.blob());
            //     const reader = new FileReader();
            //     const logoData = await new Promise((resolve) => {
            //         reader.onload = () => resolve(reader.result);
            //         reader.readAsDataURL(logo);
            //     });
            //     pdf.addImage(logoData, "PNG", 40, 30, 60, 60);
            // } catch {
            //     console.warn("Logo not found or cannot be loaded.");
            // }

            // --- HEADER SECTION ---
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(18);
            pdf.text("Employee 201 File", margin, y);
            y += 16;
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            pdf.text("Confidential HR Document", margin, y);
            y += 25;

            // --- SUMMARY BOX ---
            pdf.setLineWidth(0.3);
            pdf.roundedRect(margin, y, contentWidth, 55, 4, 4);
            pdf.setFont("helvetica", "bold");
            pdf.text("Name:", margin + 10, y + 20);
            pdf.text("Employee No:", margin + 10, y + 40);

            pdf.setFont("helvetica", "normal");
            pdf.text(fullName, margin + 100, y + 20, { maxWidth: contentWidth - 120 });
            pdf.text(empNo, margin + 100, y + 40);
            y += 80;

            // --- SECTION GENERATOR ---
            const addSection = (title, fields) => {
                if (y + 80 > pageHeight - margin) {
                    pdf.addPage();
                    y = margin;
                }

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(13);
                pdf.text(title, margin, y);
                y += 8;
                pdf.setDrawColor(100);
                pdf.setLineWidth(0.5);
                pdf.line(margin, y, pageWidth - margin, y);
                y += 15;

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(11);

                const labelWidth = 130;
                const valueStart = margin + labelWidth + 10;
                const lineHeight = 14;
                const maxTextWidth = contentWidth - labelWidth - 20;

                for (const [label, value] of Object.entries(fields)) {
                    const wrapped = pdf.splitTextToSize(value || "-", maxTextWidth);
                    pdf.setFont("helvetica", "bold");
                    pdf.text(`${label}:`, margin + 10, y);
                    pdf.setFont("helvetica", "normal");
                    pdf.text(wrapped, valueStart, y);
                    y += wrapped.length * lineHeight + 3;
                    if (y > pageHeight - margin) {
                        pdf.addPage();
                        y = margin;
                    }
                }
                y += 14; // space before next section
            };

            // --- CONTENT SECTIONS ---
            addSection("Basic Information", {
                "Birthdate": personal.pi_dbirth,
                "Address": personal.pi_add,
                "Contact No": personal.pi_tel,
                "Civil Status": personal.pi_cstatus,
            });

            addSection("Job Information", {
                "Department": job.ji_dept,
                "Detachment": job.ji_sec,
                "Position": job.ji_pos,
                "Date Hired": job.ji_dateHired,
            });

            addSection("Educational Background", {
                "School": educ.educ_school,
                "Degree": educ.educ_type,
            });

            addSection("Email Address", {
                "Email": email.email_add,
            });

            addSection("Emergency Contact", {
                "Contact Name": emergency.em_name,
                "Contact Number": emergency.em_telno,
            });

            addSection("Previous Employment", {
                "Company": pemp.pe_comp,
                "Position": pemp.pe_pos,
                "Reason for Leaving": pemp.pe_rison,
            });

            addSection("Account & Government Numbers", {
                "Bank Account": compensation.comp_bank,
                "TIN": personal.pi_tin,
                "SSS": personal.pi_sssno,
                "Pagibig": personal.pi_pagibig,
                "PhilHealth": personal.pi_philhealth,
            });

            // --- FOOTER ---
            pdf.setFontSize(9);
            pdf.setTextColor(130);
            pdf.text(
                `Generated on ${new Date().toLocaleDateString()} — HR Information System`,
                margin,
                pageHeight - 30
            );

            // --- SAVE FILE ---
            pdf.save(`${fullName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
        });
    }

    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = "none";
    };
});