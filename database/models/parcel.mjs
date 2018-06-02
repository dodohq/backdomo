import mongoose from 'mongoose';

/**
 * ParcelSchema model for parcels
 */
const ParcelSchema = new mongoose.Schema({
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  address: { type: String, required: true },
  date_of_delivery: { type: Date, required: true },
  customer_contact: { type: String, required: true },
  password: { type: String, required: true },
  robot_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Robot',
  },
  robot_compartment: {
    type: String,
  },
});

ParcelSchema.index({ robot_id: 1, robot_compartment: 1 }, { unique: true });

export default mongoose.model('Parcel', ParcelSchema);
