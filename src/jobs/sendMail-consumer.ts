import { MailerService } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { sendMailForgot, sendMailWelcome } from './sendMail-producer.service';

@Processor('sendMail-queue')
class SendMailConsumer {
  constructor(private mailService: MailerService) {}

  @Process('forgotPassword-job')
  async forgotPasswordjob(job: Job<sendMailForgot>) {
    const { data } = job;

    await this.mailService.sendMail({
      to: data.email,
      from: 'Equipe Personal APP <noreply@personalapp.com.br>',
      subject: 'Recuperação de senha',
      text: `Olá ${data.name}, seu token de recuração é o: ${data.token_password}`,
    });
  }

  @Process('welcome-job')
  async welcomejob(job: Job<sendMailWelcome>) {
    const { data } = job;

    await this.mailService.sendMail({
      to: data.email,
      from: `${data.teacher.name} <${data.teacher.email}>`,
      subject: 'Seja bem vindo!!',
      text: `Olá ${data.name}, obrigado por se cadastrar na minha plataforma. Seja bem vindo ! Grande abraço ${data.teacher.name}`,
    });
  }
}

export { SendMailConsumer };
