"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeService = void 0;
const Fee_1 = __importDefault(require("../models/Fee"));
const Student_1 = __importDefault(require("../models/Student"));
const mongoose_1 = require("mongoose");
class FeeService {
    async createFee(data) {
        const fee = await Fee_1.default.create({
            ...data,
            studentId: new mongoose_1.Types.ObjectId(data.studentId),
            createdBy: new mongoose_1.Types.ObjectId(data.createdBy)
        });
        return fee;
    }
    async getStudentFees(studentId) {
        return await Fee_1.default.find({ studentId: new mongoose_1.Types.ObjectId(studentId) })
            .sort({ dueDate: -1 });
    }
    async makePayment(feeId, payment) {
        const fee = await Fee_1.default.findById(feeId);
        if (!fee)
            throw new Error("Fee record not found");
        const newPaidAmount = fee.paidAmount + payment.amount;
        // Update status based on payment
        let status = fee.status;
        if (newPaidAmount >= fee.amount) {
            status = "paid";
        }
        else if (newPaidAmount > 0) {
            status = "partial";
        }
        const updatedFee = await Fee_1.default.findByIdAndUpdate(feeId, {
            paidAmount: newPaidAmount,
            paidDate: new Date(),
            status,
            paymentMethod: payment.paymentMethod,
            transactionId: payment.transactionId
        }, { new: true });
        return updatedFee;
    }
    async getFeeReport(classId, month, year) {
        const query = {};
        if (classId) {
            const students = await Student_1.default.find({ class: classId });
            const studentIds = students.map(s => s._id);
            query.studentId = { $in: studentIds };
        }
        const fees = await Fee_1.default.find(query).populate({
            path: 'studentId',
            populate: { path: 'userId', select: 'name email' }
        });
        const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
        const totalPending = fees.reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);
        return {
            summary: {
                totalFees: fees.length,
                totalCollected,
                totalPending,
                collectionRate: ((totalCollected / (totalCollected + totalPending)) * 100).toFixed(2) + '%'
            },
            details: fees
        };
    }
}
exports.FeeService = FeeService;
