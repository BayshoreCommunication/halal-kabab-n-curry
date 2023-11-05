import nc from "next-connect";
import Order from "../../../../../models/Order";
import db from "../../../../../helpers/db";
import { isAdmin, isAuth } from "../../../../../helpers/auth";

const handler = nc();
handler.use(isAuth, isAdmin);

// api for order delivery status isDelivered update to true and deliveredAt to current date

handler.patch(async (req, res) => {
  console.log("req", req);
  await db.connect();
  const order = await Order.findById(req.query.id);
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    await order.save();
    await db.disconnect();
    res.send({ message: "Order Delivered", order });
  } else {
    await db.disconnect();
    res.status(404).send({ message: "Order Not Found" });
  }
});

export default handler;
