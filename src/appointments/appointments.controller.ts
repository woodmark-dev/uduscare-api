import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { User } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppointmentBody } from './dto/createApDTO';

@Controller('appointments')
export class AppointmentsController {
  constructor(private service: AppointmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  async add(@Body() appointment: AppointmentBody, @User() user) {
    return await this.allowOnlyUser(
      user.role,
      this.service.addAppointment({
        ...appointment,
        userId: user.userId,
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('get-times')
  async getTimes(
    @Body() appointmentDate: { appointmentDate: string },
    @User() user,
  ) {
    return await this.allowOnlyUser(
      user.role,
      this.service.getAppointmentTimes(appointmentDate.appointmentDate),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('get-pending')
  async getPending(@Body() arg: { arg: number }, @User() user) {
    return await this.allowOnlyUser(
      user.role,
      this.service.getPendingAppointments(arg.arg, user.userId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('get-user-completed')
  async getUserComplete(@Body() arg: { arg: number }, @User() user) {
    return await this.allowOnlyUser(
      user.role,
      this.service.getUserCompletedAppointments(arg.arg, user.userId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-incompleted')
  async getInCompleted(
    @Query('arg', ParseIntPipe) arg: number,
    @Query('id') id: number | undefined,
    @User() user,
  ) {
    if (user.role === 'Doctor') {
      return this.service.getInCompleted(arg, +id);
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-test-appointments')
  async getTestAppointments(
    @Query('arg', ParseIntPipe) arg: number,
    @Query('id') id: number | undefined,
    @User() user,
  ) {
    if (user.role === 'Test') {
      return this.service.getTestAppointments(arg, id);
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-pharmacy-appointments')
  async getPharmacyAppointments(
    @Query('arg', ParseIntPipe) arg: number,
    @Query('id') id: number | undefined,
    @User() user,
  ) {
    if (user.role === 'Pharmacy') {
      return this.service.getPharmacyAppointments(arg, id);
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-completed-appointments')
  async getCompletedAppointments(
    @Query('arg', ParseIntPipe) arg: number,
    @Query('id') id: number | undefined,
    @User() user,
  ) {
    if (user.role === 'Pharmacy' || 'Doctor' || 'Test') {
      return this.service.getCompletedAppointments(arg, id);
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-test')
  async updateTest(
    @User() user,
    @Body() data: { id: number; testDetails: string },
  ) {
    if (user.role === 'Doctor') {
      return this.service.transferToTest(data);
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-pharmacy')
  async updatePharmacy(
    @User() user,
    @Body() data: { id: number; pharmacyDetail: string },
  ) {
    if (user.role === 'Doctor') {
      return this.service.transferToPharmacy(data);
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('mark-completed')
  async markCompleted(@User() user, @Body() data: { id: number }) {
    if (user.role === 'Doctor' || 'Pharmacy') {
      return this.service.markAsCompleted(data);
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('record-test')
  async recordTest(
    @User() user,
    @Body()
    data: {
      id: number;
      testResults: string;
    },
  ) {
    if (user.role === 'Test') {
      return this.service.transferToDoctor(data);
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('delete')
  async deleteAppointment(@Query('id', ParseIntPipe) id: number) {
    return await this.service.deleteAppointment(id);
  }

  async allowOnlyAdmin(role, callback) {
    if (role === 'Admin') {
      return await callback;
    } else {
      throw new UnauthorizedException();
    }
  }

  async allowOnlyUser(role, callback) {
    if (role === 'User') {
      return await callback;
    } else {
      throw new UnauthorizedException();
    }
  }
}
