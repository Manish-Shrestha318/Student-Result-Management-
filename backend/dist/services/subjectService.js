"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubject = exports.updateSubject = exports.createSubject = exports.getAllSubjects = void 0;
const Subject_1 = __importDefault(require("../models/Subject"));
const getAllSubjects = async () => {
    return await Subject_1.default.find().populate("teacherId", "name");
};
exports.getAllSubjects = getAllSubjects;
const createSubject = async (data) => {
    return await Subject_1.default.create(data);
};
exports.createSubject = createSubject;
const updateSubject = async (id, data) => {
    return await Subject_1.default.findByIdAndUpdate(id, data, { new: true });
};
exports.updateSubject = updateSubject;
const deleteSubject = async (id) => {
    return await Subject_1.default.findByIdAndDelete(id);
};
exports.deleteSubject = deleteSubject;
