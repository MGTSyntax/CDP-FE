// /assets/js/documents.js
import { API_BASE_URL, getDocuments, uploadDocument, deleteDocument } from './api.js';

let activeDepartment = "AnL";
const selectedDb = localStorage.getItem("selectedDb") || "file_metadata";
let documents = [];

const departmentList = document.querySelector(".department-list");
const documentList = document.getElementById("document-list");
const uploadBtn = document.getElementById("uploadBtn");
const docsUpload = document.getElementById("docsUpload");
const breadcrumb = document.querySelector(".documents-breadcrumb");

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
            <span>${doc.filename}</span>
            <div class="actions">
                <a href="${API_BASE_URL}${doc.path}" target="_blank">View</a>
                <button class="delete-btn" data-file="${doc.filename}">Delete</button>
            </div>
        `;
        documentList.appendChild(div);
    });

    // Add delete listeners
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const filename = btn.dataset.file;
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