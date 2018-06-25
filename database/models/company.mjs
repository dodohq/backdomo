import mongoose from 'mongoose';

/**
 * CompanySchema model for companies leasing robots from Dodo
 */
const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

export default CompanySchema;
