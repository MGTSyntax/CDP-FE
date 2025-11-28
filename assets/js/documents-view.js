// /assets/js/documents-view.js
import { API_BASE_URL, getDocuments, getCategories, getDepartmentFolderList } from './api.js';
import { updateBreadcrumb } from './statics/navbar.js';

const selectedDb = localStorage.getItem("selectedDb") || "file_metadata";
const departmentList = document.querySelector(".department-list");
const documentList = document.getElementById("document-list");
let activeDepartment = null;
let activeCategory = null;
let documents = [];
let currentFileUrl = null;

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

const modal = document.getElementById("docModal");
const openNewTabBtn = document.querySelector(".open-newtab-btn");
const closeBtn = document.querySelector(".close-modal");

/* -------------------
   Modal Handlers
------------------- */
function openModal(doc) {
    const modalBody = modal.querySelector(".modal-body");
    currentFileUrl = `${API_BASE_URL}${doc.path}`;
    modalBody.innerHTML = getPreviewHTML(doc);
    modal.classList.add("show");
}

openNewTabBtn.onclick = () => (currentFileUrl) && window.open(currentFileUrl, "_blank");
closeBtn.onclick = () => modal.classList.remove("show");
modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("show"); });

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
                const isAlreadyExpanded = parent.classList.contains("expanded");

                departmentList.querySelectorAll(".department-item").forEach(item => {
                    item.classList.remove("expanded");
                });

                if (!isAlreadyExpanded) {
                    parent.classList.add("expanded");
                }

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

/* -------------------
   Documents
------------------- */
function getPreviewHTML(doc) {
    const ext = doc.filename.split('.').pop().toLowerCase();
    const fileUrl = `${API_BASE_URL}${doc.path}`;
    if (ext === "pdf") return `<iframe src="${fileUrl}" class="doc-preview-frame pdf"></iframe>`;
    if (["png","jpg","jpeg"].includes(ext)) return `<img src="${fileUrl}" alt="${doc.filename}" class="doc-preview-img">`;
    if (ext === "txt") return `<iframe src="${fileUrl}" class="doc-preview-frame txt"></iframe>`;
    return `<p>Preview not available. <a href="${fileUrl}" target="_blank">Open file</a></p>`;
}

async function loadDocuments() {
    try {
        documents = await getDocuments(activeDepartment, selectedDb, activeCategory);

        documentList.innerHTML = "";
        if (!documents || documents.length === 0) {
            documentList.innerHTML = `<p class="no-docs">No documents available for ${activeDepartment} - ${activeCategory}</p>`;
            return;
        }

        documents.forEach((doc) => {
            const div = document.createElement("div");
            div.classList.add("document-item");
            div.innerHTML = `
            <div class="doc-header">
                <div class="file-info">
                    ${getFileIcon(doc.filename)}
                    <span class="filename">${doc.filename}</span>
                </div>
                <div class="actions">
                    <button class="preview-btn" aria-label="Preview Document">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
            documentList.appendChild(div);

            // Preview
            div.querySelector(".preview-btn").addEventListener("click", () => openModal(doc));
        });
    } catch (err) {
        console.error("Failed to load documents:", err);
        documentList.innerHTML = `<p class="no-docs">Error loading documents.</p>`;
    }
}

loadDepartmentFolders();
documentList.innerHTML = `<p class="no-docs">Select a department to view documents.</p>`;
// uploadBox.style.display = "none";