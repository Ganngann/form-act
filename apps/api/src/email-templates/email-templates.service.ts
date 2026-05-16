import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateEmailTemplateDto } from "./dto/update-email-template.dto";
import { SendTestEmailDto } from "./dto/send-test-email.dto";
import { EmailService } from "../email/email.service";

@Injectable()
export class EmailTemplatesService {
  private readonly logger = new Logger(EmailTemplatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async findAll() {
    return this.prisma.emailTemplate.findMany({
      orderBy: { type: "asc" },
    });
  }

  async findOne(type: string) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { type },
    });
    if (!template) {
      throw new NotFoundException(`Email template ${type} not found`);
    }
    return template;
  }

  async update(type: string, updateDto: UpdateEmailTemplateDto) {
    this.logger.log(`Updating email template: ${type}`);
    // Ensure exists
    await this.findOne(type);

    try {
      const updated = await this.prisma.emailTemplate.update({
        where: { type },
        data: updateDto,
      });
      this.logger.log(`Successfully updated email template: ${type}`);
      return updated;
    } catch (error) {
      this.logger.error(
        `Failed to update email template: ${type}`,
        error.stack,
      );
      throw error;
    }
  }

  async getRenderedTemplate(type: string, variables: Record<string, any>) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { type },
    });

    if (!template) {
      this.logger.warn(
        `Email template ${type} not found, using fallback or throwing error.`,
      );
      // Depending on requirement, we could have hardcoded fallbacks here or throw.
      // For now, let's throw to ensure templates are seeded.
      throw new NotFoundException(`Email template ${type} not found`);
    }

    let subject = template.subject;
    let body = template.body;

    // Simple variable replacement: {{variableName}}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      const val = value === null || value === undefined ? "" : String(value);
      subject = subject.replace(regex, val);
      body = body.replace(regex, val);
    }

    return { subject, body };
  }

  async sendTestEmail(type: string, dto: SendTestEmailDto) {
    this.logger.log(`Sending test email for template: ${type} to ${dto.email}`);

    let subject = dto.subject;
    let body = dto.body;

    // If not provided in request, use the one from DB
    if (!subject || !body) {
      const template = await this.findOne(type);
      subject = subject || template.subject;
      body = body || template.body;
    }

    // Replace variables with mock values
    // To make it look like a real template, we'll replace the {{variables}} with [Variable]
    const templateRecord = await this.findOne(type);
    let variablesList: string[] = [];
    if (templateRecord.variables) {
      try {
        variablesList = JSON.parse(templateRecord.variables);
      } catch (e) {
        variablesList = [];
      }
    }

    for (const variable of variablesList) {
      const regex = new RegExp(`{{${variable}}}`, "g");
      subject = subject.replace(regex, `[${variable}]`);
      body = body.replace(regex, `[${variable}]`);
    }

    // Also catch any remaining {{anything}} just in case
    subject = subject.replace(/{{.+?}}/g, "[Test]");
    body = body.replace(/{{.+?}}/g, "[Test]");

    await this.emailService.sendEmail(dto.email, subject, body);

    return { success: true };
  }
}
