const educationObject = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        educationKey: { type: 'string' },
        degreeExam: { type: 'string' },
        level: { type: 'string' },
        institutionName: { type: 'string' },
        institution: { type: 'string' },
        passingYear: { type: 'number' },
        year: { type: 'number' },
        board: { type: 'string' },
        gpa: { type: 'number' },
        groupSubject: { type: 'string' },
        group: { type: 'string' },
        durationMonths: { type: 'number' },
        expectedScheduleYear: { type: 'number' },
        expectedScheduleMonths: { type: 'number' },
        examConductedYear: { type: 'number' },
        examConductedMonths: { type: 'number' },
        courseName: { type: 'string' },
        subjectName: { type: 'string' },
        courseUnderInstitution: { type: 'string' },
        institutionBoard: { type: 'string' },
        institutionCollege: { type: 'string' },
        institutionUniversity: { type: 'string' },
        institutionNationalUniversity: { type: 'string' },
        institutionPrivateUniversity: { type: 'string' },
        institutionDhakaUniversity: { type: 'string' },
        completionYear: { type: 'number' },
        completionMonth: { type: 'number' },
        address: { type: 'string' },
        entranceDate: { type: 'string', format: 'date-time' },
        graduationDate: { type: 'string', format: 'date-time' }
    },
    additionalProperties: true
};

const employmentObject = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        companyName: { type: 'string' },
        address: { type: 'string' },
        jobTitle: { type: 'string' },
        position: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' }
    },
    additionalProperties: true
};

const languageEducationObject = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        languageKey: { type: 'string' },
        instituteName: { type: 'string' },
        preferredInstituteName: { type: 'string' },
        address: { type: 'string' },
        fromDate: { type: 'string', format: 'date-time' },
        toDate: { type: 'string', format: 'date-time' },
        totalHours: { type: 'number' },
        durationMonths: { type: 'number' },
        attendancePercentage: { type: 'number' },
        grade: { type: 'string' }
    },
    additionalProperties: true
};

const languageTestObject = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        examType: { type: 'string' },
        level: { type: 'string' },
        examDate: { type: 'string', format: 'date-time' },
        score: { type: 'string' },
        result: { type: 'string' }
    },
    additionalProperties: true
};

export const studentResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        fullNameEn: { type: 'string' },
        nameKatakana: { type: 'string' },
        name_bd: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        whatsapp: { type: 'string' },
        lineapp: { type: 'string' },
        facebookprofile: { type: 'string' },
        guardianPhone: { type: 'string' },
        dob: { type: 'string', format: 'date-time' },
        gender: { type: 'string' },
        maritalStatus: { type: 'string' },
        nationality: { type: 'string' },
        birth_place: { type: 'string' },
        bloodGroup: { type: 'string' },
        nationalId: { type: 'string' },
        passportNo: { type: 'string' },
        passportIssueDate: { type: 'string', format: 'date-time' },
        passportExpiryDate: { type: 'string', format: 'date-time' },
        bc_date_of_registration: { type: 'string', format: 'date-time' },
        bc_date_of_issuance: { type: 'string', format: 'date-time' },
        occupation: { type: 'string' },
        spouseName: { type: 'string' },
        father_name_en: { type: 'string' },
        mother_name_en: { type: 'string' },
        sponsor_name_en: { type: 'string' },
        sponsor_relationship: { type: 'string' },
        sponsor_name_bd: { type: 'string' },
        sponsor_personal_number: { type: 'string' },
        father_name_bd: { type: 'string' },
        father_dob: { type: 'string', format: 'date-time' },
        father_occupation: { type: 'string' },
        father_phone: { type: 'string' },
        mother_name_bd: { type: 'string' },
        mother_occupation: { type: 'string' },
        passport_issuing_authority: { type: 'string' },
        nid_issue_date: { type: 'string', format: 'date-time' },
        family1_name: { type: 'string' },
        family1_dob: { type: 'string', format: 'date-time' },
        family1_occupation: { type: 'string' },
        family2_name: { type: 'string' },
        family2_dob: { type: 'string', format: 'date-time' },
        family2_occupation: { type: 'string' },
        family3_name: { type: 'string' },
        family3_dob: { type: 'string', format: 'date-time' },
        family3_occupation: { type: 'string' },
        emergencyContact: { type: 'string' },
        emergencyPhone: { type: 'string' },
        permanentAddress: { type: 'string' },
        currentAddressSameAsPermanent: { type: 'boolean' },
        currentAddress: { type: 'string' },
        education: { type: 'array', items: educationObject },
        employment: { type: 'array', items: employmentObject },
        languageEducation: { type: 'array', items: languageEducationObject },
        languageTest: { type: 'array', items: languageTestObject },
        visaType: { type: 'string' },
        country: { type: 'string' },
        schoolName: { type: 'string' },
        intake: { type: 'string' },
        expectedIntake: { type: 'string' },
        agent: { type: ['string', 'object'] },
        counselor: { type: ['string', 'object'] },
        source: { type: 'string' },
        status: { type: 'string' },
        applicationType: { type: 'string' },
        studentType: { type: 'string' },
        batch: { type: ['string', 'object'] },
        branch: { type: ['string', 'object'] },
        edu_ssc_school: { type: 'string' },
        edu_ssc_board: { type: 'string' },
        edu_ssc_subject: { type: 'string' },
        edu_ssc_year: { type: 'number' },
        edu_ssc_months: { type: 'number' },
        edu_hsc_school: { type: 'string' },
        edu_hsc_board: { type: 'string' },
        edu_hsc_subject: { type: 'string' },
        edu_hsc_year: { type: 'number' },
        edu_hsc_months: { type: 'number' },
        edu_hsc_expected_schedule_year: { type: 'number' },
        edu_hsc_expected_schedule_months: { type: 'number' },
        edu_hsc_exam_conducted_year: { type: 'number' },
        edu_hsc_exam_conducted_months: { type: 'number' },
        edu_bachelor_degree_subject: { type: 'string' },
        jp_study_institution: { type: 'string' },
        jp_study_institution_preferred: { type: 'string' },
        jp_study_hours: { type: 'number' },
        jp_study_months: { type: 'number' },
        name_course: { type: 'string' },
        name_subject: { type: 'string' },
        course_completion_year: { type: 'number' },
        course_completion_month: { type: 'number' },
        course_under_institution: { type: 'string' },
        institution_board: { type: 'string' },
        institution_college: { type: 'string' },
        institution_university: { type: 'string' },
        institution_national_university: { type: 'string' },
        institution_private_university: { type: 'string' },
        institution_dhaka_university: { type: 'string' },
        googleDriveLink: { type: 'string' },
        internalNotes: { type: 'string' },
        docVariables: { type: 'object', additionalProperties: true },
        explanationChecks: { type: 'object', additionalProperties: { type: 'boolean' } },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    },
    additionalProperties: true
};

export const getAllStudentsSwagger = {
    tags: ['Students'],
    description: 'All Students',
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            branch: { type: 'string' },
            counselor: { type: 'string' },
            search: { type: 'string' }
        },
        additionalProperties: true
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: studentResponseSchema
                },
                pagination: {
                    type: 'object',
                    properties: {
                        total: { type: 'number' },
                        pages: { type: 'number' },
                        page: { type: 'number' },
                        limit: { type: 'number' }
                    }
                }
            }
        }
    }
};

export const createStudentSwagger = {
    tags: ['Students'],
    description: 'Student Create',
    security: [{ bearerAuth: [] }],
    body: studentResponseSchema,
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: studentResponseSchema
            }
        }
    }
};

export const getStudentStatsSwagger = {
    tags: ['Students'],
    description: 'Student Stats',
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    additionalProperties: true
                }
            }
        }
    }
};
