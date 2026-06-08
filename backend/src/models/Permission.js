import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        description: 'Unique identifier for the permission (e.g., manage_users)'
    },
    description: {
        type: String,
        trim: true,
        default: null,
        description: 'Human-readable description of what this permission allows'
    },
    module: {
        type: String,
        required: true,
        trim: true,
        description: 'Grouping/Category of the permission (e.g., Administration, Finance)'
    }
}, {
    timestamps: true
});

const Permission = mongoose.model('Permission', permissionSchema);

export default Permission;
