import { Request, Response } from "express";
import {
  IConfirmEmailDTO,
  IForgetPasswordDTO,
  ILoginDTO,
  ILoginWithGoogleDTO,
  IResetPasswordDTO,
  ISignUpDTO,
} from "./auth.dto.js";
import { UserModel } from "../../DB/Models/user.model.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "./../../Utils/response/error.response.js";
import { generateOTP } from "../../Utils/generateOTP.js";
import { compareHash, generatHash } from "../../Utils/security/hash.js";
import { emaiEvents } from "../../Utils/events/email.events.js";
import {
  createLogincredentials,
  getNewLoginCredentials,
} from "../../Utils/security/token.js";
import { ProviderEnum } from "../../Utils/enums/usermenum.js";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { env } from "../../config/config.service.js";
import { successResponse } from "../../Utils/response/success.response.js";

class AuthService {
  constructor() {}

  signup = async (req: Request, res: Response): Promise<Response> => {
    const { email, password, username }: ISignUpDTO = req.body;

    const checkUserExists = await UserModel.findOne({ email }).select("email");
    if (checkUserExists) throw new ConflictException("User already exists");
    const otp = generateOTP();

    const [user] = await UserModel.create(
      [
        {
          username,
          email,
          password: await generatHash(password),
          confirmEmailOTP: await generatHash(otp),
          provider: ProviderEnum.SYSTEM,
        },
      ],
      { validateBeforeSave: true },
    );

    emaiEvents.emit("confirmEmail", { to: email, username, otp });

    return res.status(201).json({ message: "Done", user });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: IConfirmEmailDTO = req.body;

    const user = await UserModel.findOne({
      email,
      confirmEmailOTP: { $exists: true },
      confirmAt: { $exists: false },
    });

    if (!user || !user.confirmEmailOTP)
      throw new NotFoundException("Invalid Account");

    if (!(await compareHash(otp, user.confirmEmailOTP)))
      throw new BadRequestException("Invalid OTP");

    await UserModel.updateOne(
      {
        email,
      },
      {
        confirmAt: new Date(),
        $unset: { confirmEmailOTP: true },
        $inc: { __v: 1 },
      },
    );

    return res.status(200).json({ message: "User Confirmed Successfully" });
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password }: ILoginDTO = req.body;

    const user = await UserModel.findOne({
      email,
      confirmAt: { $exists: true },
    });

    if (!user) throw new NotFoundException("Invalid Account");

    if (!user.password || !(await compareHash(password, user.password)))
      throw new BadRequestException("Invalid password");

    const credentials = createLogincredentials(user);

    return res.status(200).json({ message: "Done", credentials });
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    await UserModel.updateOne(
      { _id: req.user!._id },
      { changeCredentialsTime: new Date() },
    );

    return res.status(200).json({
      message: "Logout Successfully",
    });
  };

  forgetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { email }: IForgetPasswordDTO = req.body;

    const user = await UserModel.findOne({
      email,
      confirmAt: { $exists: true },
    });

    if (!user) throw new NotFoundException("Invalid Account");

    const otp = generateOTP();

    await UserModel.updateOne(
      { email },
      {
        resetPasswordOTP: await generatHash(otp),
        $inc: { __v: 1 },
      },
    );

    emaiEvents.emit("forgetPassword", {
      to: email,
      username: user.username || user.firstName,
      otp,
    });

    return res
      .status(200)
      .json({ message: "Reset password OTP sent successfully" });
  };

  resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp, newPassword }: IResetPasswordDTO = req.body;

    const user = await UserModel.findOne({
      email,
      resetPasswordOTP: { $exists: true },
      confirmAt: { $exists: true },
    });

    if (!user || !user.resetPasswordOTP)
      throw new NotFoundException("Invalid Account or reset request");

    if (!(await compareHash(otp, user.resetPasswordOTP)))
      throw new BadRequestException("Invalid OTP");

    const hashedPassword = await generatHash(newPassword);

    await UserModel.updateOne(
      { email },
      {
        password: hashedPassword,
        changeCredentialsTime: new Date(),
        $unset: { resetPasswordOTP: true },
        $inc: { __v: 1 },
      },
    );

    return res.status(200).json({ message: "Password reset successfully" });
  };

  verifyGoogleAccount = verifyGoogleAccount;

  loginWithGoogle = async (req: Request, res: Response): Promise<Response> => {
    const { idToken }: ILoginWithGoogleDTO = req.body;

    const { email, email_verified, given_name, family_name, picture } =
      await verifyGoogleAccount({ idToken });

    if (!email_verified) {
      throw new BadRequestException("Email not verified");
    }

    if (!email) {
      throw new BadRequestException("Google token does not contain an email");
    }

    const user = await UserModel.findOne({ email });

    if (user) {
      if (user.provider !== ProviderEnum.GOOGLE) {
        throw new ConflictException(
          "This email is registered with another login method.",
        );
      }

      const credentials = await getNewLoginCredentials(user);

      return successResponse({
        res,
        message: "Login Successfully",
        data: { credentials },
        statusCode: 200,
      });
    }

    const newUser = await UserModel.create({
      firstName: given_name || "User",
      lastName: family_name || "Google",
      email,
      profilePic: picture,
      confirmAt: new Date(),
      provider: ProviderEnum.GOOGLE,
    });

    const credentials = await getNewLoginCredentials(newUser);

    return successResponse({
      res,
      message: "Login Successfully",
      data: { credentials },
      statusCode: 201,
    });
  };
}

async function verifyGoogleAccount({
  idToken,
}: {
  idToken: string;
}): Promise<TokenPayload> {
  const client = new OAuth2Client();

  const audience =
    env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_ID !== "your-google-client-id.apps.googleusercontent.com"
      ? env.GOOGLE_CLIENT_ID
      : undefined;

  const ticket = await client.verifyIdToken({
    idToken: idToken,
    ...(audience && { audience }),
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new BadRequestException("Invalid Google token payload");
  }
  return payload;
}

export default new AuthService();
