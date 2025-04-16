// profile.js - Loads user info and shows in the navbar

document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.querySelector('#welcomeMessage');

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo) {
        console.error("No user data found in local storage.");
        return;
    }

    console.log("Stored user data:", userInfo);

    if (userInfo && userInfo.firstName) {
        welcomeMessage.textContent = `Hi ${userInfo.firstName}!`;
    } else {
        welcomeMessage.textContent = 'Dashboard';
    }
});

// Logout Functionality
document.querySelector('#logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/pages/login.html';
});