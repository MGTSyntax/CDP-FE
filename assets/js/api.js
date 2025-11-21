// /assets/js/api.js
export const API_BASE_URL = 'http://localhost:3100';

/* ============================
   AUTH & USER APIs
============================ */
export async function getDatabases() {
    try {
        const response = await fetch(`${API_BASE_URL}/databases`);
        if (!response.ok) throw new Error('Failed to fetch databases');
        return await response.json();
    } catch (error) {
        console.error('Error fetching databases:', error);
        return [];
    }
}

export async function loginUser(database, username, password) {
    try {
        const res = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ database, username, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        return data;
    } catch (error) {
        console.warn("Login failed:", error.message);
        return { success: false, message: error.message };

    }
}

export async function getUserInfo(db, empNo) {
    try {
        const response = await fetch(`${API_BASE_URL}/user-info?db=${db}&empNo=${empNo}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch user info');
        return data;
    } catch (error) {
        alert("Unable to load user information. Please contact admin.");
        return null;
    }
}

export async function getEmpProfile(db, empNo) {
    try {
        const response = await fetch(`${API_BASE_URL}/employee-profile?db=${db}&empNo=${empNo}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch employee profile');
        return data;
    } catch (error) {
        console.error('Error fetching employee profile:', error);
        return null;
    }
}

// Fetch Departments and Detachments
export async function getDepartments(selectedDb) {
    try {
        const response = await fetch(`${API_BASE_URL}/departments?db=${selectedDb}`);
        if (!response.ok) throw new Error('Failed to fetch departments');
        return await response.json();
    } catch (error) {
        console.error('Error fetching departments:', error);
        return [];
    }
}

// Fetch Employees
export async function getEmployees(selectedDb) {
    try {
        const response = await fetch(`${API_BASE_URL}/employees?db=${selectedDb}`);
        if (!response.ok) throw new Error('Failed to fetch employees');
        return await response.json();
    } catch (error) {
        console.error('Error fetching departments:', error);
        return [];
    }
}

// Logout API (if needed in the future)
export async function logout() {
    try {
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
        });
        console.log('Logout successfully');
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

/* ============================
   DOCUMENT MANAGEMENT APIs
============================ */
// Get documents
export async function getDocuments(department, db, category) {
    const url = new URL(`${API_BASE_URL}/documents/${department}`);
    url.searchParams.append("db", db);
    if (category) url.searchParams.append("category", category);

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch documents");
    return await response.json();
}

// Upload document
export async function uploadDocument(department, file, db, category) {
    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

    const formData = new FormData();
    formData.append("document", file);
    formData.append("department", department);
    formData.append("dbName", db);
    formData.append("uploadedBy", userInfo.empNo || "system");
    formData.append("userLevel", userInfo.userLevel || "guest");
    if (category) formData.append("category", category);

    const response = await fetch(
        `${API_BASE_URL}/upload?department=${department}&db=${db}${category ? `&category=${category}` : ""}`,
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
    }

    return data;
}

// Delete document
export async function deleteDocument(department, filename, db, category) {
    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

    const url = `${API_BASE_URL}/uploads/${encodeURIComponent(department)}/${encodeURIComponent(filename)}` 
        + (category 
            ? `?category=${encodeURIComponent(category)}&db=${encodeURIComponent(db)}`
            : `?db=${encodeURIComponent(db)}`);

    const response = await fetch(url,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userLevel: userInfo.userLevel,
                uploadedBy: userInfo.empNo
            })
        }
    );

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Delete failed');
    }

    return data;
}

// Get all department Folders
export async function getDepartmentFolderList(db) {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (!userInfo || !userInfo.userLevel) {
        throw new Error("User info is missing");
    }

    const res = await fetch(
        `${API_BASE_URL}/department-folders?db=${db}&userLevel=${userInfo.userLevel}`
    );

    if (!res.ok) throw new Error("Failed to fetch departments");

    return await res.json();
}

// Get categories for a department Folder
export async function getCategories(deptId, db) {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (!userInfo || !userInfo.userLevel) {
        throw new Error("User info is missing");
    }

    const res = await fetch(
        `${API_BASE_URL}/categories/${deptId}?db=${db}&userLevel=${userInfo.userLevel}`
    );

    if (!res.ok) throw new Error("Failed to fetch categories");

    return await res.json();
}