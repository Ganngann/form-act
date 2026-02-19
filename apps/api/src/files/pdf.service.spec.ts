import { Test, TestingModule } from "@nestjs/testing";
import { PdfService, SessionWithRelations } from "./pdf.service";

// Mock the PDFDocument class
const mockPDFDocumentInstance: any = {
  on: jest.fn(),
  fontSize: jest.fn().mockReturnThis(),
  font: jest.fn().mockReturnThis(),
  text: jest.fn().mockReturnThis(),
  moveDown: jest.fn().mockReturnThis(),
  moveTo: jest.fn().mockReturnThis(),
  lineTo: jest.fn().mockReturnThis(),
  stroke: jest.fn().mockReturnThis(),
  strokeColor: jest.fn().mockReturnThis(),
  lineWidth: jest.fn().mockReturnThis(),
  rect: jest.fn().mockReturnThis(),
  addPage: jest.fn().mockReturnThis(),
  end: jest.fn(),
  page: { height: 800 },
  y: 100,
};

// Mock implementation of on('data') and on('end') to simulate stream behavior
mockPDFDocumentInstance.on.mockImplementation(
  (event: string, callback: any) => {
    if (event === "data") {
      // Simulate some data
      callback(Buffer.from("pdf-data"));
    }
    if (event === "end") {
      // Simulate end of stream immediately for test
      setTimeout(callback, 0);
    }
    return mockPDFDocumentInstance;
  },
);

jest.mock("pdfkit", () => {
  return {
    __esModule: true,
    default: jest.fn(() => mockPDFDocumentInstance),
  };
});

describe("PdfService", () => {
  let service: PdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfService],
    }).compile();

    service = module.get<PdfService>(PdfService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should generate a PDF buffer with full data", async () => {
    const mockSession = {
      date: new Date(),
      slot: "AM",
      formation: { title: "Test Formation" },
      trainer: { firstName: "John", lastName: "Doe" },
      client: {
        companyName: "ACME",
        address: "123 St",
        user: { name: "Contact" },
      },
      participants: JSON.stringify([
        { firstName: "Alice", lastName: "Smith" },
        { email: "bob@test.com" },
      ]),
      location: "Paris",
    } as unknown as SessionWithRelations;

    const buffer = await service.generateAttendanceSheet(mockSession);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(mockPDFDocumentInstance.text).toHaveBeenCalledWith(
      expect.stringContaining("Feuille d'émargement"),
      expect.any(Object),
    );
    expect(mockPDFDocumentInstance.text).toHaveBeenCalledWith(
      expect.stringContaining("John Doe"),
      expect.any(Number),
      expect.any(Number),
      expect.any(Object),
    );
  });

  it("should handle missing participants gracefully", async () => {
    const mockSession = {
      date: new Date(),
      slot: "PM",
      formation: { title: "Test Formation" },
      trainer: null, // No trainer
      client: { companyName: "ACME", user: {} },
      participants: null,
    } as unknown as SessionWithRelations;

    const buffer = await service.generateAttendanceSheet(mockSession);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(mockPDFDocumentInstance.text).toHaveBeenCalledWith(
      expect.stringContaining("Non assigné"),
      expect.any(Number),
      expect.any(Number),
      expect.any(Object),
    );
  });

  it("should handle large list of participants (pagination)", async () => {
    const participants = Array(30)
      .fill(0)
      .map((_, i) => ({ name: `User ${i}` }));

    const mockSession = {
      date: new Date(),
      formation: { title: "Long List" },
      trainer: null,
      client: null,
      participants: JSON.stringify(participants),
    } as unknown as SessionWithRelations;

    const buffer = await service.generateAttendanceSheet(mockSession);
    expect(buffer).toBeInstanceOf(Buffer);
  });
});
