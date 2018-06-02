import express from 'express';

import RobotAPI from '../../api/robot';
import * as robotValidator from '../../lib/validator/robot';
import { AuthForRole, roles } from '../../middlewares/user_auth';
import valErrHandler from '../../middlewares/validator_error_handler';
import genericErrHandler from '../../lib/utils/http_generic_err_handler';

const router = express.Router(); // eslint-disable-line new-cap
const robotApi = new RobotAPI();
const adminAuth = new AuthForRole(roles.ADMIN);

router.post(
  '/',
  adminAuth.check,
  [robotValidator.LEASER_ID, robotValidator.MODEL],
  valErrHandler,
  (req, res) => {
    const { leaser_id: companyID, model } = req.body;

    robotApi
      .registerNewRobot({ companyID, model })
      .then(r => res.status(201).json(r))
      .catch(e => genericErrHandler(e, res));
  }
);

router.get('/', adminAuth.check, (req, res) => {
  robotApi
    .getAllRobots()
    .then(robots => res.status(200).json({ robots }))
    .catch(e => genericErrHandler(e, res));
});

router.get('/from_company/:company_id', adminAuth.check, (req, res) => {
  const { company_id: companyID } = req.params;

  robotApi
    .getRobotOfACompany({ companyID })
    .then(robots => res.status(200).json({ robots }))
    .catch(e => genericErrHandler(e, res));
});

router.put(
  '/',
  adminAuth.check,
  [
    robotValidator.ID,
    robotValidator.LEASER_ID_OPTIONAL,
    robotValidator.MODEL_OPTIONAL,
  ],
  valErrHandler,
  (req, res) => {
    const { id, leaser_id: companyID, model } = req.body;

    robotApi
      .editRobotDetails({ id, companyID, model })
      .then(r => res.status(200).json(r))
      .catch(e => genericErrHandler(e, res));
  }
);

router.delete('/:id', adminAuth.check, (req, res) => {
  const { id } = req.params;

  robotApi
    .deleteRobot({ id })
    .then(() => res.status(200).json({}))
    .catch(e => genericErrHandler(e, res));
});

router.get('/token/:id', adminAuth.check, (req, res) => {
  const { id } = req.params;

  robotApi
    .generateRobotToken({ id })
    .then(token => res.status(200).json({ token }))
    .catch(e => genericErrHandler(e, res));
});

export default router;
