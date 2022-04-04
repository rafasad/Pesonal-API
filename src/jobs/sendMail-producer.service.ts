import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

export interface sendMailForgot {
  email: string;
  name: string;
  token_password: string;
}

export interface sendMailWelcome {
  email: string;
  name: string;
  teacher: {
    email: string;
    name: string;
  };
}

@Injectable()
class SendMailProducerService {
  constructor(@InjectQueue('sendMail-queue') private queue: Queue) {}

  async sendMailForgotPassword({
    email,
    name,
    token_password,
  }: sendMailForgot) {
    await this.queue.add('forgotPassword-job', {
      email,
      name,
      token_password,
    });
  }

  async sendMailWelcome({ email, name, teacher }: sendMailWelcome) {
    await this.queue.add('welcome-job', {
      email,
      name,
      teacher,
    });
  }
}

export { SendMailProducerService };
