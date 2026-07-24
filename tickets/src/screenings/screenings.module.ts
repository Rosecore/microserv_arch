import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScreeningsController } from './screenings.controller';
import { ScreeningsService } from './screenings.service';
import { Screening, ScreeningSchema } from './schemas/screening.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Screening.name, schema: ScreeningSchema }])],
  controllers: [ScreeningsController],
  providers: [ScreeningsService],
})
export class ScreeningsModule {}
