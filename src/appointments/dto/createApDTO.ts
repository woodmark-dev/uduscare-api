/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty } from 'class-validator';

export class AppointmentBody {
  @IsNotEmpty()
  @IsString()
  department: string;

  @IsNotEmpty()
  @IsString()
  actualDate: string;

  @IsNotEmpty()
  @IsString()
  appointmentTime: string;

  description: string;
}

export class CreateApDTO extends AppointmentBody {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
