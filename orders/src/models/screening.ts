import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderStatus } from './order';

interface ScreeningAttrs {
  id: string;
  title: string;
  price: number;
}

export interface ScreeningDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface ScreeningModel extends mongoose.Model<ScreeningDoc> {
  build(attrs: ScreeningAttrs): ScreeningDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<ScreeningDoc | null>;
}

const screeningSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

screeningSchema.set('versionKey', 'version');
screeningSchema.plugin(updateIfCurrentPlugin);

screeningSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Screening.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};
screeningSchema.statics.build = (attrs: ScreeningAttrs) => {
  return new Screening({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};
screeningSchema.methods.isReserved = async function() {
  const existingOrder = await Order.findOne({
    ticket: this.id, // Screening id
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete
      ]
    }
  })
  return !!existingOrder
}

const Screening = mongoose.model<ScreeningDoc, ScreeningModel>('Screening', screeningSchema);

export { Screening };
