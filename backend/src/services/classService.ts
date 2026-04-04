import Class, { IClass } from "../models/Class";

export const getAllClasses = async (): Promise<IClass[]> => {
  return await Class.find().populate("classTeacher", "name email").populate("subjects", "name code");
};

export const createClass = async (data: any): Promise<IClass> => {
  return await Class.create(data);
};

export const updateClass = async (id: string, data: any): Promise<IClass | null> => {
  return await Class.findByIdAndUpdate(id, data, { new: true });
};

export const deleteClass = async (id: string): Promise<IClass | null> => {
  return await Class.findByIdAndDelete(id);
};
