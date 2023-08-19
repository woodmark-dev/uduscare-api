import { Injectable } from '@nestjs/common';
import { sendEmail } from './config/emailing.config';

const frontendUrl = 'https://udus-care.vercel.app/';

@Injectable()
export class EmailingService {
  async sendVerificationEmail(
    receiverEmail: string,
    verificationID: string,
    subject: string,
    pathname: string,
  ) {
    //change content to match need
    const content = `<p>Click the link to ${subject}:</p> <a href="${frontendUrl}/${pathname}?email=${receiverEmail}&verificationId=${verificationID}">${subject}</a>`;
    return await sendEmail(receiverEmail, content, subject);
  }
  //create a function around the content to specify the usecase
}
