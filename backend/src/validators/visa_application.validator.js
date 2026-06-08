import Joi from 'joi';

export const createVisaApplicationSchema = Joi.object({
    student: Joi.string().required(),
    schoolSubmission: Joi.string().allow(null),
    school: Joi.string().allow(null),
    visaType: Joi.string().required().trim(),
    country: Joi.string().required().trim(),
    status: Joi.string().valid('Document Collection', 'Translation', 'Embassy Submission', 'Biometrics', 'Interview Scheduled', 'Interview Done', 'Under Review', 'Decision Pending', 'Visa Approved', 'Visa Rejected', 'Visa Issued', 'Travel Date Set').default('Document Collection'),
    checklist: Joi.array().items(Joi.object({
        item: Joi.string().required().trim(),
        isCompleted: Joi.boolean().default(false),
        notes: Joi.string().allow('', null).trim()
    })),
    embassyAppointment: Joi.object({
        date: Joi.date().iso().allow(null),
        time: Joi.string().allow('', null),
        location: Joi.string().allow('', null),
        referenceNumber: Joi.string().allow('', null)
    }),
    visaFee: Joi.number().min(0).default(0),
    passportNumber: Joi.string().allow('', null).trim(),
    applicationDate: Joi.date().iso(),
    travelDate: Joi.date().iso().allow(null),
    notes: Joi.string().allow('', null).trim(),
    internalRemarks: Joi.string().allow('', null).trim(),
    agent: Joi.string().allow(null),
    branch: Joi.string().allow(null)
});

export const updateVisaApplicationSchema = Joi.object({
    student: Joi.string(),
    schoolSubmission: Joi.string().allow(null),
    school: Joi.string().allow(null),
    visaType: Joi.string().trim(),
    country: Joi.string().trim(),
    status: Joi.string().valid('Document Collection', 'Translation', 'Embassy Submission', 'Biometrics', 'Interview Scheduled', 'Interview Done', 'Under Review', 'Decision Pending', 'Visa Approved', 'Visa Rejected', 'Visa Issued', 'Travel Date Set'),
    statusNote: Joi.string().allow('', null).trim(),
    checklist: Joi.array().items(Joi.object({
        item: Joi.string().required().trim(),
        isCompleted: Joi.boolean().default(false),
        notes: Joi.string().allow('', null).trim()
    })),
    embassyAppointment: Joi.object({
        date: Joi.date().iso().allow(null),
        time: Joi.string().allow('', null),
        location: Joi.string().allow('', null),
        referenceNumber: Joi.string().allow('', null)
    }),
    visaFee: Joi.number().min(0),
    passportNumber: Joi.string().allow('', null).trim(),
    decisionDate: Joi.date().iso().allow(null),
    travelDate: Joi.date().iso().allow(null),
    visaNumber: Joi.string().allow('', null).trim(),
    visaExpiryDate: Joi.date().iso().allow(null),
    notes: Joi.string().allow('', null).trim(),
    internalRemarks: Joi.string().allow('', null).trim(),
    agent: Joi.string().allow(null),
    branch: Joi.string().allow(null)
});

export const updateChecklistSchema = Joi.object({
    checklistItemId: Joi.string().required(),
    isCompleted: Joi.boolean().required()
});

export const queryVisaApplicationSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(500).default(10),
    search: Joi.string().optional(),
    status: Joi.string().optional(),
    country: Joi.string().optional(),
    student: Joi.string().optional(),
    branch: Joi.string().optional(),
    agent: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
});
