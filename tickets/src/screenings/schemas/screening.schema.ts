import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export type ScreeningDocument = HydratedDocument<Screening>;

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

  @Prop({ required: true })
  price: number;

  @Prop() // TODO(review): pre-existing bug — field type was the undeclared identifier `date` originally
  date: Date;

  @Prop({ required: true })
  userId: string;

  @Prop()
  orderId?: string;

  version: number;
}

export const ScreeningSchema = SchemaFactory.createForClass(Screening);
// TODO(review): fixed a pre-existing bug found during the Nest migration — this schema never
// aliased versionKey to 'version' (unlike orders'/payment's copies), so `.version` always read
// undefined and every published screening:created/updated event silently carried `version: undefined`,
// breaking the orders replica's findByEvent OCC matching. Aligned with the other two schemas.
ScreeningSchema.set('versionKey', 'version');
ScreeningSchema.plugin(updateIfCurrentPlugin);
