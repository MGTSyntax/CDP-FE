// /assets/js/statics/header.js
import { renderNav } from "./navbar.js";

document.addEventListener('DOMContentLoaded', async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    if (!userInfo || !userInfo.username) {
        window.location.href = '/pages/login.html';
        return;
    }

    try {
        const headerHtml = await fetch('/pages/partials/header.html').then(res => res.text());
        const temp = document.createElement('div');
        temp.innerHTML = headerHtml;
        document.body.insertBefore(temp, document.body.firstChild);

        await waitForElement('#navMenu');
        renderNav(userInfo);

        initHeaderFunctions(userInfo);
    } catch (err) {
        console.error("Error loading header:", err);
    }
});

async function waitForElement(selector, timeout = 3000) {
    const start = Date.now();
    while (!document.querySelector(selector)) {
        if (Date.now() - start > timeout) {
            console.error(`Element ${selector} not found after ${timeout}ms`);
            return null;
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    return document.querySelector(selector);
}

function initHeaderFunctions(userInfo) {
    // 🕒 Live Date and Time
    setInterval(() => {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        const datetimeEl = document.getElementById('datetime');
        if (datetimeEl) {
            datetimeEl.textContent = now.toLocaleString('en-US', options);
        }
    }, 1000);

    // 👤 Avatar Dropdown
    const avatarBtn = document.getElementById('avatarBtn');
    const drawer = document.getElementById('drawer');
    const closeDrawer = document.getElementById('closeDrawer');
    const signoutBtn = document.getElementById('signoutBtn');
    const drawerName = document.getElementById('drawerName');
    const drawerRole = document.getElementById('drawerRole');

    if (drawerName) drawerName.textContent = userInfo.fullName || userInfo.username;
    if (drawerRole) drawerRole.textContent = userInfo.role || userInfo.userLevel || "User";

    avatarBtn?.addEventListener('click', () => {
        drawer.classList.add('show');
    });

    closeDrawer?.addEventListener('click', () => {
        drawer.classList.remove('show');
    });

    document.addEventListener('click', (e) => {
        if (drawer.classList.contains('show') &&
            !drawer.contains(e.target) &&
            !avatarBtn.contains(e.target)) {
            drawer.classList.remove('show');
        }
    });

    signoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('userInfo');
        window.location.href = '/pages/login.html';
    });

}