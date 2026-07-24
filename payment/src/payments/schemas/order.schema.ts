import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@anitix/shared';

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

  @Prop({ required: true })
  price: number;

  @Prop({ type: String, required: true })
  status: OrderStatus;

  version: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.set('versionKey', 'version');
OrderSchema.plugin(updateIfCurrentPlugin);
