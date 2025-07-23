const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3001;

// ✅ Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://sudhakar6233.github.io"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Schemas & Models
const Food = mongoose.model(
  "Food",
  new mongoose.Schema({
    foodName: String,
    description: String,
    price: String,
    image: String,
  })
);

const Contact = mongoose.model(
  "Contact",
  new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    about: String,
  })
);

const Order = mongoose.model(
  "Order",
  new mongoose.Schema({
    name: String,
    street: String,
    city: String,
    pincode: String,
    phone: String,
    product: String,
    description: String,
    price: String,
    paymentStatus: String,
  })
);

// ✅ Nodemailer Transporter (only one)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// ✅ Verify transporter once on start
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Nodemailer Transport Error:", error);
  } else {
    console.log("✅ Nodemailer Transporter ready!");
  }
});

// ✅ Food CRUD
app.post("/insert", async (req, res) => {
  const { foodName, description, price, image } = req.body;
  const food = new Food({ foodName, description, price, image });
  try {
    const result = await food.save();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error inserting food");
  }
});

app.get("/read", async (req, res) => {
  try {
    const food = await Food.find();
    res.send(food);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error reading food");
  }
});

app.put("/update", async (req, res) => {
  const { id, newFoodName } = req.body;
  try {
    const updateFood = await Food.findById(id);
    if (!updateFood) return res.status(404).send("❌ Food not found");
    updateFood.foodName = newFoodName;
    await updateFood.save();
    res.send("✅ Food updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error updating food");
  }
});

app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await Food.findByIdAndDelete(id);
    if (!result) return res.status(404).send("❌ Food not found");
    res.send("✅ Food deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error deleting food");
  }
});

// ✅ Seed food items
app.post("/seed", async (req, res) => {
  const foodItems = [
    {
      foodName: "Margherita Pizza",
      description: "Mozzarella & basil",
      price: "$8.99",
      image: "food1.jpg",
    },
    {
      foodName: "Veggie Burger",
      description: "Grilled veggie patty",
      price: "$6.49",
      image: "food2.jpg",
    },
    {
      foodName: "Pasta Alfredo",
      description: "Creamy Alfredo sauce",
      price: "$7.99",
      image: "food3.jpg",
    },
    {
      foodName: "Grilled Sandwich",
      description: "Veggies and cheese",
      price: "$5.49",
      image: "food4.jpg",
    },
    {
      foodName: "Caesar Salad",
      description: "Fresh lettuce, parmesan",
      price: "$4.99",
      image: "food5.jpg",
    },
    {
      foodName: "Chicken Wings",
      description: "Crispy wings, tangy sauce",
      price: "$9.49",
      image: "food6.jpg",
    },
    {
      foodName: "Beef Taco",
      description: "Soft taco, seasoned beef",
      price: "$3.99",
      image: "food7.jpg",
    },
    {
      foodName: "Fruit Bowl",
      description: "Mixed seasonal fruits",
      price: "$5.29",
      image: "food8.jpg",
    },
    {
      foodName: "French Fries",
      description: "Golden crispy fries",
      price: "$2.99",
      image: "food9.jpg",
    },
    {
      foodName: "Chocolate Muffin",
      description: "Rich muffin with choco chips",
      price: "$2.49",
      image: "food10.jpg",
    },
    {
      foodName: "Greek Salad",
      description: "Feta cheese, olives",
      price: "$4.79",
      image: "food11.jpg",
    },
    {
      foodName: "Cheese Pizza",
      description: "Extra cheesy delight",
      price: "$9.19",
      image: "food12.jpg",
    },
  ];

  try {
    await Food.insertMany(foodItems);
    res.send("✅ Seeded menu items");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error seeding food items");
  }
});

// ✅ Contact form (with Nodemailer)
app.post("/api/contact", async (req, res) => {
  const { name, email, password, about } = req.body;

  if (!name || !email || !password || !about) {
    return res.status(400).json({ message: "❌ All fields are required!" });
  }

  try {
    const newContact = new Contact({ name, email, password, about });
    await newContact.save();

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Thank you for contacting us!",
      text: `Hello ${name},\n\nThank you for your message: "${about}".\n\nWe will get back to you soon!\n\nRegards,\nYour Company`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "✅ Contact saved & email sent!" });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: "❌ Server error" });
  }
});

// ✅ Order saving
app.post("/api/order", async (req, res) => {
  const { name, street, city, pincode, phone, product, description, price } = req.body;

  const newOrder = new Order({
    name,
    street,
    city,
    pincode,
    phone,
    product,
    description,
    price,
    paymentStatus: "Success",
  });

  try {
    await newOrder.save();
    res.status(200).json({ message: "✅ Order saved to MongoDB" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error saving order" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});