import { Request, Response, NextFunction } from "express";
import { AppError } from "@/common/types/errors";
import { AuthRequest } from "@/common/middleware/auth";
import { Role, ROLES } from "db/schema/users";

export const getRoleLevel = (role: Role): number => ROLES.indexOf(role);

export const hasRequiredRole = (userRole: Role, requiredRole: Role): boolean =>
  getRoleLevel(userRole) >= getRoleLevel(requiredRole);

//  requireRole("manager") → user must be manager OR above
export const requireRole = (minimumRole: Role) => (req: Request, _res: Response, next: NextFunction) => {
  const user = (req as AuthRequest).user;
  if (!user) throw AppError.unauthorized("Not authenticated");

  if (!hasRequiredRole(user.role, minimumRole)) {
    throw AppError.forbidden(`Requires role: ${minimumRole} or above. Your role: ${user.role}`);
  }

  next();
};

export const requireExactRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (!user) throw AppError.unauthorized("Not authenticated");

    if (!roles.includes(user.role)) {
      throw AppError.forbidden(`Access restricted to: ${roles.join(", ")}`);
    }

    next();
  };

// user owns the resource OR has required role
export const requireOwnerOrRole =
  (minimumRole: Role, getResourceOwnerId?: (req: Request) => string) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (!user) throw AppError.unauthorized("Not authenticated");

    // Default: ownership is checked against req.params.id
    const ownerId = getResourceOwnerId ? getResourceOwnerId(req) : req.params.id;

    const isOwner = user.id === ownerId;
    const hasRole = hasRequiredRole(user.role, minimumRole);

    if (!isOwner && !hasRole) {
      throw AppError.forbidden("Not authorized to access this resource");
    }

    next();
  };

// requireAnyRole({ roles: ["admin", "manager"] })
// requireAnyRole({
//   roles: ["admin", "manager"],
//   allowOwner: true,
// });
// requireAnyRole({
//   roles: ["admin"],
//   allowOwner: true,
//   getOwnerId: (req) => req.params.userId,
// });

// while other work om the basis of the role hiearchy this method only check if the
// @param roles is met or not
export const requireAnyRole =
  ({
    roles,
    allowOwner = false,
    getOwnerId,
  }: {
    roles: Role[];
    allowOwner?: boolean;
    getOwnerId?: (req: Request) => string;
  }) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (!user) throw AppError.unauthorized("Not authenticated");

    const hasExactRole = roles.includes(user.role);

    let isOwner = false;

    if (allowOwner) {
      const ownerId = getOwnerId ? getOwnerId(req) : req.params.id;
      isOwner = user.id === ownerId;
    }

    if (!hasExactRole && !isOwner) {
      throw AppError.forbidden(`Access restricted to: ${roles.join(", ")}${allowOwner ? " or resource owner" : ""}`);
    }

    next();
  };
