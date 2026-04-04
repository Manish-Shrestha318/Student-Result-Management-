"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClassController = exports.updateClassController = exports.createClassController = exports.getClassesController = void 0;
const classService_1 = require("../services/classService");
const getClassesController = async (req, res) => {
    try {
        const classes = await (0, classService_1.getAllClasses)();
        res.json(classes);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getClassesController = getClassesController;
const createClassController = async (req, res) => {
    try {
        const newClass = await (0, classService_1.createClass)(req.body);
        res.status(201).json(newClass);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createClassController = createClassController;
const updateClassController = async (req, res) => {
    try {
        const updatedClass = await (0, classService_1.updateClass)(req.params.id, req.body);
        if (!updatedClass)
            return res.status(404).json({ message: "Class not found" });
        res.json(updatedClass);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateClassController = updateClassController;
const deleteClassController = async (req, res) => {
    try {
        const deletedClass = await (0, classService_1.deleteClass)(req.params.id);
        if (!deletedClass)
            return res.status(404).json({ message: "Class not found" });
        res.json({ message: "Class deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteClassController = deleteClassController;
