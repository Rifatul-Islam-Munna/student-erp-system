import AuditLog from '../models/AuditLog.js';
import { requestContext } from '@fastify/request-context';

/**
 * Mongoose plugin that automatically logs create, update, and delete operations.
 * Apply this plugin to any schema: schema.plugin(auditPlugin);
 *
 * Usage:
 *   import auditPlugin from '../plugins/audit.plugin.js';
 *   mySchema.plugin(auditPlugin);
 *
 * It reads the current user from @fastify/request-context (set by auth middleware).
 */
const auditPlugin = (schema, options = {}) => {
    const entityType = options.modelName || 'Unknown';

    // Fields to ignore in diff (internal mongoose fields, passwords, etc.)
    const IGNORED_FIELDS = ['__v', 'updatedAt', 'password', 'resetPasswordToken', 'resetPasswordExpires'];

    /**
     * Compute field-level diff between old and new objects.
     */
    const computeDiff = (oldDoc, newDoc) => {
        const changes = [];
        const allKeys = new Set([...Object.keys(oldDoc), ...Object.keys(newDoc)]);

        for (const key of allKeys) {
            if (IGNORED_FIELDS.includes(key)) continue;
            const oldVal = JSON.stringify(oldDoc[key]);
            const newVal = JSON.stringify(newDoc[key]);
            if (oldVal !== newVal) {
                changes.push({ field: key, oldValue: oldDoc[key], newValue: newDoc[key] });
            }
        }
        return changes;
    };

    /**
     * Get current request context (user, IP).
     */
    const getContext = () => {
        try {
            const store = requestContext.get('requestId') ? {
                requestId: requestContext.get('requestId'),
                user: requestContext.get('user'),
                ip: requestContext.get('ip')
            } : {};
            return store;
        } catch {
            return {};
        }
    };

    // POST-SAVE HOOK (handles both create and update via .save())
    schema.post('save', async function (doc) {
        try {
            const ctx = getContext();
            const isNew = doc.$locals?._wasNew || false;

            const logEntry = {
                entityType,
                entityId: doc._id,
                action: isNew ? 'create' : 'update',
                performedBy: ctx.user?._id || null,
                performedByName: ctx.user?.fullName || 'System',
                ipAddress: ctx.ip || null
            };

            if (isNew) {
                const obj = doc.toObject();
                delete obj.password;
                delete obj.__v;
                logEntry.snapshot = obj;
            } else if (doc.$locals?._originalDoc) {
                logEntry.changes = computeDiff(doc.$locals._originalDoc, doc.toObject());
                if (logEntry.changes.length === 0) return; // No meaningful changes
            }

            await AuditLog.create(logEntry);
        } catch (err) {
            // Don't break the main operation if audit logging fails
            console.error('Audit plugin error (save):', err.message);
        }
    });

    // PRE-SAVE: Capture original doc for diff computation and track if new
    schema.pre('save', async function () {
        this.$locals = this.$locals || {};
        this.$locals._wasNew = this.isNew;
        if (!this.isNew) {
            try {
                const original = await this.constructor.findById(this._id).lean();
                if (original) {
                    this.$locals._originalDoc = original;
                }
            } catch (err) {
                // Ignore
            }
        }
    });

    // POST findOneAndDelete / findByIdAndDelete
    schema.post('findOneAndDelete', async function (doc) {
        if (!doc) return;
        try {
            const ctx = getContext();
            const obj = doc.toObject ? doc.toObject() : doc;
            delete obj.password;
            delete obj.__v;
            await AuditLog.create({
                entityType,
                entityId: doc._id,
                action: 'delete',
                snapshot: obj,
                performedBy: ctx.user?._id || null,
                performedByName: ctx.user?.fullName || 'System',
                ipAddress: ctx.ip || null
            });
        } catch (err) {
            console.error('Audit plugin error (delete):', err.message);
        }
    });
};

export default auditPlugin;
