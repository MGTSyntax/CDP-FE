// /assets/js/profile.js
import { renderNav } from "./statics/navbar.js";
import { getEmpProfile } from "./api.js";

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
});

async function loadProfile() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) return;

    const profile = await getEmpProfile(userInfo.database, userInfo.empNo);

    if (!profile || !profile.basicInfo) {
        console.error('Failed to load profile data.');
        return;
    }

    // Basic Info
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

    // Email Address
    const eaEmailAdd = document.getElementById("email_add");
    if (eaEmailAdd) eaEmailAdd.textContent = profile.emailaddInfo.email_add || '';
    
    // Personal Info
    const piAddress = document.getElementById("pi_add");
    if (piAddress) piAddress.textContent = profile.personalInfo.pi_add || '';

    const piContactNo = document.getElementById("pi_tel");
    if (piContactNo) piContactNo.textContent = profile.personalInfo.pi_tel || '';

    const piNationality = document.getElementById("pi_nationality");
    if (piNationality) piNationality.textContent = profile.personalInfo.pi_nationality || '';

    const piSex = document.getElementById("pi_sex");
    if (piSex) piSex.textContent = profile.personalInfo.pi_sex || '';

    const piCStatus = document.getElementById("pi_cstatus");
    if (piCStatus) piCStatus.textContent = profile.personalInfo.pi_cstatus || '';

    const piBirthdate = document.getElementById("pi_dbirth");
    if (piBirthdate) piBirthdate.textContent = profile.personalInfo.pi_dbirth || '';

    const piReligion = document.getElementById("pi_religion");
    if (piReligion) piReligion.textContent = profile.personalInfo.pi_religion || '';

    const piSSSNo = document.getElementById("pi_sssno");
    if (piSSSNo) piSSSNo.textContent = profile.personalInfo.pi_sssno || '';

    const piTIN = document.getElementById("pi_tin");
    if (piTIN) piTIN.textContent = profile.personalInfo.pi_tin || '';

    const piPHIC = document.getElementById("pi_philhealth");
    if (piPHIC) piPHIC.textContent = profile.personalInfo.pi_philhealth || '';

    const piPagibig = document.getElementById("pi_pagibig");
    if (piPagibig) piPagibig.textContent = profile.personalInfo.pi_pagibig || '';

    // Job Info
    const jiDepartment = document.getElementById("ji_dept");
    if (jiDepartment) jiDepartment.textContent = profile.jobInfo.ji_dept || '';

    const jiClient = document.getElementById("ji_sec");
    if (jiClient) jiClient.textContent = profile.jobInfo.ji_sec || '';

    const jiPosition = document.getElementById("ji_pos");
    if (jiPosition) jiPosition.textContent = profile.jobInfo.ji_pos || '';

    const jiJobStatus = document.getElementById("ji_jobStat");
    if (jiJobStatus) jiJobStatus.textContent = profile.jobInfo.ji_jobStat || '';

    const jiDateHired = document.getElementById("ji_dateHired");
    if (jiDateHired) jiDateHired.textContent = profile.jobInfo.ji_dateHired || '';
}