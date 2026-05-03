import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const resultSchema = new mongoose.Schema({
  ping: { type: Number, required: true },
  download: { type: Number, required: true },
  upload: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});
const Result = mongoose.model("Result", resultSchema);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(e => console.error("❌ MongoDB error:", e.message));

app.post("/api/results", async (req, res) => {
  try {
    const doc = await new Result(req.body).save();
    res.status(201).json(doc);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/results", async (_req, res) => {
  try {
    const docs = await Result.find().sort({ timestamp: -1 }).limit(10).lean();
    res.json(docs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`🚀 Server → http://localhost:${PORT}`));