import Fee, { IFee } from "../models/Fee";
import Student from "../models/Student";
import { Types } from "mongoose";

interface CreateFeeDTO {
  studentId: string;
  feeType: string;
  amount: number;
  dueDate: Date;
  createdBy: string;
}

interface PaymentDTO {
  amount: number;
  paymentMethod: string;
  transactionId?: string;
}

export class FeeService {
  [x: string]: any;
  
  async createFee(data: CreateFeeDTO): Promise<IFee> {
    const fee = await Fee.create({
      ...data,
      studentId: new Types.ObjectId(data.studentId),
      createdBy: new Types.ObjectId(data.createdBy)
    });
    return fee;
  }

  async getStudentFees(studentId: string): Promise<IFee[]> {
    return await Fee.find({ studentId: new Types.ObjectId(studentId) })
      .sort({ dueDate: -1 });
  }

  async makePayment(feeId: string, payment: PaymentDTO): Promise<IFee | null> {
    const fee = await Fee.findById(feeId);
    if (!fee) throw new Error("Fee record not found");

    const newPaidAmount = fee.paidAmount + payment.amount;
    
    // Update status based on payment
    let status = fee.status;
    if (newPaidAmount >= fee.amount) {
      status = "paid";
    } else if (newPaidAmount > 0) {
      status = "partial";
    }

    const updatedFee = await Fee.findByIdAndUpdate(
      feeId,
      {
        paidAmount: newPaidAmount,
        paidDate: new Date(),
        status,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId
      },
      { new: true }
    );

    return updatedFee;
  }

  async getFeeReport(classId?: string, month?: number, year?: number): Promise<any> {
    const query: any = {};
    
    if (classId) {
      const students = await Student.find({ class: classId });
      const studentIds = students.map(s => s._id);
      query.studentId = { $in: studentIds };
    }

    const fees = await Fee.find(query).populate('studentId');

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