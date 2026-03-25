import { Request, Response } from "express";
import { FeeService } from "../services/feeService";

const feeService = new FeeService();

export class FeeController {
  
  // Create new fee
  async createFee(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, feeType, amount, dueDate, remarks } = req.body;
      const createdBy = (req as any).user.id;

      if (!studentId || !feeType || !amount || !dueDate) {
        res.status(400).json({
          success: false,
          message: "Missing required fields"
        });
        return;
      }

      const fee = await feeService.createFee({
        studentId,
        feeType,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
       
        createdBy
      });

      res.status(201).json({
        success: true,
        message: "Fee record created successfully",
        data: fee
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get student fees
  async getStudentFees(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;

      if (!studentId) {
        res.status(400).json({
          success: false,
          message: "Student ID is required"
        });
        return;
      }

      const fees = await feeService.getStudentFees(studentId as any);

      res.json({
        success: true,
        data: fees
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Make payment
  async makePayment(req: Request, res: Response): Promise<void> {
    try {
      const { feeId } = req.params;
      const { amount, paymentMethod, transactionId } = req.body;

      if (!amount || !paymentMethod) {
        res.status(400).json({
          success: false,
          message: "Amount and payment method are required"
        });
        return;
      }

      const fee = await feeService.makePayment(feeId as any, {
        amount: parseFloat(amount),
        paymentMethod,
        transactionId
      });

      if (!fee) {
        res.status(404).json({
          success: false,
          message: "Fee record not found"
        });
        return;
      }

      res.json({
        success: true,
        message: "Payment successful",
        data: fee
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get fee report
  async getFeeReport(req: Request, res: Response): Promise<void> {
    try {
      const { classId, month, year } = req.query;

      const report = await feeService.getFeeReport(
        classId as string,
        month ? parseInt(month as string) : undefined,
        year ? parseInt(year as string) : undefined
      );

      res.json({
        success: true,
        data: report
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get fee by ID
  async getFeeById(req: Request, res: Response): Promise<void> {
    try {
      const { feeId } = req.params;

      const fee = await feeService.getFeeById(feeId);

      if (!fee) {
        res.status(404).json({
          success: false,
          message: "Fee record not found"
        });
        return;
      }

      res.json({
        success: true,
        data: fee
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update fee
  async updateFee(req: Request, res: Response): Promise<void> {
    try {
      const { feeId } = req.params;
      const updates = req.body;

      const fee = await feeService.updateFee(feeId, updates);

      if (!fee) {
        res.status(404).json({
          success: false,
          message: "Fee record not found"
        });
        return;
      }

      res.json({
        success: true,
        message: "Fee record updated",
        data: fee
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete fee
  async deleteFee(req: Request, res: Response): Promise<void> {
    try {
      const { feeId } = req.params;

      const deleted = await feeService.deleteFee(feeId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Fee record not found"
        });
        return;
      }

      res.json({
        success: true,
        message: "Fee record deleted"
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}