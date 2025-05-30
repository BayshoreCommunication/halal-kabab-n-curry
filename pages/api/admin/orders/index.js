import nc from "next-connect";
import Order from "../../../../models/Order";
import { isAuth, isAdmin } from "../../../../helpers/auth";
import db from "../../../../helpers/db";
import { onError } from "../../../../helpers/error";

const handler = nc({
  onError,
});
handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  await db.connect();
  const orders = await Order.find({}).populate("user", "name");
  await db.disconnect();
  res.send(orders);
});

export default handler;
