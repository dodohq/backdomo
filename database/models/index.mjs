import mongoose from 'mongoose';

import CompanySchema from './company';
import ParcelSchema from './parcel';
import RobotSchema from './robot';
import UserSchema from './user';

/**
 * cascade to parcel, robot and user on delete
 * @param {Object} doc
 */
function cascadeCompany(doc) {
  const company_id = doc._id; // eslint-disable-line camelcase

  Parcel.remove({ company_id }).exec();
  Robot.remove({ leaser_id: company_id }).exec();
  User.remove({ company_id }).exec();
}
CompanySchema.post('remove', cascadeCompany);
CompanySchema.post('findOneAndRemove', cascadeCompany);

/**
 * cascade to parcel
 * @param {Object} doc
 */
function cascadeRobot(doc) {
  const robot_id = doc._id; // eslint-disable-line camelcase

  Parcel.remove({ robot_id }).exec();
}
RobotSchema.post('remove', cascadeRobot);
RobotSchema.post('findOneAndRemove', cascadeRobot);

export const Company = mongoose.model('Company', CompanySchema);
export const Parcel = mongoose.model('Parcel', ParcelSchema);
export const Robot = mongoose.model('Robot', RobotSchema);
export const User = mongoose.model('User', UserSchema);
