import { Request, Response, NextFunction } from "express";
import TokenService from "../features/token/token.service";

declare module "express" {
  interface Request {
    user?: any;
  }
}

export default function SecurityMiddleware(tokenService: TokenService) {
  const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.sendStatus(401);

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return res.sendStatus(401);

    const token = parts[1];
    try {
      const verified = await tokenService.verifyToken(token);
      if (!verified) return res.sendStatus(401);
      // support payload shape { user } or direct payload
      req.user = (verified as any).user ?? verified;
      return next();
    } catch {
      return res.sendStatus(401);
    }
  };

  const checkRole = (role: string) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.sendStatus(401);
    if (req.user.role === role) return next();
    return res.status(403).json({ status: "fail", message: `This action is for ${role}s only` });
  };

  const isAdmin = checkRole("admin");
  const isTechnician = checkRole("technician");
  const isPharmacist = checkRole("pharmacist");
  const isCustomer = checkRole("customer");

  return { authenticateJWT, isAdmin, isTechnician, isPharmacist, isCustomer };
}