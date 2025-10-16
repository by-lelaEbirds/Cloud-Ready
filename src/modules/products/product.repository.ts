import { base, TABLE_NAME } from '../../config/airtable';

const formatRecord = (record: any) => {
    if (!record) return null;
    return { id: record.id, ...record.fields };
};

export const productRepository = {
    create: async (data: any) => {
        const [createdRecord] = await base(TABLE_NAME).create([{ fields: data }]);
        return formatRecord(createdRecord);
    },
    findAll: async () => {
        const records = await base(TABLE_NAME).select({ sort: [{field: "name", direction: "asc"}] }).all();
        return records.map(formatRecord);
    },
    findById: async (id: string) => {
        try {
            const record = await base(TABLE_NAME).find(id);
            return formatRecord(record);
        } catch (error) { return null; }
    },
    update: async (id: string, dataToUpdate: any) => {
        const [updatedRecord] = await base(TABLE_NAME).update([{ id, fields: dataToUpdate }]);
        return formatRecord(updatedRecord);
    },
    delete: async (id: string) => {
        const [deletedRecord] = await base(TABLE_NAME).destroy([id]);
        return formatRecord(deletedRecord);
    },
};
