import { Controller, Post, Body, ValidationPipe, UsePipes } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateBookingDto } from './create-booking.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async checkout(@Body() createBookingDto: CreateBookingDto) {
    return this.checkoutService.processCheckout(createBookingDto);
  }
}
