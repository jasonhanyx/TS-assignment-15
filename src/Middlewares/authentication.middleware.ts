import { NextFunction, Request, Response } from "express";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../Utils/response/error.response.js";
import { verifyToken } from "../Utils/security/token.js";
import { env } from "../config/config.service.js";
import { HUserDocument, UserModel } from "../DB/Models/user.model.js";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: HUserDocument;
    }
  }
}

export const authentication = () => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new UnauthorizedException("Authorization header is required");
    }

    const [bearer, token] = authorization.split(" ");
    if (!bearer || !token) {
      throw new BadRequestException("Invalid token format");
    }

    let signature: string;
    switch (bearer) {
      case "Admin":
        signature = env.ACCESS_ADMIN_SIGNATURE;
        break;
      case "Bearer":
      case "User":
        signature = env.ACCESS_USER_SIGNATURE;
        break;
      default:
        throw new UnauthorizedException("Invalid token bearer");
    }

    let decoded: JwtPayload;
    try {
      decoded = verifyToken({ token, secret: signature }) as JwtPayload;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Invalid or expired token";
      throw new UnauthorizedException(message);
    }

    if (!decoded?._id) {
      throw new UnauthorizedException("Invalid token payload");
    }

    const user = await UserModel.findById(decoded._id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.changeCredentialsTime && decoded.iat) {
      const changeCredentialsInSeconds = Math.floor(
        user.changeCredentialsTime.getTime() / 1000,
      );
      if (changeCredentialsInSeconds > decoded.iat) {
        throw new UnauthorizedException("Token expired, please login again");
      }
    }

    req.user = user;
    next();
  };
};
