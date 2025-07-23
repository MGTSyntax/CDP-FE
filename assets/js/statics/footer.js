document.addEventListener('DOMContentLoaded', () => {
    const footer = document.getElementById('footer');
    const year = new Date().getFullYear();
    if (footer) {
        footer.innerHTML = `<p>&copy; ${year} Men In Blue Security Services, Inc. - MGTorres. All rights reserved.</p>`;
    } else {
        console.warn("Footer element not found.");
    }
});