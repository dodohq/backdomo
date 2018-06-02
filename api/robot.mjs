import Robot from '../database/models/robot';
import { Error500, Error404 } from '../lib/errors/http';

/**
 * RobotAPI handles all robot related operations
 */
export default class RobotAPI {
  /**
   * register a new leased robot into system
   * @param {string} compayID
   * @param {enum<'V1'>} model
   * @return {Promise}
   */
  registerNewRobot({ companyID, model }) {
    const newRobot = new Robot({
      leaser_id: companyID,
      model,
    });

    return newRobot.save().catch(e => {
      throw new Error500(`Database Error: ${e}`);
    });
  }

  /**
   * fetch all robots inside database
   * @return {Promise}
   */
  getAllRobots() {
    return Robot.find().catch(e => {
      throw new Error500(`Database Error: ${e}`);
    });
  }

  /**
   * fetch all robots leased to a company
   * @param {string} companyID
   * @return {Promise}
   */
  getRobotOfACompany({ companyID }) {
    return Robot.find({ leaser_id: companyID }).catch(e => {
      throw new Error500(`Database Error: ${e}`);
    });
  }

  /**
   * edit robot record
   * @param {string} id
   * @param {string} companyID
   * @param {enum<'V1'>} model
   * @return {Promise}
   */
  editRobotDetails({ id, companyID, model }) {
    return Robot.findById(id)
      .then(r => {
        if (!r) throw new Error404(`Robot with ID ${id} not found`);

        if (companyID) r.leaser_id = companyID;
        if (model) r.model = model;

        return r.save();
      })
      .catch(e => {
        throw new Error500(`Database Error: ${e}`);
      });
  }

  /**
   * delete robot instance
   * @param {string} id
   * @return {Promise}
   */
  deleteRobot({ id }) {
    return Robot.findByIdAndDelete(id).catch(e => {
      throw new Error500(`Database Error: ${e}`);
    });
  }
}
