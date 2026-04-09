import Subject, { ISubject } from "../models/Subject";

export const getAllSubjects = async (filter?: { userId?: string }): Promise<ISubject[]> => {
  const query = filter?.userId ? { teacherId: filter.userId } : {};
  return await Subject.find(query).populate("teacherId", "name");
};

export const createSubject = async (data: any): Promise<ISubject> => {
  return await Subject.create(data);
};

export const updateSubject = async (id: string, data: any): Promise<ISubject | null> => {
  return await Subject.findByIdAndUpdate(id, data, { new: true });
};

export const deleteSubject = async (id: string): Promise<ISubject | null> => {
  return await Subject.findByIdAndDelete(id);
};
