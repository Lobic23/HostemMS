import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';

export const healthController=  {
  // GET /health
  checkHealth : asyncHandler(async (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  }),

}

