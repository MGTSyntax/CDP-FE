// /assets/js/dashboard.js
import { getEmpProfile } from "./api.js";

document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

    // Get top profile record
    loadProfile();

    if (track) {
        const scrollAmount = 250;

        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        setInterval(() => {
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            if (track.scrollLeft + track.clientWidth >= track.scrollWidth) {
                track.scrollTo({ left: 0, behavior: 'smooth' });
            }
        }, 5000);
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