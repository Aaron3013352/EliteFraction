// backend.js
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const mongoose = require("mongoose");
const { ethers } = require("ethers");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());

mongoose.connect("mongodb://localhost:27017/elitefraction");

const ShareSchema = new mongoose.Schema({
  totalSold: Number,
  address: String,
  shares: Number,
});

const BookingSchema = new mongoose.Schema({
  address: String,
  startDate: String,
  endDate: String,
});

const Booking = mongoose.model("Booking", BookingSchema);
const Share = mongoose.model("Share", ShareSchema);

let bookingInProgress = false;
let currentBookingAddress = null;

const ABI = require("./abi.json");
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
const contract = new ethers.Contract("0x5fbdb2315678afecb367f032d93f642f64180aa3", ABI, provider);

contract.on("SharePurchased", async (buyer, amount) => {
  console.log(`🔥 Event: ${buyer} bought ${amount} shares`);
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
});

io.on("connection", (socket) => {
  socket.on("initiateBooking", ({ address }) => {
    if (bookingInProgress) {
      socket.emit("bookingRejected", { message: "Another user is currently booking. Please wait." });
    } else {
      bookingInProgress = true;
      currentBookingAddress = address;
      io.emit("lockBookingUI", { address });
      io.emit("lockInitiateBtn", { address });
    }
  });

  socket.on("reserveDates", async ({ address, startDate, endDate }) => {
    await Booking.create({ address, startDate, endDate });
    console.log("✅ Booking saved:", address, startDate, endDate);
  });

  socket.on("unlockDates", ({ address }) => {
    bookingInProgress = false;
    currentBookingAddress = null;
    io.emit("unlockUI", { address });
  });

  socket.on("checkBookingStatus", ({ address }) => {
    if (bookingInProgress && currentBookingAddress !== address) {
      socket.emit("bookingRejected", { message: "Another user is currently booking. Please wait." });
    } else {
      socket.emit("unlockUI", { address });
    }
  });

  socket.on("disconnect", () => {
    if (bookingInProgress) {
      console.log("⚠️ User disconnected. Unlocking booking.");
      bookingInProgress = false;
      currentBookingAddress = null;
      io.emit("unlockUI", { address: "DISCONNECTED_USER" });
    }
  });
});

app.get("/shares", async (req, res) => {
  const all = await Share.find();
  const totalSold = all.reduce((sum, doc) => sum + doc.shares, 0);
  res.json({ totalSold, buyers: all });
});

app.get("/bookings", async (req, res) => {
  const bookings = await Booking.find({});
  res.json(bookings);
});

app.get("/status", (req, res) => {
  res.json({ bookingInProgress });
});

server.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
