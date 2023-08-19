import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { EncryptionService } from '../encryption/encryption.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  imports: [PrismaModule, EncryptionModule],
  providers: [
    AppointmentsService,
    PrismaService,
    EncryptionService,
    JwtStrategy,
  ],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}
