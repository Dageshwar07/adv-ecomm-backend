import mongoose from 'mongoose';

const myListSchema = new mongoose.Schema({
  productTitle: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  oldPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  }
}, {
  timestamps: true // Optional: Adds createdAt and updatedAt
});

// Virtual 'id' field (instead of _id)
myListSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

myListSchema.set('toJSON', {
  virtuals: true,
});

// Export model
export const MyList = mongoose.model('MyList', myListSchema);
export { myListSchema };
