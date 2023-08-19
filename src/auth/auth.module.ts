import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailingModule } from '../emailing/emailing.module';
import { EmailingService } from '../emailing/emailing.service';
import { EncryptionModule } from '../encryption/encryption.module';
import { EncryptionService } from '../encryption/encryption.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({}),
    EmailingModule,
    EncryptionModule,
  ],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    EmailingService,
    EncryptionService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
