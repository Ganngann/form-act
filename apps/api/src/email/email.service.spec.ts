import { Test, TestingModule } from "@nestjs/testing";
import { EmailService } from "./email.service";
import { Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";

jest.mock("nodemailer");

describe("EmailService", () => {
  let service: EmailService;
  let sendMailMock: jest.Mock;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    sendMailMock = jest.fn();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
    // Spy on logger
    loggerErrorSpy = jest.spyOn(Logger.prototype, "error").mockImplementation();
    jest.spyOn(Logger.prototype, "log").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("sendEmail", () => {
    it("should send an email", async () => {
      sendMailMock.mockResolvedValue({ messageId: "123" });
      await service.sendEmail("to@test.com", "Subject", "<p>Hi</p>");
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "to@test.com",
          subject: "Subject",
          html: "<p>Hi</p>",
        }),
      );
    });

    it("should throw error if sending fails", async () => {
      sendMailMock.mockRejectedValue(new Error("Fail"));
      await expect(
        service.sendEmail("to@test.com", "Subject", "Body"),
      ).rejects.toThrow("Fail");
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to send email to"),
        expect.anything(),
      );
    });
  });

  describe("sendEmailWithAttachments", () => {
    it("should send email with attachments", async () => {
      sendMailMock.mockResolvedValue({ messageId: "123" });
      const attachments = [{ filename: "test.pdf", content: "data" }];
      await service.sendEmailWithAttachments(
        "to@test.com",
        "Subject",
        "Body",
        attachments,
      );
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments,
        }),
      );
    });

    it("should throw error if sending fails with empty attachments", async () => {
      sendMailMock.mockRejectedValue(new Error("Fail"));
      await expect(
        service.sendEmailWithAttachments("to@test.com", "S", "B", []),
      ).rejects.toThrow("Fail");
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to send email to"),
        expect.anything(),
      );
    });

    it("should throw error if sending fails with attachments", async () => {
      const attachments = [{ filename: "test.pdf", content: "data" }];
      sendMailMock.mockRejectedValue(new Error("Fail"));
      await expect(
        service.sendEmailWithAttachments("to@test.com", "S", "B", attachments),
      ).rejects.toThrow("Fail");
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to send email with attachments to"),
        expect.anything(),
      );
    });
  });
});
