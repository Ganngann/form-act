import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

@Injectable()
export class EmailTemplatesService {
  private readonly logger = new Logger(EmailTemplatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.emailTemplate.findMany({
      orderBy: { type: 'asc' },
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
    // Ensure exists
    await this.findOne(type);

    return this.prisma.emailTemplate.update({
      where: { type },
      data: updateDto,
    });
  }

  async getRenderedTemplate(type: string, variables: Record<string, any>) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { type },
    });

    if (!template) {
      this.logger.warn(`Email template ${type} not found, using fallback or throwing error.`);
      // Depending on requirement, we could have hardcoded fallbacks here or throw.
      // For now, let's throw to ensure templates are seeded.
      throw new NotFoundException(`Email template ${type} not found`);
    }

    let subject = template.subject;
    let body = template.body;

    // Simple variable replacement: {{variableName}}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      const val = value === null || value === undefined ? '' : String(value);
      subject = subject.replace(regex, val);
      body = body.replace(regex, val);
    }

    return { subject, body };
  }
}
