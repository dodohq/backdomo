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
    required: [
      function() {
        return !!this.robot_id; // eslint-disable-line no-invalid-this
      },
      '`robot_compartment` is required on robot loading',
    ],
  },
  uuid: {
    type: String,
    required: [
      function() {
        return !!this.robot_id; // eslint-disable-line no-invalid-this
      },
      '`uuid` is required on robot loading',
    ],
  },
});

ParcelSchema.index(
  { robot_id: 1, robot_compartment: 1 },
  { sparse: true, unique: true }
);

export default ParcelSchema;
