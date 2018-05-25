import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

/**
 * UserSchema the model for user accounts
 */
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

/**
 * @param {string} p
 * @return {string}
 */
UserSchema.methods.encryptPassword = p =>
  bcrypt.hashSync(p, bcrypt.genSaltSync());

/**
 * @param {string} p
 * @param {string} h
 * @return {boolean}
 */
UserSchema.methods.checkPassword = (p, h) => bcrypt.compareSync(p, h);

export default mongoose.model('User', UserSchema);
