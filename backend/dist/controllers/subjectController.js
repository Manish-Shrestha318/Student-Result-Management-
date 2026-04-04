"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubjectController = exports.updateSubjectController = exports.createSubjectController = exports.getSubjectsController = void 0;
const subjectService_1 = require("../services/subjectService");
const getSubjectsController = async (req, res) => {
    try {
        const subjects = await (0, subjectService_1.getAllSubjects)();
        res.json(subjects);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getSubjectsController = getSubjectsController;
const createSubjectController = async (req, res) => {
    try {
        const newSubject = await (0, subjectService_1.createSubject)(req.body);
        res.status(201).json(newSubject);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createSubjectController = createSubjectController;
const updateSubjectController = async (req, res) => {
    try {
        const updatedSubject = await (0, subjectService_1.updateSubject)(req.params.id, req.body);
        if (!updatedSubject)
            return res.status(404).json({ message: "Subject not found" });
        res.json(updatedSubject);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateSubjectController = updateSubjectController;
const deleteSubjectController = async (req, res) => {
    try {
        const deletedSubject = await (0, subjectService_1.deleteSubject)(req.params.id);
        if (!deletedSubject)
            return res.status(404).json({ message: "Subject not found" });
        res.json({ message: "Subject deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteSubjectController = deleteSubjectController;
