import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Enhancement: Helmet
  // Sets various HTTP headers to secure the app (CSP, X-Frame-Options, etc.)
  // We allow cross-origin resource sharing for static files (images/PDFs) to be loaded by the frontend.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  // Enable trust proxy for correct IP behind proxies (e.g. load balancers)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set("trust proxy", 1);

  app.use(cookieParser());
  app.enableCors({
    origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
    credentials: true,
  });

  // Security Enhancement: Global Validation Pipe
  // Ensures all inputs are validated against DTOs, stripping unknown properties.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Using PORT from env or default to 3001 (since 3000 is often frontend)
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
