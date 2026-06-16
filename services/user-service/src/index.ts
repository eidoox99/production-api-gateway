import express from "express";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json());

const users = [
  { name: "Alice Admin", role: "admin", email: "alice@example.com" },
  { name: "Bob User", role: "user", email: "bob@example.com" },
  { name: "Carol Manager", role: "manager", email: "carol@example.com" },
];

app.get("/users", (_req, res) => {
  res.json(users);
});

app.post("/users", (req, res) => {
  res.json({ name: req.body.name, email: req.body.email });
});

app.listen(port, () => {
  console.log(`user-service is running on port ${port}`);
});
