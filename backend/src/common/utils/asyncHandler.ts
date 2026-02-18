import { Request, Response, NextFunction } from "express";

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;

/**
 * A wrapper function to handle errors in async route handlers automatically.
 *
 * @param fn - An asynchronous route handler function
 * @returns A new function that executes `fn` and catches any errors
 *          that occur, passing them to Express's `next()` function.
 *          which is handled by common/middlewares/errorHandler.ts
 *
 * This prevents the need to write try/catch blocks in every async route.
 *
 * Example usage:
 *   app.get('/users', asyncHandler(async (req, res) => {
 *     const users = await getUsers();
 *     res.json(users);
 *   }));
 *
 * instead of
 *
 *  app.get('/users', async (req, res, next) => {
 *    try {
 *      const users = await getUsers();
 *      res.json(users);
 *    } catch (err) {
 *      next(err);
 *    }
 *  });
 */
export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
