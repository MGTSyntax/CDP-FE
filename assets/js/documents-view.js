// /assets/js/documents-view.js
import { API_BASE_URL, getDocuments, getCategories, getDepartmentFolderList } from './api.js';
import { updateBreadcrumb } from './statics/navbar.js';

const selectedDb = localStorage.getItem("selectedDb") || "file_metadata";
const departmentList = document.querySelector(".department-list");
const documentList = document.getElementById("document-list");
let activeDepartment = null;
let activeCategory = null;
let documents = [];

/* -------------------
   File Icon Helper
------------------- */
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
        case "pdf": return `<i class="fa-solid fa-file-pdf" style="color:#d9534f;"></i>`;
        case "png":
        case "jpg":
        case "jpeg": return `<i class="fa-solid fa-file-image" style="color:#f0ad4e;"></i>`;
        case "txt": return `<i class="fa-solid fa-file-lines" style="color:#6c757d;"></i>`;
        default: return `<i class="fa-solid fa-file" style="color:#999;"></i>`;
    }
}

/* -------------------
   Departments and Categories
------------------- */
async function loadDepartmentFolders() {
    try {
        const departmentFolders = await getDepartmentFolderList(selectedDb);

        departmentList.innerHTML = departmentFolders.map(d => 
            `<li class="department-item" data-deptid="${d.deptid}" data-deptname="${d.deptname}">
                <div class="node-label">
                    <span>${d.deptname}</span>
                </div>
                <ul class="category-list"></ul>
            </li>`
        ).join('');

        departmentList.querySelectorAll(".node-label").forEach(label => {
            label.addEventListener("click", async () => {
                const parent = label.closest(".department-item");
                parent.classList.toggle("expanded");

                const deptId = parent.dataset.deptid;
                const deptName = parent.dataset.deptname;
                const categoryList = parent.querySelector(".category-list");

                if (!categoryList.dataset.loaded) {
                    const categories = await getCategories(deptId, selectedDb);
                    categoryList.innerHTML = categories.map(cat =>
                        `<li>
                                    <span class="category-lbl" data-cat="${cat.catname}">${cat.catname}</span>
                                </li>`
                    ).join('');
                    categoryList.dataset.loaded = "true";

                    categoryList.querySelectorAll(".category-lbl").forEach(cbtn => {
                        cbtn.addEventListener("click", () => {
                            activeDepartment = deptName;
                            activeCategory = cbtn.dataset.cat;
                            loadDocuments();
                            updateBreadcrumb(["Resources", deptName, activeCategory]);
                        });
                    });
                }
            });
        });
    } catch (err) {
        console.error("Failed to load departments:", err);
    }
}

async function loadDocuments() {
    try {
        documents = await getDocuments(activeDepartment, selectedDb, activeCategory);
        documentList.innerHTML = documents.length
          ? documents.map(doc => `
            <div class="document-item">
              ${getFileIcon(doc.filename)}
              <span class="filename">${doc.filename}</span>
              <a class="open-btn" href="${API_BASE_URL}${doc.path}" target="_blank">Open</a>
            </div>
          `).join('')
          : `<p>No documents available.</p>`;
    } catch (err) {
        console.error("Failed to load documents:", err);
        documentList.innerHTML = `<p class="no-docs">Error loading documents.</p>`;
    }
}

loadDepartmentFolders();