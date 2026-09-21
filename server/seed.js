// Creates the admin account (and demo data with --demo).
//   npm run seed          -> admin only
//   npm run seed:demo     -> admin + demo vendors, products, customer
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Product = require("./models/Product");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@shopndrop.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const upsertUser = async (data, password) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) return existing;
  return User.create({ ...data, password: await bcrypt.hash(password, 10) });
};

const demoProducts = {
  "Green Basket Grocers": [
    ["Fresh Apples (1 kg)", 180, "Fruits", 50,
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400"],
    ["Bananas (1 dozen)", 60, "Fruits", 80,
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400"],
    ["Tomatoes (1 kg)", 40, "Vegetables", 100,
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400"],
    ["Spinach Bunch", 25, "Vegetables", 40,
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400"],
  ],
  "Sharma Bakery": [
    ["Whole Wheat Bread", 45, "Bakery", 30,
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400"],
    ["Chocolate Muffins (4)", 120, "Bakery", 20,
      "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400"],
    ["Fresh Milk (1 L)", 64, "Dairy", 60,
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400"],
  ],
};

const run = async () => {
  await connectDB();

  await upsertUser(
    { name: "Admin", email: ADMIN_EMAIL, role: "admin" },
    ADMIN_PASSWORD
  );
  console.log(`Admin ready: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  if (process.argv.includes("--demo")) {
    let n = 1;
    for (const [shopName, products] of Object.entries(demoProducts)) {
      const vendor = await upsertUser(
        {
          name: `Vendor ${n}`,
          email: `vendor${n}@shopndrop.com`,
          role: "vendor",
          shopName,
          vendorStatus: "approved",
          phone: "98765432" + String(n).padStart(2, "0"),
          address: "Main Market, Sector " + n,
        },
        "vendor123"
      );
      n++;
      if ((await Product.countDocuments({ vendor: vendor._id })) === 0) {
        await Product.insertMany(
          products.map(([name, price, category, stock, image]) => ({
            name, price, category, stock, image,
            description: `${name} from ${shopName}`,
            vendor: vendor._id,
          }))
        );
      }
    }
    await upsertUser(
      {
        name: "Demo Customer",
        email: "customer@shopndrop.com",
        role: "customer",
        phone: "9123456780",
        address: "12 Park Street",
      },
      "customer123"
    );
    console.log("Demo data ready:");
    console.log("  vendor1@shopndrop.com / vendor123");
    console.log("  vendor2@shopndrop.com / vendor123");
    console.log("  customer@shopndrop.com / customer123");
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
