import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '../common/guards/current-user.guard';
import { RequireAuthGuard } from '../common/guards/require-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('api/payments')
@UseGuards(RequireAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: UserPayload) {
    return this.paymentsService.create(dto, user.id);
  }
}
