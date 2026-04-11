import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Student from "../models/Student";
import Teacher from "../models/Teacher";
import Parent from "../models/Parent";
import Class from "../models/Class";
import Subject from "../models/Subject";
import Mark from "../models/Mark";
import Attendance from "../models/Attendance";
import Notice from "../models/Notice";
import ActivityLog from "../models/ActivityLog";

dotenv.config();

const nepaliFirstNamesMale = ["Aayush", "Bishal", "Chaitanya", "Deepak", "Eshaan", "Gaurav", "Hari", "Indra", "Jeevan", "Kiran", "Laxman", "Manish", "Niranjan", "Om", "Prabhat", "Ramesh", "Sanjiv", "Tenzing", "Umesh", "Vivek"];
const nepaliFirstNamesFemale = ["Aasha", "Bimala", "Chandra", "Deepa", "Eshani", "Gita", "Hira", "Indu", "Janaki", "Kamala", "Laxmi", "Maya", "Nirmala", "Oshin", "Pramila", "Radha", "Sita", "Tara", "Uma", "Vidhya"];
const nepaliLastNames = ["Adhikari", "Basnet", "Chhetri", "Dahal", "Gurung", "Karki", "Lama", "Magar", "Nepal", "Oli", "Pandey", "Rai", "Shrestha", "Tamang", "Upadhyay", "Verma", "Yadav", "Paudel", "Gautam", "Thapa"];

const classesX = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const sectionsX = ["A", "B"];
const subjectsList = [
  { name: "Mathematics", code: "MATH", subtopics: ["Algebra", "Geometry", "Trigonometry"] },
  { name: "Science", code: "SCI", subtopics: ["Physics", "Chemistry", "Biology"] },
  { name: "English", code: "ENG", subtopics: ["Grammar", "Literature"] },
  { name: "Nepali", code: "NEP", subtopics: ["Vyakaran", "Sahitya"] },
  { name: "Social Studies", code: "SOC", subtopics: ["History", "Geography"] },
  { name: "Computer Science", code: "COMP", subtopics: ["Programming", "Database"] }
];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomName = (isMale: boolean = true) => `${getRandom(isMale ? nepaliFirstNamesMale : nepaliFirstNamesFemale)} ${getRandom(nepaliLastNames)}`;
const hashPassword = (pwd: string) => bcrypt.hash(pwd, 10);

const seedDatabase = async () => {
  try {
    console.log("🚀 Starting Core Seeding...");
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ MongoDB Connected");

    console.log("🧹 Wiping collections...");
    await Promise.all([User.deleteMany({}), Student.deleteMany({}), Teacher.deleteMany({}), Parent.deleteMany({}), Class.deleteMany({}), Subject.deleteMany({}), Mark.deleteMany({}), Attendance.deleteMany({}), Notice.deleteMany({}), ActivityLog.deleteMany({})]);

    const password = await hashPassword("password123");

    // 1. Admin
    const admin = await User.create({ name: "Manish Shrestha", email: "admin@school.com", password, role: "admin", status: "active" });

    // 2. Teachers
    const teacherUsers = await User.insertMany(Array.from({ length: 12 }).map((_, i) => ({
      name: getRandomName(), email: `teacher${i+1}@school.com`, password, role: "teacher", status: "active"
    })));
    await Teacher.insertMany(teacherUsers.map((u, i) => ({
      userId: u._id, employeeId: `TCH${2025000 + i}`, qualification: "Masters", specialization: [getRandom(subjectsList).name], phone: `9841${100000+i}`, address: "Kathmandu"
    })));

    // 3. Students & Parents (RESTORING RECORDS)
    console.log("📦 Restoring Parent & Student Records...");
    const sUsers = [];
    const pUsers = [];
    for (let i = 0; i < 40; i++) {
        const isMale = Math.random() > 0.5;
        sUsers.push({ name: getRandomName(isMale), email: `student${i+1}@school.com`, password, role: "student", status: "active" });
        pUsers.push({ name: getRandomName(true), email: `p${i+1}@test.com`, password, role: "parent", status: "active" });
    }
    const createdStudentUsers = await User.insertMany(sUsers);
    const createdParentUsers = await User.insertMany(pUsers);

    const studentProfiles = [];
    const parentProfiles = [];

    for (let i = 0; i < createdStudentUsers.length; i++) {
        const cName = classesX[i % classesX.length];
        const sName = sectionsX[Math.floor(i / classesX.length) % sectionsX.length];
        
        const sProf = await Student.create({
            userId: createdStudentUsers[i]._id,
            rollNumber: `${cName.split(' ')[1]}${sName}${100 + i}`,
            class: cName,
            section: sName,
            parentName: createdParentUsers[i].name,
            parentPhone: `9810${100000 + i}`,
            admissionDate: new Date(2023, 0, 1),
            address: "Lalitpur",
            dateOfBirth: new Date(2008, 1, 1)
        });
        studentProfiles.push(sProf);

        const pProf = await Parent.create({
            userId: createdParentUsers[i]._id,
            children: [sProf._id], // LINKED
            phone: `9810${100000 + i}`,
            address: "Lalitpur",
            occupation: "Business"
        });
        parentProfiles.push(pProf);
    }
    console.log(`✅ ${studentProfiles.length} students & ${parentProfiles.length} parents restored.`);

    // 4. Subjects (Corrected to Section-Specific)
    const sData = [];
    for (const cls of classesX) {
        for (const sec of sectionsX) {
            for (const sub of subjectsList) {
                sData.push({ 
                    name: sub.name, 
                    code: `${sub.code}-${cls.split(' ')[1]}-${sec}`, 
                    class: cls, 
                    section: sec,
                    teacherId: teacherUsers[Math.floor(Math.random() * teacherUsers.length)]._id, 
                    fullMarks: 100, 
                    passMarks: 40, 
                    subtopics: sub.subtopics 
                });
            }
        }
    }
    const createdSubjects = await Subject.insertMany(sData);

    // 5. Classes (LINKING)
    for (const cN of classesX) {
        for (const sN of sectionsX) {
            const cStuds = studentProfiles.filter(s => s.class === cN && s.section === sN);
            const cSubs = createdSubjects.filter(sub => sub.class === cN && sub.section === sN);
            if (cStuds.length > 0) {
                await Class.create({ 
                    name: cN, 
                    section: sN, 
                    academicYear: "2025", 
                    classTeacher: teacherUsers[Math.floor(Math.random() * teacherUsers.length)]._id, 
                    students: cStuds.map(s => s._id), 
                    subjects: cSubs.map(s => s._id) 
                });
            }
        }
    }

    // 6. Dynamic Scholastic History
    console.log("📊 Generating Analytical History...");
    const marksFinal = [];
    const attendanceFinal = [];
    for (const s of studentProfiles) {
        const attRate = 0.6 + (Math.random() * 0.35); // 60-95%
        for (let month = 2; month <= 5; month++) {
            for (let d = 1; d <= 20; d++) {
                const date = new Date(2025, month, d);
                if (date.getDay() === 6 || date.getDay() === 0) continue;
                attendanceFinal.push({ studentId: s._id, date, status: Math.random() < attRate ? "present" : "absent", markedBy: teacherUsers[0]._id });
            }
        }

        const terms = ["First Term", "Second Term", "Final"];
        for (const term of terms) {
            const tIdx = terms.indexOf(term);
            const subSet = createdSubjects.filter(sub => sub.class === s.class && sub.section === s.section);
            for (const sub of subSet) {
                let base = 55 + (Math.random() * 35);
                if (attRate < 0.75) base -= 15;
                const mObt = Math.floor(Math.max(20, Math.min(100, base + (tIdx * 5))));
                
                // Topic Breakdown Generation
                const subtopics = sub.subtopics || [];
                const topicBreakdown = [];
                if (subtopics.length > 0) {
                    let remainingMarks = mObt;
                    const perTopicMax = 100 / subtopics.length;
                    
                    for (let i = 0; i < subtopics.length; i++) {
                        const isLast = i === subtopics.length - 1;
                        let topicMarks;
                        
                        if (isLast) {
                            topicMarks = remainingMarks;
                        } else {
                            // Randomly allocate marks proportional to total
                            const maxPossible = Math.min(remainingMarks, perTopicMax);
                            const minPossible = Math.max(0, remainingMarks - (subtopics.length - 1 - i) * perTopicMax);
                            topicMarks = Math.floor(minPossible + Math.random() * (maxPossible - minPossible));
                        }
                        
                        topicBreakdown.push({
                            topicName: subtopics[i],
                            marksObtained: topicMarks,
                            totalMarks: Math.floor(perTopicMax)
                        });
                        remainingMarks -= topicMarks;
                    }
                }

                marksFinal.push({
                    studentId: s._id,
                    subjectId: sub._id,
                    marksObtained: mObt,
                    totalMarks: 100,
                    term: term,
                    year: 2025,
                    examType: term === "Final" ? "Final Board" : "Mid Term",
                    grade: mObt >= 85 ? "A+" : mObt >= 70 ? "A" : mObt >= 50 ? "B" : "C",
                    topicWise: topicBreakdown, // Added topic breakdown
                    createdAt: new Date(2025, 2 + (tIdx * 3), 15)
                });
            }
        }
    }
    await Mark.insertMany(marksFinal);
    await Attendance.insertMany(attendanceFinal);
    console.log("🏁 SEEDING SUCCESSFUL!");
    process.exit(0);
  } catch (err: any) { console.error("❌ Fatal:", err.message); process.exit(1); }
};

seedDatabase();