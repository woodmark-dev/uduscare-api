import { Controller, Post, Body, UseGuards, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
// import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './decorators/user.decorator';

@Controller('auth')
export class AuthController {
  // eslint-disable-next-line prettier/prettier
  constructor(private authService: AuthService) { }

  //Signs up with username and password
  @Post('signup')
  async signUp(@Body() user: CreateUserDTO) {
    return await this.authService.signUp(user);
  }

  //Login with username and password
  // @UseGuards(JwtAuthGuard)
  @Post('login')
  async login(
    @Body() userData: LoginUserDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.login(userData, response);
  }

  @Post('verify-email')
  async verifyUserEmail(
    @Body() data: { email: string; verificationId: string },
  ) {
    return await this.authService.verifyUserEmail(
      data.email,
      data.verificationId,
    );
  }

  @Post('forgot-password')
  async verifyUser(@Body() detail: { email: string }) {
    return await this.authService.verifyUser(detail.email);
  }

  @Post('change-password')
  async changePassword(
    @Body() data: { email: string; password: string; verificationId: string },
  ) {
    return await this.authService.updatePassword(
      data.email,
      data.password,
      data.verificationId,
    );
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('auth-cookie');
    return { msg: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-user')
  test(@User() user) {
    return { message: user, statusCode: 200 };
  }

  @Get('test')
  testing() {
    return { message: 'hello world' };
  }
}
