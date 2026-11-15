import type { NextFunction, Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma.js";
import type { RoleType } from "./utils/business-rules.js";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: RoleType;
}

export interface AuthedRequest extends Request {
  user?: SessionUser;
}

export const COOKIE_NAME = "nacova_token";

function getSecretKey(): Uint8Array {
  const raw = process.env.AUTH_SECRET || "nacova-dev-secret-change-in-production-32bytes";
  return new TextEncoder().encode(raw);
}

export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }
    const user = await prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null, isActive: true },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as RoleType,
    };
  } catch {
    return null;
  }
}

export function extractToken(req: Request): string | null {
  const cookieToken = req.cookies?.[COOKIE_NAME];
  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  return null;
}

export function requireAuth(allowedRoles?: RoleType[]) {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({ error: "Sesi berakhir. Silakan login kembali." });
      return;
    }
    const user = await verifySessionToken(token);
    if (!user) {
      res.status(401).json({ error: "Sesi tidak valid atau akun dinonaktifkan." });
      return;
    }
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      res.status(403).json({ error: "Anda tidak memiliki izin untuk aksi ini." });
      return;
    }
    req.user = user;
    next();
  };
}
