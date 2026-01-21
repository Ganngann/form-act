import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from './pdf.service';

const mockPDFDocumentInstance = {
  on: jest.fn().mockImplementation((event, callback) => {
    if (event === 'end') {
      callback();
    }
    return mockPDFDocumentInstance;
  }),
  fontSize: jest.fn().mockReturnThis(),
  text: jest.fn().mockReturnThis(),
  moveDown: jest.fn().mockReturnThis(),
  moveTo: jest.fn().mockReturnThis(),
  lineTo: jest.fn().mockReturnThis(),
  stroke: jest.fn().mockReturnThis(),
  rect: jest.fn().mockReturnThis(),
  end: jest.fn(),
};

jest.mock('pdfkit', () => {
  return {
    __esModule: true,
    default: jest.fn(() => mockPDFDocumentInstance),
  };
});

describe('PdfService', () => {
  let service: PdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfService],
    }).compile();

    service = module.get<PdfService>(PdfService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a PDF buffer', async () => {
    const mockSession = {
      date: new Date(),
      formation: { title: 'Test Formation' },
      trainer: { firstName: 'John', lastName: 'Doe' },
      client: { companyName: 'ACME', address: '123 St' },
      participants: JSON.stringify([{ name: 'Alice' }, { name: 'Bob' }]),
    } as any;

    const buffer = await service.generateAttendanceSheet(mockSession);
    expect(buffer).toBeInstanceOf(Buffer);
  });

  it('should handle missing participants gracefully', async () => {
    const mockSession = {
      date: new Date(),
      formation: { title: 'Test Formation' },
      trainer: { firstName: 'John', lastName: 'Doe' },
      client: { companyName: 'ACME' },
      participants: null,
    } as any;

    const buffer = await service.generateAttendanceSheet(mockSession);
    expect(buffer).toBeInstanceOf(Buffer);
  });
});
