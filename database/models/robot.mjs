import mongoose from 'mongoose';

const RobotSchema = new mongoose.Schema({
  leaser_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  model: {
    type: String,
    enum: ['V1'],
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export default RobotSchema;
