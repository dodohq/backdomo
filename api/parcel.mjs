import bwipjs from 'bwip-js';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';

import { Parcel } from '../database/models';
import { Error500, Error404 } from '../lib/errors/http';
import randomDigits from '../lib/utils/random_digits';

/**
 * ParcelAPI handles all parcel related operations
 */
export default class ParcelAPI {
  /**
   * register a new instance of parcel
   * @param {string} companyID
   * @param {date} dateOfDelivery
   * @param {string} customerContact
   * @return {Promise}
   */
  registerNewParcel({ companyID, address, dateOfDelivery, customerContact }) {
    return new Promise((resolve, reject) => {
      const newParcel = new Parcel({
        company_id: companyID,
        address,
        date_of_delivery: dateOfDelivery,
        customer_contact: customerContact,
        password: randomDigits(6),
      });

      newParcel
        .save()
        .then(resolve)
        .catch(e => reject(new Error500(`Internal Server Error: ${e}`)));
    });
  }

  /**
   * fetch all parcels that belongs to a company
   * @param {string} companyID
   * @return {Promise}
   */
  getAllParcelsOfACompany({ companyID }) {
    return Parcel.find({ company_id: companyID });
  }

  /**
   * fetch parcel by ID
   * @param {string} id
   * @return {Promise}
   */
  getParcelByID({ id }) {
    return new Promise((resolve, reject) => {
      Parcel.findById(id)
        .then(p => {
          if (!p) {
            return reject(new Error404(`Parcel with ID ${id} not found`));
          }

          resolve(p);
        })
        .catch(e => {
          reject(new Error500(`Internal Server Error: ${e}`));
        });
    });
  }

  /**
   * fetch a single parcel with parcel-like object
   * @param {Parcel} parcel
   * @return {Promise}
   */
  getOneParcel(parcel) {
    return Parcel.findOne(parcel);
  }

  /**
   * generate barcode from parcel ID
   * @param {string} id
   * @return {Promise}
   */
  getParcelBarCode({ id }) {
    return new Promise((resolve, reject) => {
      Parcel.findById(id)
        .then(p => {
          if (!p) return reject(new Error404(`Parcel with ID ${id} not found`));

          bwipjs.toBuffer(
            {
              bcid: 'code128',
              text: id,
              scale: 3,
              height: 20,
              includetext: true,
              textxalign: 'center',
            },
            (err, png) => {
              if (err) {
                return reject(new Error500('Error during barcode generation'));
              }

              resolve(png);
            }
          );
        })
        .catch(e => reject(new Error500(`Internal Server Error: ${e}`)));
    });
  }

  /**
   * generate QR Code for a parcel
   * @param {String} id
   * @param {Writable} writableStream
   * @return {Promise}
   */
  getParcelQRCode({ id }, writableStream) {
    return new Promise((resolve, reject) => [
      Parcel.findById(id)
        .then(p => {
          if (!p) return reject(new Error404(`Parcel with ID ${id} not found`));

          resolve(
            QRCode.toFileStream(
              writableStream,
              JSON.stringify({
                uuid: p.uuid,
                password: p.password,
              }),
              { scale: 10 }
            )
          );
        })
        .catch(e => reject(new Error500(`Internal Server Error: ${e}`))),
    ]);
  }

  /**
   * generate token of a parcel object
   * @param {Parcel} parcel
   * @return {Promise}
   */
  getParcelToken(parcel) {
    return new Promise(resolve => {
      resolve(jwt.sign(parcel, process.env.JWT_SECRET));
    });
  }

  /**
   * decode token of parcel object
   * @param {string} token
   * @return {Promise}
   */
  decodeParcelToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return reject(new Error500(err.message));
        }

        resolve(decoded);
      });
    });
  }

  /**
   * update parcel records in database
   * @param {string} id
   * @param {string} address
   * @param {string} customerContact
   * @param {string} robotID
   * @param {string} robotCompartment
   * @param {string} uuid
   * @return {Promise}
   */
  editParcelDetails({
    id,
    address,
    dateOfDelivery,
    customerContact,
    robotID,
    robotCompartment,
    uuid,
  }) {
    return Parcel.findById(id)
      .then(p => {
        if (!p) throw new Error404(`Parcel with ID ${id} not found`);

        if (address) p.address = address;
        if (dateOfDelivery) p.date_of_delivery = dateOfDelivery;
        if (customerContact) p.customer_contact = customerContact;
        if (robotID) p.robot_id = robotID;
        if (robotCompartment) p.robot_compartment = robotCompartment;
        if (uuid) p.uuid = uuid;
        return p.save();
      })
      .catch(e => {
        throw new Error500(`Internal Server Error: ${e}`);
      });
  }

  /**
   * delete parcel record
   * @param {string} id
   * @return {Promise}
   */
  deleteParcel({ id }) {
    return Parcel.findOneAndRemove({ _id: id }).catch(e => {
      throw new Error500(`Internal Server Error: ${e}`);
    });
  }

  /**
   * send SMS to customer
   * @param {string} customerContact
   * @param {string} content
   * @return {Promise}
   */
  sendSMSToCustomer(customerContact, content) {
    const twilioCli = twilio(process.env.TWILIO_ID, process.env.TWILIO_TOKEN);
    return twilioCli.messages
      .create({
        body: content,
        from: process.env.TWILIO_NUMBER,
        to: customerContact,
      })
      .catch(e => {
        throw new Error500(`Internal Server Error: ${e.message}`);
      });
  }

  /**
   * get all parcels loaded inside a robot
   * @param {string} robotID
   * @return {Promise}
   */
  getParcelsInsideRobot(robotID) {
    return Parcel.find({ robot_id: robotID }).catch(e => {
      throw new Error500(`Internal Server Error: ${e.message}`);
    });
  }
}
