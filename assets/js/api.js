// Centralized API Handling

const API_BASE_URL = 'http://localhost:3100';

// Fetch Databases
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

// Perform Login Request
export async function loginUser(database, username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ database, username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }
        return await response.json(); // Token or success response
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
}

// Get User Info by Employee No.
export async function getUserInfo(db, empNo) {
    try {
        const response = await fetch(`${API_BASE_URL}/user-info?db=${db}&empNo=${empNo}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch user info');
        }
        return data;
    } catch (error) {
        console.error('Error fetching user info:', error);
        return null;
    }
}

// Fetch complete employee profile by employee number
export async function getEmployeeProfile(db, empNo) {
    try {
        const response = await fetch(`${API_BASE_URL}/employee-profile?db=${db}&empNo=${empNo}`);
        const empProfdata = await response.json();
        if (!response.ok) {
            throw new Error(empProfdata.error || 'Failed to fetch employee profile');
        }
        return empProfdata;
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