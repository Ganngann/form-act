import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./app.module";
import { PrismaService } from "./prisma/prisma.service";

describe("Global Validation Security", () => {
  let app: INestApplication;

  const mockPrismaService = {
    $connect: jest.fn(),
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it("should reject invalid input with 400 Bad Request when ValidationPipe is active", async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    // Replicating main.ts configuration
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    return request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "not-an-email", password: "password" })
      .expect(400);
  });
});
