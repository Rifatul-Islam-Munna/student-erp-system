import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    sku: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        default: 0,
        min: 0
    },
    unit: {
        type: String,
        default: 'pcs',
        trim: true
    },
    minThreshold: {
        type: Number,
        default: 5
    },
    price: {
        type: Number,
        default: 0
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for performance
inventoryItemSchema.index({ category: 1 });
inventoryItemSchema.index({ branch: 1 });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

export default InventoryItem;
