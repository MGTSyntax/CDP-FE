// /assets/js/documents.js
import { API_BASE_URL, getDocuments, uploadDocument, deleteDocument } from './api.js';

let activeDepartment = "ANL";
const selectedDb = localStorage.getItem("selectedDb") || "file_metadata";
let documents = [];

const departmentList = document.querySelector(".department-list");
const documentList = document.getElementById("document-list");
const uploadBtn = document.getElementById("uploadBtn");
const docsUpload = document.getElementById("docsUpload");
const breadcrumb = document.querySelector(".documents-breadcrumb");
const uploadBox = document.querySelector(".upload-box");

const allowedPermissions = {
    ANL: ["anlmanager", "superadmin"],
    FINANCE: ["finmanager", "superadmin"],
    HR: ["hrmanager", "superadmin"],
    IT: ["itmanager", "superadmin"],
    LEGAL: ["legmanager", "superadmin"],
    OPERATIONS: ["opsmanager", "superadmin"]
}

const modal = document.getElementById("docModal");
const closeBtn = document.querySelector(".close-modal");
const openNewTabBtn = document.querySelector(".open-newtab-btn");
let currentFileUrl = null;

const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
        case "pdf": return `<i class="fa-solid fa-file-pdf" style="color:#d9534f;"></i>`;
        case "doc":
        case "docx": return `<i class="fa-solid fa-file-word" style="color:#2a62c2;"></i>`;
        case "xls":
        case "xlsx": return `<i class="fa-solid fa-file-excel" style="color:#28a745;"></i>`;
        case "png":
        case "jpg":
        case "jpeg":
        case "gif": return `<i class="fa-solid fa-file-image" style="color:#f0ad4e;"></i>`;
        case "ppt":
        case "pptx": return `<i class="fa-solid fa-file-powerpoint" style="color:#e67e22;"></i>`;
        case "txt": return `<i class="fa-solid fa-file-lines" style="color:#6c757d;"></i>`;
        default: return `<i class="fa-solid fa-file" style="color:#999;"></i>`;
    }
}

// Open modal
function openModal(doc) {
    const modalBody = modal.querySelector(".modal-body");
    currentFileUrl = `${API_BASE_URL}${doc.path}`;
    modalBody.innerHTML = getPreviewHTML(doc);
    modal.classList.add("show");
}

openNewTabBtn.onclick = () => {
    if (currentFileUrl) {
        window.open(currentFileUrl, "_blank");
    }
};

// Close modal
closeBtn.onclick = () => {
    modal.classList.remove("show");
};

modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("show");
    }
});

// Modify renderDocuments to open modal on click
function renderDocuments() {
    documentList.innerHTML = "";
    if (!documents || documents.length === 0) {
        documentList.innerHTML = `<p class="no-docs">No documents available for ${activeDepartment}</p>`;
        return;
    }

    const allowedRoles = (allowedPermissions[activeDepartment.toUpperCase()] || []).map(r => r.toLowerCase());

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

        // View handler
        div.querySelector(".preview-btn").addEventListener("click", () => {
            openModal(doc)
        });

        // Delete button (only if present)
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

function getPreviewHTML(doc) {
    const ext = doc.filename.split('.').pop().toLowerCase();
    const fileUrl = `${API_BASE_URL}${doc.path}`;

    if (["pdf"].includes(ext)) {
        return `<iframe src="${fileUrl}" class="doc-preview-frame pdf"></iframe>`;
    }
    if (["png","jpg","jpeg"].includes(ext)) {
        return `<img src="${fileUrl}" alt="${doc.filename}" class="doc-preview-img">`;
    }
    if (["txt"].includes(ext)) {
        return `<iframe src="${fileUrl}" class="doc-preview-frame txt"></iframe>`;
    }
    return `<p class="doc-preview-fallback">Preview not available. <a href="${fileUrl}" target="_blank">Open file</a></p>`;
}

// Load documents from backend
async function loadDocuments() {
    try {
        documents = await getDocuments(activeDepartment, selectedDb);
        renderDocuments();
        breadcrumb.textContent = `${activeDepartment} > ${new Date().getFullYear()}`;

        const allowedRoles = (allowedPermissions[activeDepartment.toUpperCase()] || []).map(r => r.toLowerCase());

        if (allowedRoles.includes(userInfo.userLevel?.toLowerCase())) {
            uploadBox.style.display = "block";
        }  else {
            uploadBox.style.display = "none";
        }
    } catch (err) {
        console.error("Failed to load documents:", err);
        documentList.innerHTML = `<p class="no-docs">Error loading documents.</p>`;
    }
}

// Switch department
departmentList.querySelectorAll("li").forEach((li) => {
    li.addEventListener("click", () => {
        document.querySelector(".department-list li.active")?.classList.remove("active");
        li.classList.add("active");
        activeDepartment = li.dataset.dept;
        loadDocuments();
    });
});

uploadBtn.addEventListener("click", () => docsUpload.click());

docsUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        await uploadDocument(activeDepartment, file, selectedDb);
        loadDocuments();
    } catch (err) {
        alert('Upload failed: ' + err.message);
    } finally {
        docsUpload.value = '';
    }
});

// Initial load
loadDocuments();