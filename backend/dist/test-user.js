const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    // Register models so populate works
    require('./models/User');
    require('./models/Student');
    require('./models/Teacher');
    require('./models/Parent');
    const { getAllUsers } = require('./services/userService');
    const users = await getAllUsers('student', undefined);
    console.log('Returned students count:', users.length);
    if (users.length > 0) {
        console.log('First student sample:', users[0]);
    }
    else {
        // If no students returned from branch, check if the Student collection has docs
        const Student = mongoose.model('Student');
        const dbStudents = await Student.find().lean();
        console.log('Students in DB:', dbStudents.length);
    }
    process.exit(0);
}
test();
