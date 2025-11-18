// /assets/js/dashboard.js
import { getEmpProfile } from "./api.js";

document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');

    // Get top profile record
    loadProfile();

    if (track) {
        const cards = Array.from(track.children);
        const cardWidth = cards[0].offsetWidth + 24;
        let autoScroll;

        // Clone cards
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            track.appendChild(clone);
        });

        function startAutoScroll() {
            autoScroll = setInterval(() => {
                track.scrollLeft += 2;

                if (track.scrollLeft >= track.scrollWidth / 2) {
                    track.scrollLeft = 0;
                }
            }, 40);
        }

        function stopAutoScroll() {
            clearInterval(autoScroll);
        }

        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });

        track.addEventListener('mouseenter', stopAutoScroll);
        track.addEventListener('mouseleave', stopAutoScroll);
        
        startAutoScroll();
    }
});

async function loadProfile() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) return;

    try {
        const profile = await getEmpProfile(userInfo.database, userInfo.empNo);
        if (!profile || !profile.basicInfo) throw new Error("No profile data");

        if (profile && profile.basicInfo) {
            const basicInfoENum = document.getElementById("bi_empNo");
            if (basicInfoENum) basicInfoENum.textContent = profile.basicInfo.ji_empNo || '';

            const biFullName = document.getElementById("bi_fullname");
            if (biFullName) {
                const lname = profile.basicInfo.ji_lname || '';
                const extname = profile.basicInfo.ji_extname ? `${profile.basicInfo.ji_extname}` : '';
                const fname = profile.basicInfo.ji_fname || '';
                const mname = profile.basicInfo.ji_mname ? ` ${profile.basicInfo.ji_mname}` : '';

                biFullName.textContent = `${lname}${extname}, ${fname}${mname}`;
            }

            const eaEmailAdd = document.getElementById("email_add");
            if (eaEmailAdd) eaEmailAdd.textContent = profile.emailaddInfo.email_add || '';

            const jiPosition = document.getElementById("ji_pos");
            if (jiPosition) jiPosition.textContent = profile.jobInfo.ji_pos || '';
        }
    } catch (error) {
        console.error("Failed to load profile", error);
        document.getElementById("bi_fullname").textContent = "Profile Unavailable";
    }
}