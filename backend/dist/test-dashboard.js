const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    require('./models/User');
    require('./models/Student');
    require('./models/Teacher');
    require('./models/Parent');
    require('./models/Class');
    require('./models/Subject');
    const User = mongoose.model('User');
    const Teacher = mongoose.model('Teacher');
    const Subject = mongoose.model('Subject');
    const Class = mongoose.model('Class');
    const teachers = await User.find({ role: 'teacher', status: 'active' });
    for (let i = 0; i < 3 && i < teachers.length; i++) {
        const t = teachers[i];
        console.log(`\nTeacher: ${t.email}`);
        const subs = await Subject.find({ teacherId: t._id });
        console.log(`Subjects: ${subs.length}`);
        const classes = await Class.find({
            $or: [
                { classTeacher: t._id },
                { subjects: { $in: subs.map(s => s._id) } }
            ]
        });
        console.log(`Classes: ${classes.length}`);
    }
    // also check if admin requests teacher dashboard what happens
    const admin = await User.findOne({ role: 'admin' });
    console.log(`\nAdmin: ${admin.email}`);
    const adminSubs = await Subject.find({ teacherId: admin._id });
    console.log(`Admin Subjects: ${adminSubs.length}`);
    process.exit(0);
}
test();
