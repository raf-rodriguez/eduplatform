import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './errorHandler';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err: any) => ({
      field: err.path,
      message: err.msg,
    }));
    
    throw new AppError(
      `Validation failed: ${extractedErrors.map((e) => e.message).join(', ')}`,
      400
    );
  }
  
  next();
};
