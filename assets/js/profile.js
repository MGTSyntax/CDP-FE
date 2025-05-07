// profile.js - Loads user info and shows in the navbar

document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.querySelector('#welcomeMessage');

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo) {
        console.error("No user data found in local storage.");
        return;
    }
    
    if (userInfo && userInfo.firstName && userInfo.userLevel === 'admin') {
        welcomeMessage.textContent = `Hi Admin ${userInfo.firstName}!`;
    } else if (userInfo && userInfo.firstName && userInfo.userLevel === 'supervisor') {
        welcomeMessage.textContent = `Hi Supervisor ${userInfo.firstName}!`;
    } else {
        welcomeMessage.textContent = `Hi User ${userInfo.firstName}!`;
    }
});

// Logout Functionality
document.querySelector('#logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/pages/login.html';
});