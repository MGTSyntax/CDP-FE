// /assets/js/documents-admin.js
import { API_BASE_URL, uploadDocument, deleteDocument, getDocuments, getCategories, getDepartmentFolderList } from './api.js';
import { updateBreadcrumb } from './statics/navbar.js';

const departmentList = document.querySelector(".department-list");
const documentList = document.getElementById("document-list");
const uploadBtn = document.getElementById("uploadBtn");
const docsUpload = document.getElementById("docsUpload");
const uploadBox = document.querySelector(".upload-box");
const modal = document.getElementById("docModal");
const closeBtn = document.querySelector(".close-modal");
const openNewTabBtn = document.querySelector(".open-newtab-btn");
const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
const selectedDb = userInfo.database || "file_metadata";

const allowedPermissions = {
    ANL: ["anlmanager", "superadmin"],
    FINANCE: ["finmanager", "superadmin"],
    HR: ["hrmanager", "superadmin"],
    IT: ["itmanager", "superadmin"],
    LEGAL: ["legmanager", "superadmin"],
    OPERATIONS: ["opsmanager", "superadmin"]
};

let activeDepartment = null;
let activeCategory = null;
let currentFileUrl = null;
let documents = [];

/* -------------------
   Access Restriction
------------------- */
const allowedUserRoles = ["superadmin", "hrmanager", "finmanager", "itmanager", "opsmanager", "legmanager"];
if (!allowedUserRoles.includes(userInfo.userLevel?.toLowerCase())) {
  alert("Access denied. Redirecting to documents page.");
  window.location.href = "/pages/documents.html";
}

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
   Departments + Categories
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

        departmentList.querySelectorAll(".node-label").forEach(label  => {
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
        renderDocuments();

        const allowedRoles = (allowedPermissions?.[activeDepartment?.toUpperCase()] ?? []).map(r => r.toLowerCase());
        uploadBox.style.display = allowedRoles.includes(userInfo.userLevel?.toLowerCase()) ? "block" : "none";

    } catch (err) {
        console.error("Failed to load documents:", err);
        documentList.innerHTML = `<p class="no-docs">Error loading documents.</p>`;
    }
}

function renderDocuments() {
    documentList.innerHTML = "";
    if (!documents || documents.length === 0) {
        documentList.innerHTML = `<p class="no-docs">No documents available for ${activeDepartment}</p>`;
        return;
    }

    const allowedRoles = (allowedPermissions?.[activeDepartment?.toUpperCase()] ?? []).map(r => r.toLowerCase());

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
                    ${allowedRoles.includes(userInfo.userLevel?.toLowerCase())
                ? `<button class="delete-btn" data-file="${doc.filename}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>` : ""
            }
                </div>
            </div>
        `;
        documentList.appendChild(div);

        // Preview
        div.querySelector(".preview-btn").addEventListener("click", () => openModal(doc));

        // Delete
        const deleteBtn = div.querySelector(".delete-btn");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", async () => {
                const filename = deleteBtn.dataset.file;
                if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

                try {
                    await deleteDocument(activeDepartment, filename, selectedDb);
                    div.remove();
                    documents = documents.filter((d) => d.filename !== filename);
                    renderDocuments();
                } catch (err) {
                    alert("Failed to delete file: " + err.message);
                }
            });
        }
    });
}

/* -------------------
   Upload
------------------- */
uploadBtn.addEventListener("click", () => docsUpload.click());
docsUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        await uploadDocument(activeDepartment, file, userInfo?.database, activeCategory);
        loadDocuments();
    } catch (err) {
        alert('Upload failed: ' + err.message);
    } finally {
        docsUpload.value = '';
    }
});

/* -------------------
   Init
------------------- */
loadDepartmentFolders();