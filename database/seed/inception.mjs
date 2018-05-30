import seeder from 'mongoose-seed';

/**
 * data for inception
 * User - first user account that can be used to create other users
 */
const data = [
  {
    model: 'User',
    documents: [
      {
        username: 'admin',
        password:
          '$2a$10$gIdPGxnKbjWXYr6aOcYwIu7e3NqLrTrdjq/t0c8lotekdFKoIcUfK',
        email: 'admin@dodo.com',
        is_admin: true,
      },
    ],
  },
];

seeder.connect(process.env.DATABASE, () => {
  seeder.loadModels(['database/models/user.mjs']);

  seeder.clearModels(['User'], () => {
    seeder.populateModels(data, () => {
      seeder.disconnect();
    });
  });
});
