import mongoose from 'mongoose';

/**
 * TZ (Timezone) Management for MongoDB Global Plugin
 */

export const getMXTime = () => {
    const now = new Date();
    // Mexico City is always GMT-6 now (no DST since 2022)
    return new Date(now.getTime() - (6 * 60 * 60 * 1000));
};

// Return if already registered (prevention of multiple registrations in dev hot-reload)
if (!(global as any)._mongooseTimezonePluginRegistered) {
    mongoose.plugin((schema: any) => {
        // 1. Handle automatic timestamps (createdAt, updatedAt)
        if (schema.options.timestamps) {
            if (schema.options.timestamps === true) {
                schema.options.timestamps = { currentTime: getMXTime };
            } else {
                schema.options.timestamps.currentTime = getMXTime;
            }
        }

        // 2. Handle manual Date fields with default: Date.now, Date
        schema.eachPath((path: string, type: any) => {
            if (type.options && (type.options.default === Date.now || type.options.default === Date)) {
                type.options.default = getMXTime;
            }
        });
    });
    (global as any)._mongooseTimezonePluginRegistered = true;
}
