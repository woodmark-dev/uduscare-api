/* eslint-disable prettier/prettier */
import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  // ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { EmailingService } from '../emailing/emailing.service';
import { randomBytes } from 'crypto';
import { EncryptionService } from '../encryption/encryption.service';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private emailingService: EmailingService,
    private encryptionService: EncryptionService,
  ) { }

  async signUp(userData: CreateUserDTO) {
    const email = await this.encryptionService.getEncryptedText(userData.email);
    const firstName = await this.encrypt(userData.firstName);
    const lastName = await this.encrypt(userData.lastName);
    const password = await this.encrypt(userData.password);
    const dateOfBirth = await this.encrypt(userData.dateOfBirth);
    const sex = await this.encrypt(userData.sex);

    const userExists = await this.findUser(email);
    if (userExists) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const verificationId = this.generateVerificationId();

    try {
      await this.emailingService.sendVerificationEmail(
        userData.email,
        verificationId,
        'Verify Email',
        'email-confirmation',
      );
    } catch (error) {
      throw new HttpException(
        'Not successful. Our email portal is currently down. Try again later',
        HttpStatus.BAD_REQUEST,
      );
    }

    //We want the first user to be admin

    await this.prismaService.user.create({
      data: {
        email,
        firstName,
        lastName,
        password,
        verificationId,
        dateOfBirth,
        sex,
      },
    });

    return { message: 'User created', statusCode: HttpStatus.CREATED };
  }

  async login(userData: LoginUserDTO, response: Response) {
    const email = await this.encrypt(userData.email);
    const password = await this.encrypt(userData.password);

    const user = await this.findUser(email);

    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.UNAUTHORIZED);
    }
    const isPassword = user.password === password;
    if (!user || !isPassword) {
      throw new HttpException(
        'Wrong email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.isEmailVerified) {
      throw new HttpException(
        'Your email is not verified',
        HttpStatus.FORBIDDEN,
      );
    }

    //get decrypted data
    const dEmail = await this.decrypt(email);
    const dFirstName = await this.decrypt(user.firstName);
    const dLastName = await this.decrypt(user.lastName);

    const payload = {
      role: user.role,
      email: dEmail,
      sub: user.id,
      firstName: dFirstName,
      lastName: dLastName,
    };

    const token = {
      role: user.role,
      access_token: this.jwtService.sign(payload, {
        expiresIn: process.env.JWT_EXPIRATION,
        secret: process.env.JWT_SECRET,
      }),
    };

    response.cookie('auth-cookie', token, {
      httpOnly: true,
      maxAge: 28800000,
      path: '/',
      secure: true,
      sameSite: 'none',
    });

    return { message: user.role, statusCode: HttpStatus.CREATED };
  }

  async verifyUserEmail(email: string, verificationId: string) {
    const eEmail = await this.encrypt(email);
    const user = await this.findUser(eEmail);
    const isIdValid = user.verificationId === verificationId;
    if (!user || !isIdValid) {
      throw new UnauthorizedException('Access Denied');
    }
    await this.updateUser({
      email: eEmail,
      verificationId: '',
      isEmailVerified: true,
    });
    return 'User email has been verified';
  }

  async verifyUser(email: string) {
    const eEmail = await this.encrypt(email);
    const user = await this.findUser(eEmail);
    const verificationId = this.generateVerificationId();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.updateUser({
      email: eEmail,
      verificationId,
    });
    await this.emailingService.sendVerificationEmail(
      email,
      verificationId,
      'Change Password',
      'change-password',
    );
    return 'Check your email to change your password';
  }

  async updatePassword(
    email: string,
    password: string,
    verificationId: string,
  ) {
    const ePassword = await this.encrypt(password);
    const eEmail = await this.encrypt(email);

    const user = await this.findUser(eEmail);
    const isIdValid = user.verificationId === verificationId;
    if (!user || !isIdValid) {
      throw new UnauthorizedException('Access denied');
    }
    await this.updateUser({
      email: eEmail,
      verificationId: '',
      password: ePassword,
      isEmailVerified: true,
    });
    return { msg: 'Password has been successfully updated' };
  }

  //Healper functions below

  async findUser(email: string) {
    return await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async updateUser({
    email,
    verificationId,
    isEmailVerified,
    password,
  }: {
    email: string;
    verificationId?: string;
    isEmailVerified?: boolean;
    password?: string;
  }) {
    return await this.prismaService.user.update({
      where: {
        email,
      },
      data: {
        verificationId,
        password,
        isEmailVerified,
      },
    });
  }
  generateVerificationId() {
    return randomBytes(40).toString('hex');
  }
  async decrypt(data: string) {
    return await this.encryptionService.getDecyptedText(data);
  }
  async encrypt(data: string) {
    return await this.encryptionService.getEncryptedText(data);
  }
}
