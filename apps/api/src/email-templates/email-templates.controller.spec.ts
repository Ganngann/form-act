import { Test, TestingModule } from "@nestjs/testing";
import { EmailTemplatesController } from "./email-templates.controller";
import { EmailTemplatesService } from "./email-templates.service";

describe("EmailTemplatesController", () => {
  let controller: EmailTemplatesController;
  let service: EmailTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailTemplatesController],
      providers: [
        {
          provide: EmailTemplatesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            sendTestEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EmailTemplatesController>(EmailTemplatesController);
    service = module.get<EmailTemplatesService>(EmailTemplatesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all templates", async () => {
      const result = [{ type: "TEST" }] as unknown as any;
      jest.spyOn(service, "findAll").mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe("findOne", () => {
    it("should return a template", async () => {
      const result = { type: "TEST" } as unknown as any;
      jest.spyOn(service, "findOne").mockResolvedValue(result);

      expect(await controller.findOne("TEST")).toBe(result);
    });
  });

  describe("update", () => {
    it("should update a template", async () => {
      const result = { type: "TEST" } as unknown as any;
      jest.spyOn(service, "update").mockResolvedValue(result);

      expect(await controller.update("TEST", {})).toBe(result);
    });
  });

  describe("sendTest", () => {
    it("should send a test email", async () => {
      const result = { success: true };
      jest.spyOn(service, "sendTestEmail").mockResolvedValue(result);

      expect(await controller.sendTest("TEST", { email: "test@example.com" })).toBe(result);
    });
  });
});
