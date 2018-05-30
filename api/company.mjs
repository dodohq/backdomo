import Company from '../database/models/company';
import { Error500, Error409, Error404 } from '../lib/errors/http';

/**
 * CompanyAPI handling all company related operations
 */
export default class CompanyAPI {
  /**
   * create a new database instance of Dodo client
   * @param {string} name
   * @return {Promise}
   */
  createNewCompany({ name }) {
    return new Promise((resolve, reject) => {
      Company.findOne({ name })
        .then(c => {
          if (c) reject(new Error409(`Company with name ${name} exists`));

          const newCompany = new Company({ name });
          return newCompany.save();
        })
        .then(resolve)
        .catch(e => {
          reject(new Error500(`Internal Server Error: ${JSON.stringify(e)}`));
        });
    });
  }

  /**
   * get all clients of Dodo in database
   * @return {Promise}
   */
  getAllCompanies() {
    return new Promise((resolve, reject) => {
      Company.find({})
        .then(resolve)
        .catch(e =>
          reject(new Error500(`Internal Server Error: ${JSON.stringify(e)}`))
        );
    });
  }

  /**
   * get client base on ID
   * @return {Promise}
   */
  getCompanyByID({ id }) {
    return new Promise((resolve, reject) => {
      Company.findById(id)
        .then(c => {
          if (!c) {
            reject(new Error404(`Company with id ${id} not found`));
          } else {
            resolve(c);
          }
        })
        .catch(e =>
          reject(new Error500(`Internal Server Error: ${JSON.stringify(e)}`))
        );
    });
  }

  /**
   * Edit a client's record on database
   * @param {string} id
   * @param {string} name
   * @return {Promise}
   */
  editCompany({ id, name }) {
    return new Promise((resolve, reject) => {
      Company.findById(id)
        .then(c => {
          if (!c) reject(new Error404(`Company with id ${id} not found`));

          c.name = name;
          return c.save();
        })
        .then(resolve)
        .catch(e =>
          reject(new Error500(`Internal Server Error: ${JSON.stringify(e)}`))
        );
    });
  }

  /**
   * delete a client's record from database
   * @param {string} id
   * @return {Promise}
   */
  deleteCompany({ id }) {
    return new Promise((resolve, reject) => {
      Company.findByIdAndDelete(id)
        .then(resolve)
        .catch(e =>
          reject(new Error500(`Internal Server Error: ${JSON.stringify(e)}`))
        );
    });
  }
}
