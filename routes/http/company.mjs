import express from 'express';

import CompanyAPI from '../../api/company';
import * as companyValidator from '../../lib/validator/company';
import { AuthForRole, roles } from '../../middlewares/user_auth';
import valErrHandler from '../../middlewares/validator_error_handler';

const router = express.Router(); // eslint-disable-line new-cap
const companyApi = new CompanyAPI();
const adminAuth = new AuthForRole(roles.ADMIN);

router.post(
  '/',
  adminAuth.check,
  [companyValidator.NAME],
  valErrHandler,
  (req, res) => {
    const { name } = req.body;
    companyApi
      .createNewCompany({ name })
      .then(company => {
        res.status(201).json({ company });
      })
      .catch(e => {
        if (e.send) return e.send(res);
        res.stauts(500).json({ message: `Error: ${e}` });
      });
  }
);

router.get('/', adminAuth.check, (req, res) => {
  companyApi
    .getAllCompanies()
    .then(companies => res.status(200).json({ companies }))
    .catch(e => {
      if (e.send) return e.send(res);
      res.status(500).json({ message: `Error: ${e}` });
    });
});

router.get('/:id', adminAuth.check, (req, res) => {
  const { id } = req.params;
  companyApi
    .getCompanyByID({ id })
    .then(c => res.status(200).json(c))
    .catch(e => {
      if (e.send) return e.send(res);
      res.status(500).json({ message: `Error: ${e}` });
    });
});

router.put(
  '/',
  adminAuth.check,
  [companyValidator.ID, companyValidator.NAME],
  valErrHandler,
  (req, res) => {
    const { id, name } = req.body;
    companyApi
      .editCompany({ id, name })
      .then(c => res.status(200).json(c))
      .catch(e => {
        if (e.send) return e.send(res);
        res.status(500).json({ message: `Error: ${e}` });
      });
  }
);

router.delete(
  '/',
  adminAuth.check,
  [companyValidator.ID],
  valErrHandler,
  (req, res) => {
    const { id } = req.body;
    companyApi
      .deleteCompany({ id })
      .then(() => res.status(200).json({}))
      .catch(e => {
        if (e.send) return e.send(res);
        res.status(500).json({ message: `Error: ${e}` });
      });
  }
);

export default router;
