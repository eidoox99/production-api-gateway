import express from "express";

const app = express();
const port = Number(process.env.PORT) || 3003;

app.use(express.json());

const payments = [
  { id: "pay-1", method: "card", amount: 1200, status: "success" },
  { id: "pay-2", method: "paypal", amount: 25, status: "pending" },
  { id: "pay-3", method: "bank", amount: 80, status: "failed" },
];

app.get("/payments", (_req, res) => {
  res.json(payments);
});

app.post("/payments", (req, res) => {
  res.json({ method: req.body.method, amount: req.body.amount });
});

app.listen(port, () => {
  console.log(`payment-service is running on port ${port}`);
});
