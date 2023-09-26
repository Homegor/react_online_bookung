const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/auth.middleware");
const Booking = require("../models/Booking");

module.exports = router;

router
  .route("/")
  .get(auth, async (req, res) => {
    try {
      const { orderBy, equalTo } = req.query;
      const list = await Booking.find({ [orderBy]: equalTo });
      res.send(list);
    } catch (e) {
      res.status(500).json({
        message: "На сервере произошла ошибка. Попробуйте позже",
      });
    }
  })
  .post(auth, async (req, res) => {
    try {
      const newBooking = await Booking.create({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).send(newBooking);
    } catch (e) {
      res.status(500).json({
        message: "На сервере произошла ошибка. Попробуйте позже",
      });
    }
  });
router.delete("/:bookingId", auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const removedBooking = await Booking.findById(bookingId);
    // todo: НЕ НРАВИТЬСЯ userId
    const currentUser = removedBooking.userId.toSigned() === req.user.id;
    const isAdmin = req.userRole === "admin" || "master";

    if (currentUser || isAdmin) {
      // todo: НЕ НРАВИТЬСЯ remove
      await removedBooking.remove();
      return res.send(null);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (e) {
    res.status(500).json({
      message: "На сервере произошла ошибка. Попробуйте позже",
    });
  }
});
router.patch("/:bookingId", auth, async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (bookingId === req.user.id) {
      const updateBooking = await Booking.findByIdAndUpdate(
        bookingId,
        req.body,
        {
          new: true,
        }
      );
      res.send(updateBooking);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (e) {
    res.status(500).json({
      message: "На сервере произошла ошибка. Попробуйте позже",
    });
  }
});
