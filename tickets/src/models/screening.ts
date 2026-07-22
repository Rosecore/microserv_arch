import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface ScreeningAttrs {
  title: string;
  price: number;
  userId: string;
}

interface ScreeningDoc extends mongoose.Document {
  title: string;
  price: number;
  date: Date; // TODO(review): pre-existing bug fixed — original field type was the undeclared identifier `date`
  userId: string;
  orderId?: string;
  version: number;
}

interface ScreeningModel extends mongoose.Model<ScreeningDoc> {
  build(attrs: ScreeningAttrs): ScreeningDoc;
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
    },
    date: {
      type: Date
    },
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
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
screeningSchema.plugin(updateIfCurrentPlugin);

screeningSchema.statics.build = (attrs: ScreeningAttrs) => {
  return new Screening(attrs);
};

const Screening = mongoose.model<ScreeningDoc, ScreeningModel>('Screening', screeningSchema);

export { Screening };
