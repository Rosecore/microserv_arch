import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { natsWrapper } from '../nats-wrapper';
import { ScreeningCreatedPublisher } from '../events/publishers/screening-created-publisher';
import { ScreeningUpdatedPublisher } from '../events/publishers/screening-updated-publisher';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { UpdateScreeningDto } from './dto/update-screening.dto';
import { Screening, ScreeningDocument } from './schemas/screening.schema';

@Injectable()
export class ScreeningsService {
  constructor(
    @InjectModel(Screening.name) private readonly screeningModel: Model<ScreeningDocument>
  ) {}

  async create(dto: CreateScreeningDto, userId: string) {
    const screening = new this.screeningModel({
      title: dto.title,
      price: dto.price,
      userId,
    });
    await screening.save();

    new ScreeningCreatedPublisher(natsWrapper.client).publish({
      id: screening.id,
      title: screening.title,
      price: screening.price,
      userId: screening.userId,
      version: (screening as any).version,
    });

    return screening;
  }

  async findByIdOrThrow(id: string) {
    const screening = await this.screeningModel.findById(id);
    if (!screening) {
      throw new NotFoundException();
    }
    return screening;
  }

  async findAll() {
    return this.screeningModel.find({});
  }

  async update(id: string, dto: UpdateScreeningDto, userId: string) {
    const screening = await this.screeningModel.findById(id);
    if (!screening) {
      throw new NotFoundException();
    }

    if (screening.orderId) {
      throw new BadRequestException('Cannot edit a reserved screening');
    }

    if (screening.userId !== userId) {
      throw new UnauthorizedException({
        errors: [{ message: 'Вы не аворизованы на сайте' }],
      });
    }

    screening.set({
      title: dto.title,
      price: dto.price,
    });
    await screening.save();

    new ScreeningUpdatedPublisher(natsWrapper.client).publish({
      id: screening.id,
      title: screening.title,
      price: screening.price,
      userId: screening.userId,
      version: (screening as any).version,
    });

    return screening;
  }
}
