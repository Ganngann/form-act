import { Test, TestingModule } from "@nestjs/testing";
import { CalendarService } from "./calendar.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

describe("CalendarService", () => {
  let service: CalendarService;

  const mockPrismaService = {
    formateur: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("generateIcs", () => {
    it("should generate ICS content", async () => {
      mockPrismaService.formateur.findUnique.mockResolvedValue({
        firstName: "John",
        lastName: "Doe",
        sessions: [
          {
            date: new Date("2023-01-01"),
            slot: "AM",
            location: "Brussels",
            client: { companyName: "Acme", address: "Rue 1" },
            formation: { title: "JS" },
            logistics: JSON.stringify({ projector: "needed" }),
          },
          {
            date: new Date("2023-01-02"),
            slot: "PM",
            formation: { title: "TS" },
            logistics: "simple string",
          },
          {
            date: new Date("2023-01-03"),
            slot: "ALL_DAY",
          },
          {
            date: new Date("2023-01-04"),
            slot: "UNKNOWN",
          },
        ],
      });

      const ics = await service.generateIcs("valid-token");
      expect(ics).toContain("BEGIN:VCALENDAR");
      expect(ics).toContain("SUMMARY:Formation: JS");
      expect(ics).toContain("DESCRIPTION:Client: Acme");
      // iCal wraps long lines, so we might not find the full string in one line
      // checking parts or normalizing would be better, but for now we check segments if broken
      // or just assume if it contains "Logistique" and "projector" it's likely fine.
      // But let's check normalized content for robustness if we could,
      // here we will just relax the check to be safer against line folding.
      expect(ics).toContain("Logistique");
      // "projector" might be split by line folding "proje \n ctor"
      expect(ics.replace(/\s+/g, "")).toContain("projector");
      // "Logistique: simple string" might be split too
      expect(ics.replace(/\s+/g, "")).toContain("Logistique:simplestring");
    });

    it("should throw NotFoundException if token invalid", async () => {
      mockPrismaService.formateur.findUnique.mockResolvedValue(null);
      await expect(service.generateIcs("invalid")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
