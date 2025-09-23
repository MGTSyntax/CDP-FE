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

function renderDocuments() {
    documentList.innerHTML = "";
    if (!documents || documents.length === 0) {
        documentList.innerHTML = `<p class="no-docs">No documents available for ${activeDepartment}</p>`;
        return;
    }

    documents.forEach((doc) => {
        const div = document.createElement("div");
        div.classList.add("document-item");
        div.innerHTML = `
            <div class="doc-header">
                <div class="file-info">
                    ${getFileIcon(doc.filename)}
                    <span>${doc.filename}</span>
                </div>
                <div class="actions">
                    <button class="toggle-preview">
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <button class="delete-btn" data-file="${doc.filename}">Delete</button>
                </div>
            </div>
            <div class="doc-preview"></div>
        `;
        documentList.appendChild(div);

        // Toggle preview
        const toggleBtn = div.querySelector(".toggle-preview");
        const previewBox = div.querySelector(".doc-preview");

        toggleBtn.addEventListener("click", () => {
            if (!previewBox.classList.contains("open")) {
                previewBox.innerHTML = getPreviewHTML(doc);
                previewBox.classList.add("open");
                toggleBtn.innerHTML = `<i class="fa-solid fa-chevron-up"></i>`;
            } else {
                previewBox.classList.remove("open");
                setTimeout(() => {
                    previewBox.innerHTML = "";
                }, 300);
                toggleBtn.innerHTML = `<i class="fa-solid fa-chevron-down"></i>`;
            }
        });

        // Delete handler
        const deleteBtn = div.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", async () => {
            const filename = deleteBtn.dataset.file;
            try {
                await deleteDocument(activeDepartment, filename, selectedDb);
                documents = documents.filter((d) => d.filename !== filename);
                renderDocuments();
            } catch (err) {
                alert("Failed to delete file: " + err.message);
            }
        });
    });
}

function getPreviewHTML(doc) {
    const ext = doc.filename.split('.').pop().toLowerCase();
    const fileUrl = `${API_BASE_URL}${doc.path}`;

    if (["pdf"].includes(ext)) {
        return `<iframe src="${fileUrl}" width="100%" height="600px"></iframe>`;
    }
    if (["png","jpg","jpeg","gif"].includes(ext)) {
        return `<img src="${fileUrl}" alt="${doc.filename}" style="max-width:100%; border-radius:6px;">`;
    }
    if (["txt"].includes(ext)) {
        return `<iframe src="${fileUrl}" width="100%" height="300px"></iframe>`;
    }
    return `<p style="color:#666;">Preview not available. <a href="${fileUrl}" target="_blank">Open file</a></p>`;
}

// Load documents from backend
async function loadDocuments() {
    try {
        documents = await getDocuments(activeDepartment, selectedDb);
        renderDocuments();
        breadcrumb.textContent = `${activeDepartment} > ${new Date().getFullYear()}`;
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