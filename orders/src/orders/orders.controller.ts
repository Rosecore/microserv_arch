import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '../common/guards/current-user.guard';
import { RequireAuthGuard } from '../common/guards/require-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('api/orders')
@UseGuards(RequireAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: UserPayload) {
    return this.ordersService.create(dto, user.id);
  }

  @Get(':orderId')
  show(@Param('orderId') orderId: string, @CurrentUser() user: UserPayload) {
    return this.ordersService.findByIdOrThrow(orderId, user.id);
  }

  @Get()
  index(@CurrentUser() user: UserPayload) {
    return this.ordersService.findAllForUser(user.id);
  }

  @Delete(':orderId')
  @HttpCode(204)
  cancel(@Param('orderId') orderId: string, @CurrentUser() user: UserPayload) {
    return this.ordersService.cancel(orderId, user.id);
  }
}
