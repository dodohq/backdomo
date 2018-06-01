import express from 'express';

import ParcelAPI from '../../api/parcel';
import * as parcelValidator from '../../lib/validator/parcel';
import { AuthForRole, roles } from '../../middlewares/user_auth';
import valErrHandler from '../../middlewares/validator_error_handler';
import { Error401 } from '../../lib/errors/http';

const router = express.Router(); // eslint-disable-line new-cap
const parcelApi = new ParcelAPI();
const userAuth = new AuthForRole(roles.USER);

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
      .catch(e => {
        if (e.send) return e.send(res);
        res.status(500).json(`Internal Server Error: ${e}`);
      });
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
      .catch(e => {
        if (e.send) return e.send(res);
        res.status(500).json(`Internal Server Error: ${e}`);
      });
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
    })
    .then(parcelApi.getParcelBarCode.bind(null, { id }))
    .then(png => {
      res.set('Content-Type', 'image/png');
      res.end(png);
    })
    .catch(e => {
      if (e.send) return e.send(res);
      res.status(500).json({ message: `Internal Server Error: ${e}` });
    });
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
      .catch(e => {
        if (e.send) return e.send(res);
        res.status(500).json({ message: `Internal Server Error: ${e}` });
      });
  }
);

router.get('/qrcode/:parcel_token', (req, res) => {
  const { parcel_token: parcelToken } = req.params;

  parcelApi
    .decodeParcelToken(parcelToken)
    .then(({ _id: id }) => parcelApi.getParcelQRCode({ id }, res))
    .catch(e => {
      if (e.send) return e.send(res);
      res.status(500).json({ message: `Internal Server Error: ${e}` });
    });
});

export default router;
