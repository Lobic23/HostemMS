export interface ApiResponse<T = void> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// helpers
// just to remove some duplicate code
export const ok = <T>(data: T): ApiResponse<T> => ({ status: 'success', data });
export const created = <T>(data: T): ApiResponse<T> => ({ status: 'success', data });
export const err = (message: string): ApiResponse => ({ status: 'error', message });

// USAGE :
//  getUserById: asyncHandler(async (req: Request, res: Response) => {
// 		const user = await userService.getUserById(req.params.id);
//      // res.json({ status: 'success', data: { user } });
// 		res.json(ok({ user }));
//  }),