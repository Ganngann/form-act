import { Test, TestingModule } from "@nestjs/testing";
import { ClientsController } from "./clients.controller";
import { ClientsService } from "./clients.service";
import { ForbiddenException } from "@nestjs/common";

describe("ClientsController", () => {
  let controller: ClientsController;
  let service: ClientsService;

  const mockClientsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
    service = module.get<ClientsService>(ClientsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all clients if user is ADMIN", async () => {
      const clients = [{ id: "1", name: "Client 1" }];
      mockClientsService.findAll.mockResolvedValue(clients);
      const req = { user: { role: "ADMIN" } };

      const result = await controller.findAll(req);

      expect(result).toEqual(clients);
      expect(service.findAll).toHaveBeenCalled();
    });

    it("should throw ForbiddenException if user is not ADMIN", async () => {
      const req = { user: { role: "TRAINER" } };

      await expect(controller.findAll(req)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("findOne", () => {
    it("should allow ADMIN", async () => {
      mockClientsService.findOne.mockResolvedValue({ id: "1" });
      await controller.findOne({ user: { role: "ADMIN" } }, "1");
      expect(service.findOne).toHaveBeenCalledWith("1");
    });

    it("should deny non-ADMIN", async () => {
      await expect(
        controller.findOne({ user: { role: "CLIENT" } }, "1"),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("update", () => {
    it("should allow ADMIN", async () => {
      mockClientsService.updateById.mockResolvedValue({ id: "1" });
      await controller.update(
        { user: { role: "ADMIN", email: "a@a.be" } },
        "1",
        { companyName: "New", vatNumber: "123", address: "Addr" },
      );
      expect(service.updateById).toHaveBeenCalledWith(
        "1",
        { companyName: "New", vatNumber: "123", address: "Addr" },
        "ADMIN (a@a.be)",
      );
    });

    it("should deny non-ADMIN", async () => {
      await expect(
        controller.update({ user: { role: "CLIENT" } }, "1", {
          companyName: "A",
          vatNumber: "B",
          address: "C",
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
