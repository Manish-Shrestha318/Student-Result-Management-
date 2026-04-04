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
import Fee from "../models/Fee";
import Notice from "../models/Notice";
import ActivityLog from "../models/ActivityLog";

dotenv.config();

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

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomName = (isMale: boolean = true) => {
  const firstName = isMale ? getRandom(nepaliFirstNamesMale) : getRandom(nepaliFirstNamesFemale);
  const lastName = getRandom(nepaliLastNames);
  return `${firstName} ${lastName}`;
};

const hashPassword = async (pwd: string) => await bcrypt.hash(pwd, 10);

const seedDatabase = async () => {
  try {
    console.log("Starting Seeding Process...");
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🧹 Clearing existing collections...");
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Teacher.deleteMany({}),
      Parent.deleteMany({}),
      Class.deleteMany({}),
      Subject.deleteMany({}),
      Mark.deleteMany({}),
      Attendance.deleteMany({}),
      Fee.deleteMany({}),
      Notice.deleteMany({}),
      ActivityLog.deleteMany({})
    ]);
    console.log("✅ Collections cleared");

    const password = await hashPassword("password123");

    // 1. Create Admins
    console.log("👤 Creating Admins...");
    const admin1 = await User.create({
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
            email: `teacher${i+1}@school.com`,
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

    const createdTeacherUsers = await User.insertMany(teachersData);
    
    const teacherProfiles = [];
    for (let i = 0; i < createdTeacherUsers.length; i++) {
        if (createdTeacherUsers[i].status !== "active") continue;
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
    const createdTeachers = await Teacher.insertMany(teacherProfiles);
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
            email: `student${i+1}@school.com`,
            password,
            role: "student",
            status: "active"
        });
        
        parentUsers.push({
            name: parentName,
            email: `parent${i+1}@test.com`,
            password,
            role: "parent",
            status: "active"
        });
    }

    // Explicitly add Tara Nepal for the user request
    studentUsers.push({
        name: "Tara Nepal",
        email: "tara@school.com",
        password,
        role: "student",
        status: "active"
    });
    parentUsers.push({
        name: "Laxman Nepal",
        email: "laxman@test.com",
        password,
        role: "parent",
        status: "active"
    });

    const createdStudentUsers = await User.insertMany(studentUsers);
    const createdParentUsers = await User.insertMany(parentUsers);
    
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
    const createdStudents = await Student.insertMany(studentProfiles);
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
    const createdParents = await Parent.insertMany(parentProfiles);
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
    const createdSubjects = await Subject.insertMany(subjectData);
    
    // Update teacher subjects links
    for (const sub of createdSubjects) {
        await Teacher.findOneAndUpdate(
            { userId: sub.teacherId },
            { $addToSet: { subjects: sub._id } }
        );
    }
    console.log(`✅ Created ${createdSubjects.length} subjects`);

    // 5. Create Classes
    console.log("🏫 Creating Classes...");
    for (const clsName of classes) {
        for (const sec of sections) {
            const classStudents = createdStudents.filter((s: any) => s.class === clsName && s.section === sec);
            const classSubjects = createdSubjects.filter((sub: any) => sub.class === clsName);
            
            if (classStudents.length > 0) {
                const activeTeachers = createdTeacherUsers.filter(u => u.status === "active");
                await Class.create({
                    name: clsName,
                    section: sec,
                    academicYear: "2024",
                    classTeacher: activeTeachers[Math.floor(Math.random() * activeTeachers.length)]._id,
                    students: classStudents.map((s: any) => s._id),
                    subjects: classSubjects.map((sub: any) => sub._id),
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
        const studentUser = createdStudentUsers.find(u => u._id.equals(s.userId));
        const isTaraNepal = studentUser?.name === "Tara Nepal" || studentUser?.name === "Tara Nepal"; // fallback just in case
        
        const studentSubjects = createdSubjects.filter((sub: any) => sub.class === s.class);

        // Attendance (spanning 4 months for correlation analysis)
        const attendanceMonths = [2, 3, 4, 5]; // Mar to June
        let totalPresent = 0;
        let totalPossible = 0;

        for (const month of attendanceMonths) {
            for (let day = 1; day <= 20; day++) {
                const date = new Date(2025, month, day);
                if (date.getDay() === 6 || date.getDay() === 0) continue; // Skip Sat/Sun

                totalPossible++;
                let status: "present" | "absent" = "present";
                
                if (isTaraNepal) {
                    // For Tara Nepal, give her low attendance (approx 60%) to test the impact logic
                    status = Math.random() > 0.6 ? "present" : "absent";
                } else {
                    const studentLuck = (s.rollNumber.charCodeAt(s.rollNumber.length-1) % 10);
                    const rand = Math.random() * 10;
                    if (rand > (8 + (studentLuck/5))) status = "absent";
                }

                if (status === "present") totalPresent++;

                attendanceData.push({
                    studentId: s._id,
                    date: date,
                    status: status,
                    markedBy: createdTeacherUsers[0]._id
                });
            }
        }

        const attendanceRate = (totalPresent / totalPossible) * 100;

        // Marks with logical term progress (Improvement/Regression)
        for (const term of terms) {
            const termIndex = terms.indexOf(term); // 0, 1, 2
            
            for (const sub of studentSubjects) {
                let marksObtained: number;

                if (term === "First Term") {
                    // First Term: High marks despite low attendance (Ignore attendance)
                    // Generate a base mark using roll number for consistency
                    const baseMarks = 75 + (s.rollNumber.charCodeAt(s.rollNumber.length-1) % 15);
                    marksObtained = baseMarks + Math.floor(Math.random() * 10);
                } else {
                    // Mid/Final: Marks dropped because of low attendance
                    // If attendance < 75%, drop marks significantly
                    const penalty = attendanceRate < 75 ? 25 : (attendanceRate > 90 ? -5 : 0);
                    const baseMarks = 75 + (s.rollNumber.charCodeAt(s.rollNumber.length-1) % 15);
                    marksObtained = baseMarks - penalty + Math.floor(Math.random() * 10);
                }
                
                marksObtained = Math.max(10, Math.min(100, marksObtained));

                marksData.push({
                    studentId: s._id,
                    subjectId: sub._id,
                    examType: term === "Final" ? "Final Board" : "Mid Term",
                    marksObtained: marksObtained,
                    totalMarks: 100,
                    term: term,
                    year: 2025,
                    remarks: marksObtained > 80 ? "Excellent" : marksObtained > 60 ? "Good" : "Needs Attention",
                    createdAt: new Date(2025, 2 + (termIndex * 3), 15) // Mar, Jun, Sep
                });
            }
        }

        // Fees
        const feeTypes: ("tuition" | "exam" | "transport")[] = ["tuition", "exam", "transport"];
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

    await Mark.insertMany(marksData);
    await Attendance.insertMany(attendanceData);
    await Fee.insertMany(feesData);
    console.log("✅ Bulk data generated");

    // 7. Notices
    console.log("📢 Creating Notices...");
    await Notice.insertMany([
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
    await ActivityLog.insertMany(actLogs);

    console.log("🚀 SEEDING COMPLETED SUCCESSFULLY!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();