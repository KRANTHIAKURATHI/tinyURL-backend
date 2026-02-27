const mysql = require("mysql2/promise");

let pool;

const DBconnect = async () => {
  if (!pool) {
    pool = mysql.createPool(process.env.DB_URL);
    console.log("✅ Database pool created successfully");
  }
  return pool;
};

module.exports = DBconnect;