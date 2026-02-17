const bcrypt = require("bcryptjs");

/**
 * Simulación en duro. Para demo.
 */
const hardcodedUsers = [
  {
    id: "u_1",
    email: "demo@iot.com",
    // hash se genera al iniciar (así no se guarda el password plano)
    passwordHash: null,
    roles: ["user"],
    isActive: true,
  },
];

let initialized = false;

async function initHardcodedUsers() {
  if (initialized) return;
  const plain = "Demo12345!";
  hardcodedUsers[0].passwordHash = await bcrypt.hash(plain, 12);
  initialized = true;
}

async function findByEmail(email) {
  await initHardcodedUsers();
  return hardcodedUsers.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
}

module.exports = { findByEmail };
