import { Controller, Get } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return "Hello World from NestJS!";
  }

  @Get("version")
  getVersion() {
    const pathsToSearch = [
      path.join(process.cwd(), "version.json"),
      path.join(__dirname, "version.json"),
      path.join(__dirname, "..", "version.json"),
      path.join(__dirname, "..", "..", "version.json"),
    ];

    for (const filePath of pathsToSearch) {
      try {
        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath, "utf8");
          return JSON.parse(data);
        }
      } catch (e) {
        // Continue searching
      }
    }

    return {
      message: "version.json file not found. Development or manual build.",
      apiVersion: "0.0.1",
      status: "OK",
    };
  }
}
