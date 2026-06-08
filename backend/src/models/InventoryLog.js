import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InventoryItem',
        required: true
    },
    type: {
        type: String,
        enum: ['purchase', 'distribution', 'adjustment', 'loss', 'return'],
        required: true,
        lowercase: true
    },
    quantity: {
        type: Number,
        required: true
    },
    targetStudent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        default: null
    },
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    note: {
        type: String,
        trim: true,
        default: ''
    },
    dateTime: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for performance
inventoryLogSchema.index({ item: 1 });
inventoryLogSchema.index({ type: 1 });
inventoryLogSchema.index({ targetStudent: 1 });
inventoryLogSchema.index({ dateTime: -1 });

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);

export default InventoryLog;
