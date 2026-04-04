"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const Student_1 = __importDefault(require("../models/Student"));
const Teacher_1 = __importDefault(require("../models/Teacher"));
const Parent_1 = __importDefault(require("../models/Parent"));
const Class_1 = __importDefault(require("../models/Class"));
const Subject_1 = __importDefault(require("../models/Subject"));
const Mark_1 = __importDefault(require("../models/Mark"));
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Fee_1 = __importDefault(require("../models/Fee"));
const Notice_1 = __importDefault(require("../models/Notice"));
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
dotenv_1.default.config();
const nepaliFirstNamesMale = [
    "Aayush", "Bishal", "Chaitanya", "Deepak", "Eshaan", "Gaurav", "Hari", "Indra", "Jeevan", "Kiran",
    "Laxman", "Manish", "Niranjan", "Om", "Prabhat", "Ramesh", "Sanjiv", "Tenzing", "Umesh", "Vivek"
];
const nepaliFirstNamesFemale = [
    "Aasha", "Bimala", "Chandra", "Deepa", "Eshani", "Gita", "Hira", "Indu", "Janaki", "Kamala",
    "Laxmi", "Maya", "Nirmala", "Oshin", "Pramila", "Radha", "Sita", "Tara", "Uma", "Vidhya"
];
const nepaliLastNames = [
    "Adhikari", "Basnet", "Chhetri", "Dahal", "Gurung", "Karki", "Lama", "Magar", "Nepal", "Oli",
    "Pandey", "Rai", "Shrestha", "Tamang", "Upadhyay", "Verma", "Yadav", "Paudel", "Gautam", "Thapa"
];
const classes = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const sections = ["A", "B"];
const subjectsList = [
    { name: "Mathematics", code: "MATH" },
    { name: "Science", code: "SCI" },
    { name: "English", code: "ENG" },
    { name: "Nepali", code: "NEP" },
    { name: "Social Studies", code: "SOC" },
    { name: "Computer Science", code: "COMP" }
];
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomName = (isMale = true) => {
    const firstName = isMale ? getRandom(nepaliFirstNamesMale) : getRandom(nepaliFirstNamesFemale);
    const lastName = getRandom(nepaliLastNames);
    return `${firstName} ${lastName}`;
};
const hashPassword = async (pwd) => await bcryptjs_1.default.hash(pwd, 10);
const seedDatabase = async () => {
    try {
        console.log("Starting Seeding Process...");
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");
        // Clear existing data
        console.log("🧹 Clearing existing collections...");
        await Promise.all([
            User_1.default.deleteMany({}),
            Student_1.default.deleteMany({}),
            Teacher_1.default.deleteMany({}),
            Parent_1.default.deleteMany({}),
            Class_1.default.deleteMany({}),
            Subject_1.default.deleteMany({}),
            Mark_1.default.deleteMany({}),
            Attendance_1.default.deleteMany({}),
            Fee_1.default.deleteMany({}),
            Notice_1.default.deleteMany({}),
            ActivityLog_1.default.deleteMany({})
        ]);
        console.log("✅ Collections cleared");
        const password = await hashPassword("password123");
        // 1. Create Admins
        console.log("👤 Creating Admins...");
        const admin1 = await User_1.default.create({
            name: "Manish Shrestha",
            email: "admin@school.com",
            password: password,
            role: "admin",
            status: "active"
        });
        // 2. Create Teachers
        console.log("👨‍🏫 Creating Teachers...");
        const teachersData = [];
        for (let i = 0; i < 7; i++) {
            const name = getRandomName();
            teachersData.push({
                name,
                email: `teacher${i + 1}@school.com`,
                password,
                role: "teacher",
                status: "active"
            });
        }
        // Add PENDING teachers for approval testing
        teachersData.push({
            name: "Geeta Sapkota",
            email: "geeta@school.com",
            password: password,
            role: "teacher",
            status: "pending"
        });
        teachersData.push({
            name: "Bishal Rai",
            email: "bishal@school.com",
            password: password,
            role: "teacher",
            status: "pending"
        });
        const createdTeacherUsers = await User_1.default.insertMany(teachersData);
        const teacherProfiles = [];
        for (let i = 0; i < createdTeacherUsers.length; i++) {
            if (createdTeacherUsers[i].status !== "active")
                continue;
            teacherProfiles.push({
                userId: createdTeacherUsers[i]._id,
                employeeId: `TCH${2024000 + i}`,
                qualification: "Master's Degree",
                specialization: [subjectsList[i % subjectsList.length].name],
                phone: `9841${Math.floor(100000 + Math.random() * 900000)}`,
                address: "Kathmandu, Nepal",
                subjects: []
            });
        }
        const createdTeachers = await Teacher_1.default.insertMany(teacherProfiles);
        console.log(`✅ Created ${createdTeachers.length} teacher profiles`);
        // 3. Create Students and Parents
        console.log("👨‍🎓 Creating Students and Parents...");
        const studentUsers = [];
        const parentUsers = [];
        for (let i = 0; i < 15; i++) {
            const isMale = Math.random() > 0.5;
            const studentName = getRandomName(isMale);
            const parentName = getRandomName(true);
            studentUsers.push({
                name: studentName,
                email: `student${i + 1}@school.com`,
                password,
                role: "student",
                status: "active"
            });
            parentUsers.push({
                name: parentName,
                email: `parent${i + 1}@test.com`,
                password,
                role: "parent",
                status: "active"
            });
        }
        const createdStudentUsers = await User_1.default.insertMany(studentUsers);
        const createdParentUsers = await User_1.default.insertMany(parentUsers);
        const studentProfiles = [];
        for (let i = 0; i < createdStudentUsers.length; i++) {
            const studentClass = getRandom(classes);
            const studentSection = getRandom(sections);
            const parentName = createdParentUsers[i].name;
            studentProfiles.push({
                userId: createdStudentUsers[i]._id,
                rollNumber: `${studentClass.split(' ')[1]}${studentSection}${100 + i}`,
                class: studentClass,
                section: studentSection,
                admissionDate: new Date(2023, 0, 15),
                parentName: parentName,
                parentPhone: `9810${Math.floor(100000 + Math.random() * 900000)}`,
                address: "Lalitpur, Nepal",
                dateOfBirth: new Date(2008 + (i % 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
            });
        }
        const createdStudents = await Student_1.default.insertMany(studentProfiles);
        console.log(`✅ Created ${createdStudents.length} student profiles`);
        // Create Parent Profiles linked to students
        const parentProfiles = [];
        for (let i = 0; i < createdParentUsers.length; i++) {
            // Link parent to their student (assuming 1-to-1 for seed)
            parentProfiles.push({
                userId: createdParentUsers[i]._id,
                children: [createdStudents[i]._id],
                phone: `9810${Math.floor(100000 + Math.random() * 900000)}`,
                address: "Lalitpur, Nepal",
                occupation: "Business"
            });
        }
        const createdParents = await Parent_1.default.insertMany(parentProfiles);
        console.log(`✅ Created ${createdParents.length} parent profiles`);
        // 4. Create Subjects
        console.log("📚 Creating Subjects...");
        const subjectData = [];
        for (const cls of classes) {
            for (let i = 0; i < subjectsList.length; i++) {
                const activeTeachers = createdTeacherUsers.filter(u => u.status === "active");
                const teacherUser = activeTeachers[i % activeTeachers.length];
                subjectData.push({
                    name: subjectsList[i].name,
                    code: `${subjectsList[i].code}-${cls.split(' ')[1]}`,
                    class: cls,
                    teacherId: teacherUser._id,
                    fullMarks: 100,
                    passMarks: 40
                });
            }
        }
        const createdSubjects = await Subject_1.default.insertMany(subjectData);
        // Update teacher subjects links
        for (const sub of createdSubjects) {
            await Teacher_1.default.findOneAndUpdate({ userId: sub.teacherId }, { $addToSet: { subjects: sub._id } });
        }
        console.log(`✅ Created ${createdSubjects.length} subjects`);
        // 5. Create Classes
        console.log("🏫 Creating Classes...");
        for (const clsName of classes) {
            for (const sec of sections) {
                const classStudents = createdStudents.filter((s) => s.class === clsName && s.section === sec);
                const classSubjects = createdSubjects.filter((sub) => sub.class === clsName);
                if (classStudents.length > 0) {
                    const activeTeachers = createdTeacherUsers.filter(u => u.status === "active");
                    await Class_1.default.create({
                        name: clsName,
                        section: sec,
                        academicYear: "2024",
                        classTeacher: activeTeachers[Math.floor(Math.random() * activeTeachers.length)]._id,
                        students: classStudents.map((s) => s._id),
                        subjects: classSubjects.map((sub) => sub._id),
                        roomNumber: `${clsName.split(' ')[1]}${sec}`
                    });
                }
            }
        }
        // 6. Bulk Create Marks, Attendance, and Fees
        console.log("📊 Generating Marks, Attendance, and Fees...");
        const marksData = [];
        const attendanceData = [];
        const feesData = [];
        const terms = ["First Term", "Second Term", "Final"];
        for (const s of createdStudents) {
            const studentSubjects = createdSubjects.filter((sub) => sub.class === s.class);
            // Marks
            for (const term of terms) {
                for (const sub of studentSubjects) {
                    const marksObtained = Math.floor(45 + Math.random() * 50);
                    marksData.push({
                        studentId: s._id,
                        subjectId: sub._id,
                        examType: term === "Final" ? "Final Board" : "Mid Term",
                        marksObtained: marksObtained,
                        totalMarks: 100,
                        term: term,
                        year: 2024,
                        remarks: marksObtained > 80 ? "Excellent" : marksObtained > 60 ? "Good" : "Average"
                    });
                }
            }
            // Attendance (for the last 20 school days)
            for (let j = 0; j < 20; j++) {
                const date = new Date(Date.now() - j * 24 * 60 * 60 * 1000);
                if (date.getDay() === 6)
                    continue; // Skip Saturdays (Nepal)
                const statusEnum = ["present", "present", "present", "absent", "late"];
                attendanceData.push({
                    studentId: s._id,
                    date: date,
                    status: getRandom(statusEnum),
                    markedBy: createdTeachers[0]._id
                });
            }
            // Fees
            const feeTypes = ["tuition", "exam", "transport"];
            for (const type of feeTypes) {
                const amount = type === "tuition" ? 8000 : 2000;
                const paid = Math.random() > 0.4 ? amount : 0;
                feesData.push({
                    studentId: s._id,
                    feeType: type,
                    amount: amount,
                    dueDate: new Date(2024, 4, 1),
                    paidAmount: paid,
                    paidDate: paid > 0 ? new Date() : undefined,
                    status: paid === amount ? "paid" : "pending",
                    createdBy: admin1._id
                });
            }
        }
        await Mark_1.default.insertMany(marksData);
        await Attendance_1.default.insertMany(attendanceData);
        await Fee_1.default.insertMany(feesData);
        console.log("✅ Bulk data generated");
        // 7. Notices
        console.log("📢 Creating Notices...");
        await Notice_1.default.insertMany([
            { title: "Sports Week", content: "Details to follow", category: "event", targetRoles: ["student"], publishDate: new Date(), createdBy: admin1._id, isActive: true },
            { title: "Exam Schedule", content: "Details to follow", category: "exam", targetRoles: ["student", "parent"], publishDate: new Date(), createdBy: admin1._id, isActive: true },
            { title: "PTC Today", content: "Important meeting", category: "general", targetRoles: ["parent"], publishDate: new Date(), createdBy: admin1._id, isActive: true }
        ]);
        // 8. Activity Logs
        console.log("📜 Creating Activity Logs...");
        const actLogs = [];
        for (let i = 0; i < 10; i++) {
            actLogs.push({
                userId: admin1._id,
                action: "Data Seeding Sync",
                category: "system",
                details: "System data initialized for frontend testing.",
                ipAddress: "127.0.0.1",
                userAgent: "Seeding Script"
            });
        }
        await ActivityLog_1.default.insertMany(actLogs);
        console.log("🚀 SEEDING COMPLETED SUCCESSFULLY!");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};
seedDatabase();
