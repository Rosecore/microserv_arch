import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@anitix/shared';

@Schema({
  toJSON: {
    transform(doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class Screening {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, min: 0 })
  price: number;

  version: number;
}

export type ScreeningDocument = HydratedDocument<Screening> & {
  isReserved(): Promise<boolean>;
};

export type ScreeningModel = Model<ScreeningDocument> & {
  findByEvent(event: { id: string; version: number }): Promise<ScreeningDocument | null>;
};

export const ScreeningSchema = SchemaFactory.createForClass(Screening);
ScreeningSchema.set('versionKey', 'version');
ScreeningSchema.plugin(updateIfCurrentPlugin);

ScreeningSchema.statics.findByEvent = function (event: { id: string; version: number }) {
  return this.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

ScreeningSchema.methods.isReserved = async function () {
  const OrderModel = this.db.model('Order');
  const existingOrder = await OrderModel.findOne({
    ticket: this.id, // Screening id
    status: {
      $in: [OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Complete],
    },
  });
  return !!existingOrder;
};
