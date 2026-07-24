import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({
  toJSON: {
    transform(doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class Payment {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  stripeId: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
