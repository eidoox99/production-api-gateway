import express from "express";

const app = express();
const port = Number(process.env.PORT) || 3002;

app.use(express.json());

const orders = [
  { id: "ord-1", product: "Laptop", amount: 1200, status: "completed" },
  { id: "ord-2", product: "Mouse", amount: 25, status: "pending" },
  { id: "ord-3", product: "Keyboard", amount: 80, status: "shipped" },
];

app.get("/orders", (_req, res) => {
  res.json(orders);
});

app.post("/orders", (req, res) => {
  res.json({ product: req.body.product, amount: req.body.amount });
});

app.listen(port, () => {
  console.log(`order-service is running on port ${port}`);
});
