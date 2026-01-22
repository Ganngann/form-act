import { Controller, Get, Param, Header } from "@nestjs/common";
import { CalendarService } from "./calendar.service";

@Controller("calendars")
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get(":token/events.ics")
  @Header("Content-Type", "text/calendar; charset=utf-8")
  @Header("Content-Disposition", 'attachment; filename="missions.ics"')
  async getEvents(@Param("token") token: string) {
    return this.calendarService.generateIcs(token);
  }
}
