const Admin = require('../models/Admin');
const config = require('../config');

const seedAdmin = async () => {
  const admin = await Admin.findOne({ email: config.admin.email });
  if (!admin) {
    await Admin.create({
      name: config.admin.name,
      email: config.admin.email,
      password: config.admin.password,
      role: 'SUPER_ADMIN',
    });
    console.log(`Seeded default admin: ${config.admin.email}`);
  }
};

module.exports = seedAdmin;