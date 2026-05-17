import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { EmailTemplate } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateEmailTemplateDto } from "./dto/update-email-template.dto";
import { SendTestEmailDto } from "./dto/send-test-email.dto";
import { EmailService } from "../email/email.service";

@Injectable()
export class EmailTemplatesService {
  private readonly logger = new Logger(EmailTemplatesService.name);
  private readonly templateCache = new Map<string, EmailTemplate>();
  private readonly pendingRequests = new Map<string, Promise<EmailTemplate>>();

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
    const template = this.templateCache.get(type);
    if (template) return template;

    let pending = this.pendingRequests.get(type);
    if (pending) return pending;

    pending = (async () => {
      try {
        const result = await this.prisma.emailTemplate.findUnique({
          where: { type },
        });
        if (!result) {
          throw new NotFoundException(`Email template ${type} not found`);
        }
        this.templateCache.set(type, result);
        return result;
      } finally {
        this.pendingRequests.delete(type);
      }
    })();

    this.pendingRequests.set(type, pending);
    return pending;
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
      this.templateCache.set(type, updated);
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
    let template;
    try {
      template = await this.findOne(type);
    } catch (e) {
      if (e instanceof NotFoundException) {
        this.logger.warn(
          `Email template ${type} not found, using fallback or throwing error.`,
        );
      }
      throw e;
    }

    let subject = template.subject;
    let body = template.body;

    // Fast, single-pass variable replacement: {{variableName}}
    const replacer = (match: string, key: string) => {
      if (!Object.prototype.hasOwnProperty.call(variables, key)) {
        return match; // Leave untouched if not in variables map
      }
      const val = variables[key];
      return val === null || val === undefined ? "" : String(val);
    };

    subject = subject.replace(/{{(.+?)}}/g, replacer);
    body = body.replace(/{{(.+?)}}/g, replacer);

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
