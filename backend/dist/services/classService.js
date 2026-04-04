"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClass = exports.updateClass = exports.createClass = exports.getAllClasses = void 0;
const Class_1 = __importDefault(require("../models/Class"));
const getAllClasses = async () => {
    return await Class_1.default.find().populate("classTeacher", "name email").populate("subjects", "name code");
};
exports.getAllClasses = getAllClasses;
const createClass = async (data) => {
    return await Class_1.default.create(data);
};
exports.createClass = createClass;
const updateClass = async (id, data) => {
    return await Class_1.default.findByIdAndUpdate(id, data, { new: true });
};
exports.updateClass = updateClass;
const deleteClass = async (id) => {
    return await Class_1.default.findByIdAndDelete(id);
};
exports.deleteClass = deleteClass;
