const fs = require('fs');
const path = require('path');

function fixFiles() {
    // 1. Fix Login.tsx
    const loginPath = 'src/pages/Auth/Login.tsx';
    if(fs.existsSync(loginPath)) {
        let content = fs.readFileSync(loginPath, 'utf8');
        content = content.replace(/import { useNavigate } from 'react-router-dom';/, "import React, { useState } from 'react';\nimport { useNavigate } from 'react-router-dom';");
        fs.writeFileSync(loginPath, content);
        console.log('Fixed Login.tsx');
    }

    // 2. Fix Register.tsx
    const registerPath = 'src/pages/Auth/Register.tsx';
    if(fs.existsSync(registerPath)) {
        let content = fs.readFileSync(registerPath, 'utf8');
        content = content.replace(/import { useNavigate, Link }/g, "import { useNavigate }");
        fs.writeFileSync(registerPath, content);
        console.log('Fixed Register.tsx');
    }

    // 3. Fix Analytics.tsx
    const analyticsPath = 'src/pages/Dashboards/Analytics.tsx';
    if(fs.existsSync(analyticsPath)) {
        let content = fs.readFileSync(analyticsPath, 'utf8');
        content = content.replace(/  const \[subjectAnalysis,  setSubjectAnalysis\]  = useState<any>\(null\);\n/g, "");
        content = content.replace(/setSubjectAnalysis\(comp\.data\.subjectAnalysis\); /g, "");
        content = content.replace(/ setSubjectAnalysis\(null\);/g, "");
        fs.writeFileSync(analyticsPath, content);
        console.log('Fixed Analytics.tsx');
    }

    // 4. Fix ActivityLogs.tsx
    const logsPath = 'src/pages/Dashboards/ActivityLogs.tsx';
    if(fs.existsSync(logsPath)) {
        let content = fs.readFileSync(logsPath, 'utf8');
        content = content.replace(/case 'auth': return ;/g, "case 'auth': return null;");
        content = content.replace(/case 'user_management': return ;/g, "case 'user_management': return null;");
        content = content.replace(/case 'academic': return ;/g, "case 'academic': return null;");
        content = content.replace(/case 'finance': return ;/g, "case 'finance': return null;");
        content = content.replace(/default: return ;/g, "default: return null;");
        fs.writeFileSync(logsPath, content);
        console.log('Fixed ActivityLogs.tsx');
    }

    // 5. Fix StudentAttendance.tsx
    const attPath = 'src/pages/Dashboards/StudentAttendance.tsx';
    if(fs.existsSync(attPath)) {
        let content = fs.readFileSync(attPath, 'utf8');
        content = content.replace(/const \[loading, setLoading\] = useState\(true\);\n/g, "");
        content = content.replace(/return ;/g, "return null;");
        fs.writeFileSync(attPath, content);
        console.log('Fixed StudentAttendance.tsx');
    }

    // 6. Fix AdminDashboard.tsx
    const adminPath = 'src/pages/Dashboards/AdminDashboard.tsx';
    if(fs.existsSync(adminPath)) {
        let content = fs.readFileSync(adminPath, 'utf8');
        content = content.replace(/  const chartOptions = {[^}]+};/g, "");
        fs.writeFileSync(adminPath, content);
        console.log('Fixed AdminDashboard.tsx');
    }
}

fixFiles();
