import Class, { IClass } from "../models/Class";
import Student from "../models/Student";
import Subject from "../models/Subject";

export const getAllClasses = async (filter?: { userId?: string }): Promise<IClass[]> => {
  let query = {};
  
  if (filter?.userId) {
    // Find all subjects this teacher teaches
    const teacherSubjects = await Subject.find({ teacherId: filter.userId });
    const classNames = teacherSubjects.map(s => s.class);
    
    // Find classes where teacher is Class Teacher OR teaches a subject
    query = {
      $or: [
        { classTeacher: filter.userId },
        { name: { $in: classNames } }
      ]
    };
  }

  return await Class.find(query)
    .populate("classTeacher", "name email")
    .populate("subjects", "name code class")
    .populate("students", "rollNumber class section");
};

const handleBidirectionalLinking = async (cls: IClass) => {
    if (cls.students && cls.students.length > 0) {
        await Student.updateMany(
            { _id: { $in: cls.students } },
            { $set: { class: cls.name, section: cls.section } }
        );
    }
    if (cls.subjects && cls.subjects.length > 0) {
        const classTargetName = `${cls.name} — ${cls.section}`;
        await Subject.updateMany(
            { _id: { $in: cls.subjects } },
            { $set: { class: classTargetName, section: cls.section } }
        );
    }
};

export const createClass = async (data: any): Promise<IClass> => {
  const newClass = await Class.create(data);
  await handleBidirectionalLinking(newClass);
  return newClass;
};

export const updateClass = async (id: string, data: any): Promise<IClass | null> => {
  const updatedClass = await Class.findByIdAndUpdate(id, data, { new: true });
  if (updatedClass) {
      await handleBidirectionalLinking(updatedClass);
  }
  return updatedClass;
};

export const deleteClass = async (id: string): Promise<IClass | null> => {
  return await Class.findByIdAndDelete(id);
};
