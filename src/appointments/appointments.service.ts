/* eslint-disable prettier/prettier */
import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApDTO } from './dto/createApDTO';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private prismaService: PrismaService,
    private encryption: EncryptionService,
  ) { }

  //User level
  //Adding appointments
  async addAppointment(appmt: CreateApDTO) {
    try {
      //Encrypt the data
      const department = await this.encrypt(appmt.department);
      const appointmentTime = await this.encrypt(appmt.appointmentTime);
      const actualDate = await this.encrypt(appmt.actualDate);
      const description = await this.encrypt(appmt.description);

      await this.prismaService.dates.upsert({
        where: { appointmentDate: actualDate },
        update: {},
        create: { appointmentDate: actualDate },
      });

      await this.prismaService.appointments.create({
        data: {
          userId: appmt.userId,
          actualDate,
          appointmentTime,
          description,
          department,
        },
      });

      //Save data in the database
      return { msg: 'Appointment successfully created' };
    } catch (error) {
      console.log(error);
      return { err: 'Appointment could not be created' };
    }
  }

  async getAppointmentTimes(appointmentDate: string) {
    const realTime = await this.encrypt(appointmentDate);
    try {
      const times = await this.prismaService.dates.findUnique({
        where: { appointmentDate: realTime },
        select: {
          appointments: {
            select: {
              appointmentTime: true,
            },
          },
        },
      });

      if (!times) {
        return { message: { allTimes: [] }, statusCode: HttpStatus.OK };
      }

      const allTimes = await Promise.all(
        times.appointments.map(
          async (time) => await this.decrypt(time.appointmentTime),
        ),
      );

      return { message: { allTimes }, statusCode: HttpStatus.OK };
    } catch (error) {
      return { err: 'Some' };
    }
  }

  //User pending appointments
  async getPendingAppointments(arg: number, userId: string) {
    return await this.getUserAppointments(arg, userId, false);
  }

  //User completed Appointments
  async getUserCompletedAppointments(arg: number, userId: string) {
    return await this.getUserAppointments(arg, userId, true);
  }

  //Delete aappointment
  async deleteAppointment(id: number) {
    try {
      await this.prismaService.appointments.delete({ where: { id } });
      return { msg: 'Appointment has been deleted' };
    } catch (error) {
      return { error: 'Appointment could not be deleted' };
    }
  }

  //Admin Level

  async getInCompleted(arg: number, id: number | undefined) {
    return await this.getAdminAppointments(arg, id, 'Doctor Appointment');
  }

  //transfer to test
  async transferToTest({
    id,
    testDetails,
  }: {
    id: number;
    testDetails: string;
  }) {
    return await this.updateAppointments(id, {
      testDetails,
      stage: 'Test Appointment',
      completed: true,
    });
  }

  //transfer to pharmacy
  async transferToPharmacy({
    id,
    pharmacyDetail,
  }: {
    id: number;
    pharmacyDetail: string;
  }) {
    return await this.updateAppointments(id, {
      pharmacyDetail,
      completed: true,
      pharmacy: true,
      stage: 'Pharmacy Appointment',
    });
  }

  //transfer back to doctor Appointments
  async transferToDoctor({
    id,
    testResults,
  }: {
    id: number;
    testResults: string;
  }) {
    return await this.updateAppointments(id, {
      testResults,
      test: true,
      stage: 'Doctor Appointment',
    });
  }

  //Mark as completed
  async markAsCompleted({ id }: { id: number }) {
    return await this.updateAppointments(id, {
      completed: true,
      stage: 'Completed',
    });
  }

  //Get tests Appointments
  async getTestAppointments(arg: number, id: number | undefined) {
    return await this.getAdminAppointments(arg, id, 'Test Appointment');
  }

  //Get all pharmacy Appointments
  async getPharmacyAppointments(arg: number, id: number | undefined) {
    return await this.getAdminAppointments(arg, id, 'Pharmacy Appointment');
  }

  //Get completed Appointments
  async getCompletedAppointments(arg: number, id: number | undefined) {
    return await this.getAdminAppointments(arg, id, 'Completed');
  }

  //Helper Functions Below

  async decrypt(data: string) {
    return await this.encryption.getDecyptedText(data);
  }
  async encrypt(data: string) {
    return await this.encryption.getEncryptedText(data);
  }

  //decrypting a list of encrypted Appointments
  async decryptABunch(theBunch) {
    return await Promise.all(
      theBunch.map(async (appointment) => {
        appointment.appointmentTime = await this.decrypt(
          appointment.appointmentTime,
        );
        appointment.actualDate = await this.decrypt(appointment.actualDate);
        appointment.department = await this.decrypt(appointment.department);
        appointment.description = await this.decrypt(appointment.description);
        if (appointment.user) {
          appointment.user.firstName = await this.decrypt(
            appointment.user.firstName,
          );
          appointment.user.lastName = await this.decrypt(
            appointment.user.lastName,
          );
          appointment.user.dateOfBirth = await this.decrypt(
            appointment.user.dateOfBirth,
          );
          appointment.user.sex = await this.decrypt(appointment.user.sex);
        }

        return appointment;
      }),
    );
  }

  async getAppointmentsById(id: number) {
    return await this.prismaService.appointments.findMany({
      where: { id: +id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            sex: true,
          },
        },
      },
    });
  }

  async getAppointmentsByStage(stage: string, arg: number) {
    return await this.prismaService.appointments.findMany({
      skip: arg === 0 ? 0 : arg * 5,
      take: 5,
      where: { stage },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            sex: true,
          },
        },
      },
    });
  }

  async getAdminAppointments(
    arg: number,
    id: number | undefined,
    stage: string,
  ) {
    try {
      if (id) {
        const appointment = await this.getAppointmentsById(id);
        return {
          message: {
            appts: await this.decryptABunch(appointment),
            totalAppointments: 1,
          },
          statusCode: HttpStatus.OK,
        };
      }
      const appointmentNos = await this.prismaService.appointments.findMany({
        where: { stage },
      });
      const encrptedAppointments = await this.getAppointmentsByStage(
        stage,
        arg,
      );

      const nos = appointmentNos.length;

      return {
        message: {
          appts: await this.decryptABunch(encrptedAppointments),
          totalAppointments: nos,
        },
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException('Not Found', HttpStatus.BAD_REQUEST);
    }
  }

  async updateAppointments(id, data) {
    try {
      await this.prismaService.appointments.update({
        where: {
          id,
        },
        data,
      });
      return { message: `${data.stage} recoreded`, statusCode: HttpStatus.OK };
    } catch (error) {
      return { error: `${data.stage} could not be updated` };
    }
  }

  async getUserAppointments(arg: number, userId: string, completed: boolean) {
    try {
      const appointmentNos = await this.prismaService.appointments.findMany({
        where: { userId, completed },
      });
      const appointments = await this.prismaService.appointments.findMany({
        skip: arg === 0 ? 0 : arg * 5,
        take: 5,
        where: { userId, completed },
      });

      const allAppointments = await this.decryptABunch(appointments);

      const nos = appointmentNos.length;

      return {
        message: { allAppointments, totalAppointments: nos },
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      return { error: 'An Error occured' };
    }
  }
}
