import { Test, TestingModule } from "@nestjs/testing";
import { EmailService } from "./email.service";
import * as nodemailer from "nodemailer";

// Mock nodemailer
jest.mock("nodemailer");
const sendMailMock = jest.fn().mockResolvedValue({ messageId: "123" });
(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: sendMailMock,
});

describe("EmailService", () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should send an email", async () => {
    await service.sendEmail("test@example.com", "Subject", "<p>Hello</p>");
    expect(sendMailMock).toHaveBeenCalledWith({
      from: expect.any(String),
      to: "test@example.com",
      subject: "Subject",
      html: "<p>Hello</p>",
    });
  });
});
