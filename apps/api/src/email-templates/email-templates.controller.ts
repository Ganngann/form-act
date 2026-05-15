import { Controller, Get, Body, Patch, Post, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { EmailTemplatesService } from "./email-templates.service";
import { UpdateEmailTemplateDto } from "./dto/update-email-template.dto";
import { SendTestEmailDto } from "./dto/send-test-email.dto";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("email-templates")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class EmailTemplatesController {
  constructor(private readonly emailTemplatesService: EmailTemplatesService) {}

  @Get()
  @Roles("ADMIN")
  findAll() {
    return this.emailTemplatesService.findAll();
  }

  @Get(":type")
  @Roles("ADMIN")
  findOne(@Param("type") type: string) {
    return this.emailTemplatesService.findOne(type);
  }

  @Post(":type")
  @Roles("ADMIN")
  update(
    @Param("type") type: string,
    @Body() updateDto: UpdateEmailTemplateDto,
  ) {
    return this.emailTemplatesService.update(type, updateDto);
  }

  @Post(":type/test")
  @Roles("ADMIN")
  sendTest(
    @Param("type") type: string,
    @Body() testDto: SendTestEmailDto,
  ) {
    return this.emailTemplatesService.sendTestEmail(type, testDto);
  }
}
