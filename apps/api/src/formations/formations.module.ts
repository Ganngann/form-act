import { Module } from '@nestjs/common';
import { FormationsService } from './formations.service';
import { FormationsController } from './formations.controller';
import { DispatcherModule } from '../dispatcher/dispatcher.module';

@Module({
  imports: [DispatcherModule],
  controllers: [FormationsController],
  providers: [FormationsService],
})
export class FormationsModule {}
