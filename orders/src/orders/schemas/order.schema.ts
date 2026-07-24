import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@anitix/shared';
import { ScreeningDocument } from './screening.schema';

export { OrderStatus };

export type OrderDocument = HydratedDocument<Order>;

@Schema({
  toJSON: {
    transform(doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class Order {
  @Prop({ required: true })
  userId: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created,
  })
  status: OrderStatus;

  @Prop({ type: MongooseSchema.Types.Date })
  expiresAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Screening' })
  ticket: ScreeningDocument;

  version: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.set('versionKey', 'version');
OrderSchema.plugin(updateIfCurrentPlugin);
