const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
mongoose.connect("mongodb://localhost:27017/elitefraction");

const ShareSchema = new mongoose.Schema({
  address: String,
  shares: Number,
  startDate: String,
  endDate: String,
});
const BookingSchema = new mongoose.Schema({
  address: String,
  startDate: String,
  endDate: String,
});

const Share = mongoose.model("Share", ShareSchema);
const Booking = mongoose.model("Booking", BookingSchema);

let bookingInProgress = false;
let currentBookingAddress = null;

// ✅ Contract Setup
const ABI = require("./abi.json"); // make sure abi.json exists in same directory
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
const contract = new ethers.Contract("0x5fbdb2315678afecb367f032d93f642f64180aa3", ABI, provider);

// ✅ Listen for SharePurchased events
contract.on("SharePurchased", async (buyer, amount) => {
  console.log(`🔥 Event received: ${buyer} bought ${amount} shares`);

  try {
    const existing = await Share.findOne({ address: buyer });

    if (existing) {
      existing.shares += amount.toNumber();
      await existing.save();
    } else {
      await Share.create({ address: buyer, shares: amount.toNumber() });
    }

    const all = await Share.find();
    const totalSold = all.reduce((sum, doc) => sum + doc.shares, 0);
    io.emit("updateShares", { totalSold, buyers: all });

  } catch (err) {
    console.error("❌ Failed to process SharePurchased event:", err);
  }
});

io.on("connection", (socket) => {
  socket.on("initiateBooking", ({ address }) => {
    if (bookingInProgress) {
      socket.emit("bookingRejected", { message: "Another user is currently booking. Please wait." });
    } else {
      bookingInProgress = true;
      currentBookingAddress = address;
      io.emit("lockBookingUI", { address });
    }
  });

  socket.on("checkDates", async ({ address, startDate, endDate }) => {
    const conflict = await Booking.findOne({
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });

    if (conflict) {
      socket.emit("bookingConflict", {
        message: "Selected dates overlap. Please choose different dates.",
      });
      return;
    }

    io.to(socket.id).emit("datesAvailable");
  });

  socket.on("reserveDates", async ({ address, startDate, endDate }) => {
    await Booking.create({ address, startDate, endDate });

    const existing = await Share.findOne({ address });
    if (existing) {
      existing.startDate = startDate;
      existing.endDate = endDate;
      await existing.save();
    }

    const all = await Share.find();
    const totalSold = all.reduce((sum, doc) => sum + doc.shares, 0);
    io.emit("updateShares", { totalSold, buyers: all });
  });

  socket.on("unlockDates", ({ address }) => {
    bookingInProgress = false;
    currentBookingAddress = null;
    io.emit("unlockUI", { address });
  });
});

app.get("/shares", async (req, res) => {
  const all = await Share.find();
  const totalSold = all.reduce((sum, doc) => sum + doc.shares, 0);
  res.json({ totalSold, buyers: all });
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
