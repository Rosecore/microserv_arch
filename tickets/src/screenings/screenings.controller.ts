import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequireAuthGuard } from '../common/guards/require-auth.guard';
import { UserPayload } from '../common/guards/current-user.guard';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { UpdateScreeningDto } from './dto/update-screening.dto';
import { ScreeningsService } from './screenings.service';

@Controller('api/tickets') // TODO(review): path still /api/tickets
export class ScreeningsController {
  constructor(private readonly screeningsService: ScreeningsService) {}

  @Post()
  @UseGuards(RequireAuthGuard)
  create(@Body() dto: CreateScreeningDto, @CurrentUser() user: UserPayload) {
    return this.screeningsService.create(dto, user.id);
  }

  @Get(':id')
  show(@Param('id') id: string) {
    return this.screeningsService.findByIdOrThrow(id);
  }

  @Get()
  index() {
    return this.screeningsService.findAll();
  }

  @Put(':id')
  @UseGuards(RequireAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateScreeningDto,
    @CurrentUser() user: UserPayload
  ) {
    return this.screeningsService.update(id, dto, user.id);
  }
}
