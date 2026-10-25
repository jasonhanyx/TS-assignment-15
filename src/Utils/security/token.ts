import { Secret, sign, SignOptions, verify, VerifyOptions } from "jsonwebtoken";
import { HUserDocument } from "../../DB/Models/user.model.js";
import { RoleEnum } from "../enums/usermenum.js";
import { env } from "../../config/config.service.js";

export const generatToken = ({
  payload,
  secret,
  options,
}: {
  payload: object;
  secret: Secret;
  options: SignOptions;
}) => {
  return sign(payload, secret, options);
};

export const verifyToken = ({
  token,
  secret,
  options,
}: {
  token: string;
  secret: Secret;
  options?: VerifyOptions;
}) => {
  return verify(token, secret, options);
};

export const createLogincredentials = (
  user: HUserDocument,
): { accessToken: string; refreshToken: string } => {
  const isAdmin = user.role === RoleEnum.ADMIN;

  const accessSecret = isAdmin
    ? env.ACCESS_ADMIN_SIGNATURE
    : env.ACCESS_USER_SIGNATURE;

  const refreshSecret = isAdmin
    ? env.REFRESH_ADMIN_SIGNATURE
    : env.REFRESH_USER_SIGNATURE;

  const accessToken = generatToken({
    payload: { _id: user._id },
    secret: accessSecret,
    options: { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN },
  });

  const refreshToken = generatToken({
    payload: { _id: user._id },
    secret: refreshSecret,
    options: { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN },
  });
  return { accessToken, refreshToken };
};

export const getNewLoginCredentials = createLogincredentials;
