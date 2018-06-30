import express from 'express';

import ParcelAPI from '../../api/parcel';
import CompanyAPI from '../../api/company';
import * as parcelValidator from '../../lib/validator/parcel';
import { AuthForRole, roles } from '../../middlewares/user_auth';
import valErrHandler from '../../middlewares/validator_error_handler';
import { Error401, Error404, Error500 } from '../../lib/errors/http';
import genericErrHandler from '../../lib/utils/http_generic_err_handler';
import RobotAuth from '../../middlewares/robot_auth';

const router = express.Router(); // eslint-disable-line new-cap
const parcelApi = new ParcelAPI();
const companyApi = new CompanyAPI();
const userAuth = new AuthForRole(roles.USER);
const robotAuth = new RobotAuth();
const adminAuth = new AuthForRole(roles.ADMIN);

router.post(
  '/',
  userAuth.check,
  [
    parcelValidator.COMPANY_ID,
    parcelValidator.ADDRESS,
    parcelValidator.DATE_OF_DELIVERY,
    parcelValidator.CUSTOMER_CONTACT,
  ],
  valErrHandler,
  (req, res) => {
    const { company_id: companyID } = req.user;
    const {
      address,
      date_of_delivery: dateOfDelivery,
      customer_contact: customerContact,
    } = req.body;

    parcelApi
      .registerNewParcel({
        companyID,
        address,
        dateOfDelivery,
        customerContact,
      })
      .then(parcel => {
        parcel.password = undefined;
        res.status(200).json({ parcel });
      })
      .catch(e => genericErrHandler(e, res));
  }
);

router.get(
  '/',
  userAuth.check,
  [parcelValidator.COMPANY_ID],
  valErrHandler,
  (req, res) => {
    const { company_id: companyID } = req.user;

    parcelApi
      .getAllParcelsOfACompany({ companyID })
      .then(parcels => {
        res.status(200).json({
          parcels: parcels.map(p =>
            Object.assign({}, p._doc, { password: undefined })
          ),
        });
      })
      .catch(e => genericErrHandler(e, res));
  }
);

router.get('/barcode/:id', userAuth.check, (req, res) => {
  const { id } = req.params;
  const { company_id: userCompanyID } = req.user;

  parcelApi
    .getParcelByID({ id })
    .then(p => {
      if (userCompanyID !== p.company_id.toString()) {
        throw new Error401(
          `Parcel with ID ${id} does not belongs to your company`
        );
      }

      return parcelApi.getParcelBarCode({ id });
    })
    .then(png => {
      res.set('Content-Type', 'image/png');
      res.end(png);
    })
    .catch(e => genericErrHandler(e, res));
});

/**
 * for testing purpose only
 * later this hash generation will be moved into the endpoint of sending sms
 */
router.get(
  '/qrcode_token/:id',
  new AuthForRole(roles.ADMIN).check,
  (req, res) => {
    const { id } = req.params;

    parcelApi
      .getParcelByID({ id })
      .then(p => parcelApi.getParcelToken(p._doc))
      .then(token => res.status(200).json({ token }))
      .catch(e => genericErrHandler(e, res));
  }
);

router.get('/qrcode/:parcel_token', (req, res) => {
  const { parcel_token: parcelToken } = req.params;

  parcelApi
    .decodeParcelToken(parcelToken)
    .then(({ _id: id }) => parcelApi.getParcelQRCode({ id }, res))
    .catch(e => genericErrHandler(e, res));
});

router.get('/robot/:robot_id', adminAuth.check, (req, res) => {
  const { robot_id: robotID } = req.params;

  parcelApi
    .getParcelsInsideRobot(robotID)
    .then(parcels => res.status(200).json({ parcels }))
    .catch(e => genericErrHandler(e, res));
});

router.post(
  '/load',
  robotAuth.check,
  [parcelValidator.ROBOT_ID, parcelValidator.ROBOT_COMPARTMENT],
  valErrHandler,
  (req, res) => {
    const { _id: robotID } = req.robot;
    const { robot_compartment: robotCompartment, id } = req.body;

    parcelApi
      .editParcelDetails({ id, robotID, robotCompartment })
      .then(p => res.status(200).json(p))
      .catch(e => genericErrHandler(e, res));
  }
);

router.post(
  '/unlock',
  robotAuth.check,
  [parcelValidator.ID, parcelValidator.PASSWORD],
  valErrHandler,
  (req, res) => {
    const { _id: robotID } = req.robot;
    const { id, password } = req.body;

    parcelApi
      .getParcelByID({ id })
      .then(p => {
        if (password !== p.password) {
          throw new Error401('Wrong unlocking password');
        } else if (!p.robot_id || robotID !== p.robot_id.toString()) {
          throw new Error404('Parcel is not on this robot');
        }

        res.status(200).json(p);
      })
      .catch(e => genericErrHandler(e, res));
  }
);

router.post('/sms', adminAuth.check, [parcelValidator.ID], (req, res) => {
  const { id } = req.body;

  parcelApi
    .getParcelByID({ id })
    .then(p =>
      Promise.all([p, companyApi.getCompanyByID({ id: p._doc.company_id })])
    )
    .then(([p, company]) => {
      const parcel = Object.assign({}, p._doc, { company: company._doc });
      return Promise.all([parcelApi.getParcelToken(p._doc), parcel]);
    })
    .then(([token, p]) => {
      if (!p.company) throw new Error500('Orphan parcel');

      const trimmedToken = token.replace(/\s/g, '');
      const content = `Your parcel from ${
        p.company.name
      } has arrive.\nPlease enter:\nID: ${p._id} Password: ${
        p.password
      }\nOr go to this link: https://${
        req.hostname
      }/api/parcel/qrcode/${trimmedToken} for the QR Code`;

      return parcelApi.sendSMSToCustomer(p.customer_contact, content);
    })
    .then(() => res.status(200).json({}))
    .catch(e => genericErrHandler(e, res));
});

router.put(
  '/',
  userAuth.check,
  [
    parcelValidator.ADDRESS_OPTIONAL,
    parcelValidator.DATE_OF_DELIVERY_OPTIONAL,
    parcelValidator.CUSTOMER_CONTACT_OPTIONAL,
  ],
  valErrHandler,
  (req, res) => {
    const {
      id,
      address,
      date_of_delivery: dateOfDelivery,
      customer_contact: customerContact,
    } = req.body;
    const { company_id: userCompanyID } = req.user;

    parcelApi
      .getParcelByID({ id })
      .then(p => {
        if (userCompanyID !== p.company_id.toString()) {
          throw new Error401(
            `Parcel with ID ${id} does not belongs to your company`
          );
        }

        return parcelApi.editParcelDetails({
          id,
          address,
          dateOfDelivery,
          customerContact,
        });
      })
      .then(p => {
        p.password = undefined;
        res.status(200).json(p);
      })
      .catch(e => genericErrHandler(e, res));
  }
);

router.delete('/:id', userAuth.check, (req, res) => {
  const { id } = req.params;

  parcelApi
    .getParcelByID({ id })
    .then(p => {
      if (p.company_id.toString() !== req.user.company_id) {
        throw new Error401(
          `Parcel with ID ${id} doesn't belongs to your company`
        );
      }

      return parcelApi.deleteParcel({ id });
    })
    .then(() => res.status(200).json({}))
    .catch(e => genericErrHandler(e, res));
});

export default router;
