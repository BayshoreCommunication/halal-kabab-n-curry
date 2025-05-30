import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [
      {
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        addon: { type: String, required: true, default: 'None' },
        addonPrice: { type: Number, required: true, default: 0 },
        modifier: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Modifier',
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, trim: true },
      location: {
        lat: String,
        lng: String,
        address: String,
        name: String,
        vicinity: String,
        googleAddressId: String,
      },
    },
    paymentMethod: { type: String, required: true },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    isPaid: { type: Boolean, required: true, default: false },
    isDelivered: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  },
)

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)
export default Order
