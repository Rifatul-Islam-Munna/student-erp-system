import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import Student from '../models/Student.js';
import User from '../models/User.js';
import PartnerAgency from '../models/PartnerAgency.js';
import Branch from '../models/Branch.js';
import logger from '../services/logger.service.js';
import { sendWelcomeCredentials } from '../services/notification.service.js';

const toNumberOrUndefined = (value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? undefined : numberValue;
};

const hasValue = (value) => value !== '' && value !== null && value !== undefined;

const formatDateValue = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

const getDatePart = (value, part) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    if (part === 'year') return String(date.getUTCFullYear());
    if (part === 'month') return String(date.getUTCMonth() + 1).padStart(2, '0');
    if (part === 'day') return String(date.getUTCDate()).padStart(2, '0');
    return '';
};

const splitName = (value = '') => {
    const parts = String(value).trim().split(/\s+/).filter(Boolean);
    return {
        first: parts[0] || '',
        middle: parts.length > 2 ? parts.slice(1, -1).join(' ') : (parts.length === 3 ? parts[1] : ''),
        last: parts.length > 1 ? parts[parts.length - 1] : ''
    };
};

const calculateAge = (value) => {
    if (!value) return '';
    const dob = new Date(value);
    if (Number.isNaN(dob.getTime())) return '';
    const today = new Date();
    let age = today.getUTCFullYear() - dob.getUTCFullYear();
    const monthDiff = today.getUTCMonth() - dob.getUTCMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < dob.getUTCDate())) age -= 1;
    return String(age);
};

const buildDerivedDocVariables = (payload = {}) => {
    const nameEn = splitName(payload.fullNameEn);
    const nameKatakana = splitName(payload.nameKatakana);
    const education = Array.isArray(payload.education) ? payload.education : [];
    const employment = Array.isArray(payload.employment) ? payload.employment : [];
    const jpStudy = (Array.isArray(payload.languageEducation) ? payload.languageEducation : []).find((item) => item?.languageKey === 'jp_study') || {};
    const ssc = education.find((item) => item?.educationKey === 'ssc') || {};
    const hsc = education.find((item) => item?.educationKey === 'hsc') || {};
    const bachelor = education.find((item) => item?.educationKey === 'bachelor') || {};
    const work1 = employment[0] || {};
    const work2 = employment[1] || {};

    return {
        '{{name_en}}': payload.fullNameEn || '',
        '{{name_en:first}}': nameEn.first,
        '{{name_en:middle}}': nameEn.middle,
        '{{name_en:last}}': nameEn.last,
        '{{name_katakana}}': payload.nameKatakana || '',
        '{{name_katakana:first}}': nameKatakana.first,
        '{{name_katakana:middle}}': nameKatakana.middle,
        '{{name_katakana:last}}': nameKatakana.last,
        '{{name_bd}}': payload.name_bd || '',
        '{{dob}}': formatDateValue(payload.dob),
        '{{dob:day}}': getDatePart(payload.dob, 'day'),
        '{{dob:month}}': getDatePart(payload.dob, 'month'),
        '{{dob:year}}': getDatePart(payload.dob, 'year'),
        '{{age}}': calculateAge(payload.dob),
        '{{gender}}': payload.gender || '',
        '{{marital_status}}': payload.maritalStatus || '',
        '{{nationality}}': payload.nationality || '',
        '{{nationality_en}}': payload.nationality || '',
        '{{nationality_bd}}': payload.nationality || '',
        '{{blood_group}}': payload.bloodGroup || '',
        '{{phone}}': payload.phone || '',
        '{{email}}': payload.email || '',
        '{{whatsapp}}': payload.whatsapp || '',
        '{{lineapp}}': payload.lineapp || '',
        '{{facebookprofile}}': payload.facebookprofile || '',
        '{{birth_place}}': payload.birth_place || '',
        '{{birth_place_en}}': payload.birth_place || '',
        '{{birth_place_bd}}': payload.birth_place || '',
        '{{occupation}}': payload.occupation || '',
        '{{spouse_name}}': payload.spouseName || '',
        '{{emergency_contact}}': payload.emergencyContact || '',
        '{{emergency_phone}}': payload.emergencyPhone || '',
        '{{nid}}': payload.nationalId || '',
        '{{nid_number}}': payload.nationalId || '',
        '{{nid_number }}': payload.nationalId || '',
        '{{passport_number}}': payload.passportNo || '',
        '{{passport_issue}}': formatDateValue(payload.passportIssueDate),
        '{{passport_issue:year}}': getDatePart(payload.passportIssueDate, 'year'),
        '{{passport_issue:month}}': getDatePart(payload.passportIssueDate, 'month'),
        '{{passport_issue:day}}': getDatePart(payload.passportIssueDate, 'day'),
        '{{passport_expiry}}': formatDateValue(payload.passportExpiryDate),
        '{{passport_expiry:year}}': getDatePart(payload.passportExpiryDate, 'year'),
        '{{passport_expiry:month}}': getDatePart(payload.passportExpiryDate, 'month'),
        '{{passport_expiry:day}}': getDatePart(payload.passportExpiryDate, 'day'),
        '{{father_name:en}}': payload.father_name_en || '',
        '{{mother_name:en}}': payload.mother_name_en || '',
        '{{mother_dob}}': formatDateValue(payload.mother_dob),
        '{{mother_dob:year}}': getDatePart(payload.mother_dob, 'year'),
        '{{mother_dob:month}}': getDatePart(payload.mother_dob, 'month'),
        '{{mother_dob:day}}': getDatePart(payload.mother_dob, 'day'),
        '{{mother_phone}}': payload.mother_phone || '',
        '{{sponsor_name:en}}': payload.sponsor_name_en || '',
        '{{sponsor_name_en}}': payload.sponsor_name_en || '',
        '{{sponsor_relationship}}': payload.sponsor_relationship || '',
        '{{permanent_address}}': payload.permanentAddress || '',
        '{{permanent_address:en}}': payload.permanentAddress || '',
        '{{permanent_address:bd}}': payload.permanentAddress || '',
        '{{present_address}}': payload.currentAddress || payload.permanentAddress || '',
        '{{bc_date of registration}}': formatDateValue(payload.bc_date_of_registration),
        '{{bc_registration:year}}': getDatePart(payload.bc_date_of_registration, 'year'),
        '{{bc_registration:month}}': getDatePart(payload.bc_date_of_registration, 'month'),
        '{{bc_registration:day}}': getDatePart(payload.bc_date_of_registration, 'day'),
        '{{bc_date of Issuance}}': formatDateValue(payload.bc_date_of_issuance),
        '{{bc_ Issuance:year}}': getDatePart(payload.bc_date_of_issuance, 'year'),
        '{{bc_ Issuance:month}}': getDatePart(payload.bc_date_of_issuance, 'month'),
        '{{bc_ Issuance:day}}': getDatePart(payload.bc_date_of_issuance, 'day'),
        '{{edu_ssc_school}}': payload.edu_ssc_school || ssc.institution || '',
        '{{edu_ssc_year}}': String(payload.edu_ssc_year || ssc.year || ''),
        '{{edu_ssc_ year}}': String(payload.edu_ssc_year || ssc.year || ''),
        '{{edu_ssc:year}}': String(payload.edu_ssc_year || ssc.year || ''),
        '{{edu_ssc :year}}': String(payload.edu_ssc_year || ssc.year || ''),
        '{{edu_ssc_board}}': payload.edu_ssc_board || ssc.board || '',
        '{{edu_ssc_gpa}}': String(ssc.gpa || ''),
        '{{edu_ssc_subject}}': payload.edu_ssc_subject || ssc.group || '',
        '{{edu_ssc_address}}': ssc.address || '',
        '{{edu_hsc_school}}': payload.edu_hsc_school || hsc.institution || '',
        '{{edu_hsc_year}}': String(payload.edu_hsc_year || hsc.year || ''),
        '{{edu_hsc_ year}}': String(payload.edu_hsc_year || hsc.year || ''),
        '{{edu_hsc:year}}': String(payload.edu_hsc_year || hsc.year || ''),
        '{{edu_hsc_board}}': payload.edu_hsc_board || hsc.board || '',
        '{{edu_hsc_gpa}}': String(hsc.gpa || ''),
        '{{edu_hsc_subject}}': payload.edu_hsc_subject || hsc.group || '',
        '{{edu_hsc_address}}': hsc.address || '',
        '{{edu_hsc:months}}': String(payload.edu_hsc_months || hsc.durationMonths || ''),
        '{{edu_hsc_ months}}': String(payload.edu_hsc_months || hsc.durationMonths || ''),
        '{{edu_hsc expected schedule:year}}': String(payload.edu_hsc_expected_schedule_year || hsc.expectedScheduleYear || ''),
        '{{edu_ hsc expected schedule:months}}': String(payload.edu_hsc_expected_schedule_months || hsc.expectedScheduleMonths || ''),
        '{{edu_hsc exam conducted:year}}': String(payload.edu_hsc_exam_conducted_year || hsc.examConductedYear || ''),
        '{{edu_ hsc exam conducted:months}}': String(payload.edu_hsc_exam_conducted_months || hsc.examConductedMonths || ''),
        '{{edu_bachelor/degree:subject}}': payload.edu_bachelor_degree_subject || bachelor.group || '',
        '{{name_course}}': payload.name_course || bachelor.courseName || '',
        '{{name_subject}}': payload.name_subject || bachelor.subjectName || '',
        '{{course_completion:Year}}': String(payload.course_completion_year || bachelor.completionYear || ''),
        '{{course_completion:month}}': String(payload.course_completion_month || bachelor.completionMonth || ''),
        '{{course_under:institution}}': payload.course_under_institution || bachelor.courseUnderInstitution || '',
        '{{institution_ board}}': payload.institution_board || bachelor.institutionBoard || '',
        '{{institution_ college}}': payload.institution_college || bachelor.institutionCollege || '',
        '{{institution_ university}}': payload.institution_university || bachelor.institutionUniversity || '',
        '{{institution_ national university}}': payload.institution_national_university || bachelor.institutionNationalUniversity || '',
        '{{institution_ private university}}': payload.institution_private_university || bachelor.institutionPrivateUniversity || '',
        '{{institution_ dhaka university}}': payload.institution_dhaka_university || bachelor.institutionDhakaUniversity || '',
        '{{jp_study_institution}}': payload.jp_study_institution || jpStudy.instituteName || '',
        '{{jp_study_institution_Nexus Japanese Language Academy/Aim Education}}': payload.jp_study_institution_preferred || jpStudy.preferredInstituteName || payload.jp_study_institution || jpStudy.instituteName || '',
        '{{jp_study_hours}}': String(payload.jp_study_hours || jpStudy.totalHours || ''),
        '{{jp_study_months}}': String(payload.jp_study_months || jpStudy.durationMonths || ''),
        '{{work_company_name}}': work1.companyName || '',
        '{{work_address}}': work1.address || '',
        '{{work_position}}': work1.position || '',
        '{{work2_company:name}}': work2.companyName || '',
        '{{work2_address}}': work2.address || '',
        '{{work2_position}}': work2.position || '',
        '{{country}}': payload.country || '',
        '{{school}}': payload.schoolName || '',
        '{{intake}}': payload.intake || '',
        '{{visa_type}}': payload.visaType || '',
        '{{student_type}}': payload.studentType || '',
        '{{source}}': payload.source || '',
        '{{status}}': payload.status || ''
    };
};

const upsertArrayRecord = (list, key, record) => {
    const nextList = Array.isArray(list) ? [...list] : [];
    const index = nextList.findIndex((item) => item?.educationKey === key || item?.languageKey === key);
    if (index >= 0) {
        nextList[index] = { ...nextList[index], ...record };
    } else {
        nextList.push(record);
    }
    return nextList;
};

const normalizeStudentPayload = (body = {}) => {
    const payload = { ...body };

    if (!hasValue(payload.fullNameEn) && hasValue(payload.name_en)) {
        payload.fullNameEn = payload.name_en;
    }
    if (!hasValue(payload.schoolName) && hasValue(payload.school)) {
        payload.schoolName = payload.school;
    }

    const sscRecord = {
        educationKey: 'ssc',
        level: 'SSC',
        institution: payload.edu_ssc_school,
        board: payload.edu_ssc_board,
        group: payload.edu_ssc_subject,
        year: toNumberOrUndefined(payload.edu_ssc_year),
        durationMonths: toNumberOrUndefined(payload.edu_ssc_months)
    };
    if ([payload.edu_ssc_school, payload.edu_ssc_board, payload.edu_ssc_subject, payload.edu_ssc_year, payload.edu_ssc_months].some(hasValue)) {
        payload.education = upsertArrayRecord(payload.education, 'ssc', sscRecord);
    }

    const hscRecord = {
        educationKey: 'hsc',
        level: 'HSC',
        institution: payload.edu_hsc_school,
        board: payload.edu_hsc_board,
        group: payload.edu_hsc_subject,
        year: toNumberOrUndefined(payload.edu_hsc_year),
        durationMonths: toNumberOrUndefined(payload.edu_hsc_months),
        expectedScheduleYear: toNumberOrUndefined(payload.edu_hsc_expected_schedule_year),
        expectedScheduleMonths: toNumberOrUndefined(payload.edu_hsc_expected_schedule_months),
        examConductedYear: toNumberOrUndefined(payload.edu_hsc_exam_conducted_year),
        examConductedMonths: toNumberOrUndefined(payload.edu_hsc_exam_conducted_months)
    };
    if ([
        payload.edu_hsc_school,
        payload.edu_hsc_board,
        payload.edu_hsc_subject,
        payload.edu_hsc_year,
        payload.edu_hsc_months,
        payload.edu_hsc_expected_schedule_year,
        payload.edu_hsc_expected_schedule_months,
        payload.edu_hsc_exam_conducted_year,
        payload.edu_hsc_exam_conducted_months
    ].some(hasValue)) {
        payload.education = upsertArrayRecord(payload.education, 'hsc', hscRecord);
    }

    const bachelorRecord = {
        educationKey: 'bachelor',
        level: payload.name_course || 'Bachelor / Degree',
        subjectName: payload.name_subject,
        group: payload.edu_bachelor_degree_subject,
        courseName: payload.name_course,
        courseUnderInstitution: payload.course_under_institution,
        institutionBoard: payload.institution_board,
        institutionCollege: payload.institution_college,
        institutionUniversity: payload.institution_university,
        institutionNationalUniversity: payload.institution_national_university,
        institutionPrivateUniversity: payload.institution_private_university,
        institutionDhakaUniversity: payload.institution_dhaka_university,
        completionYear: toNumberOrUndefined(payload.course_completion_year),
        completionMonth: toNumberOrUndefined(payload.course_completion_month)
    };
    if ([
        payload.name_course,
        payload.name_subject,
        payload.edu_bachelor_degree_subject,
        payload.course_under_institution,
        payload.institution_board,
        payload.institution_college,
        payload.institution_university,
        payload.institution_national_university,
        payload.institution_private_university,
        payload.institution_dhaka_university,
        payload.course_completion_year,
        payload.course_completion_month
    ].some(hasValue)) {
        payload.education = upsertArrayRecord(payload.education, 'bachelor', bachelorRecord);
    }

    const japaneseStudyRecord = {
        languageKey: 'jp_study',
        instituteName: payload.jp_study_institution,
        preferredInstituteName: payload.jp_study_institution_preferred,
        totalHours: toNumberOrUndefined(payload.jp_study_hours),
        durationMonths: toNumberOrUndefined(payload.jp_study_months)
    };
    if ([payload.jp_study_institution, payload.jp_study_institution_preferred, payload.jp_study_hours, payload.jp_study_months].some(hasValue)) {
        payload.languageEducation = upsertArrayRecord(payload.languageEducation, 'jp_study', japaneseStudyRecord);
    }

    payload.docVariables = {
        ...(payload.docVariables || {}),
        ...Object.fromEntries(
            Object.entries(buildDerivedDocVariables(payload)).filter(([, value]) => hasValue(value))
        )
    };

    return payload;
};

export const getStudentStats = async (request, reply) => {
    try {
        const total = await Student.countDocuments();
        
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newThisMonth = await Student.countDocuments({ createdAt: { $gte: startOfMonth } });

        const branchDistribution = await Student.aggregate([
            { $group: { _id: "$branch", count: { $sum: 1 } } }
        ]);

        const counselorDistribution = await Student.aggregate([
            { $group: { _id: "$counselor", count: { $sum: 1 } } }
        ]);

        return reply.send({
            success: true,
            data: {
                total,
                newThisMonth,
                branchDistribution,
                counselorDistribution
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to fetch student tracking metrics' });
    }
};

export const getAllStudents = async (request, reply) => {
    try {
        const { page = 1, limit = 10, startDate, endDate, branch, counselor, partnerAgency, search } = request.query;
        
        const query = {};
        
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate) {
            query.createdAt = { $gte: new Date(startDate) };
        }

        if (branch) query.branch = branch;
        if (counselor) query.counselor = counselor;
        if (partnerAgency) query.partnerAgency = partnerAgency;

        if (search) {
            query.$or = [
                { fullNameEn: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { nationalId: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [students, total] = await Promise.all([
            Student.find(query)
                .populate('branch', 'name')
                .populate('counselor', 'fullName')
                .populate('agent', 'fullName')
                .populate('partnerAgency', 'agencyName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Student.countDocuments(query)
        ]);
        
        return reply.code(200).send({
            success: true,
            data: students,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to retrieve student records.' });
    }
};

export const getStudentById = async (request, reply) => {
    try {
        const student = await Student.findById(request.params.id)
            .populate('branch', 'name')
            .populate('counselor', 'fullName')
            .populate('agent', 'fullName')
            .populate('partnerAgency', 'agencyName');
        if (!student) return reply.code(404).send({ success: false, message: 'Student not found.' });

        return reply.code(200).send({ success: true, data: student });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to retrieve student record.' });
    }
};

export const createStudent = async (request, reply) => {
    try {
        const student = await Student.create(normalizeStudentPayload(request.body));

        // Auto-add commission to agent if linked
        if (student.agent) {
            const agentUser = await User.findById(student.agent);
            if (agentUser && agentUser.role === 'agent') {
                agentUser.totalEarnings += (agentUser.commissionAmount || 0);
                await agentUser.save({ validateModifiedOnly: true });
                logger.info(`Commission added to agent ${agentUser.fullName} for student ${student.fullNameEn}`);
            }
        }

        // Send welcome notification
        if (request.user) {
            const rawPassword = request.body.password || 'student123';
            sendWelcomeCredentials('Student', student, rawPassword, {
                _id: request.user._id,
                role: request.user.role,
                branch: request.user.branch
            }).catch(e => logger.error(e, 'sendWelcomeCredentials error'));
        }

        return reply.code(201).send({
            success: true,
            message: 'Student record configured smoothly with automated agent commission processing.',
            data: student
        });
    } catch (error) {
        logger.error(error);
        if (error.name === 'ValidationError') {
            return reply.code(400).send({ success: false, message: error.message });
        }
        return reply.code(500).send({ success: false, message: 'Failed to create student record.' });
    }
};

export const updateStudent = async (request, reply) => {
    try {
        const oldStudent = await Student.findById(request.params.id);
        if (!oldStudent) return reply.code(404).send({ success: false, message: 'Student not found.' });

        const student = await Student.findByIdAndUpdate(
            request.params.id, 
            normalizeStudentPayload(request.body), 
            { new: true, runValidators: true }
        );
        
        // If agent is newly assigned or changed
        if (request.body.agent && request.body.agent.toString() !== (oldStudent.agent ? oldStudent.agent.toString() : '')) {
            const agentUser = await User.findById(request.body.agent);
            if (agentUser && agentUser.role === 'agent') {
                agentUser.totalEarnings += (agentUser.commissionAmount || 0);
                await agentUser.save({ validateModifiedOnly: true });
                logger.info(`Commission added to new agent ${agentUser.fullName} for updated student ${student.fullNameEn}`);
            }
        }

        return reply.send({ success: true, message: 'Student payload mutated logically with commission updates handled.', data: student });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to update student record.' });
    }
};

export const deleteStudent = async (request, reply) => {
    try {
        const student = await Student.findByIdAndDelete(request.params.id);
        if (!student) return reply.code(404).send({ success: false, message: 'Missing implicitly locally processing.' });
        
        return reply.send({ success: true, message: 'Student record deleted successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to delete student record.' });
    }
};

export const exportStudents = async (request, reply) => {
    try {
        const { startDate, endDate, branch, counselor } = request.query;
        const query = {};
        
        if (startDate && endDate) query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        if (branch) query.branch = branch;
        if (counselor) query.counselor = counselor;

        const students = await Student.find(query)
            .populate('branch', 'name')
            .populate('counselor', 'fullName')
            .populate('agent', 'fullName')
            .populate('partnerAgency', 'agencyName')
            .lean();
        
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="students_export.csv"');

        const outputStream = stringify(students, {
            header: true,
            columns: [
                { key: 'fullNameEn', header: 'Full Name (EN)' },
                { key: 'nameKatakana', header: 'Name Katakana' },
                { key: 'email', header: 'Email' },
                { key: 'phone', header: 'Phone' },
                { key: 'whatsapp', header: 'WhatsApp' },
                { key: 'guardianPhone', header: 'Guardian Phone' },
                { key: 'dob', header: 'Date of Birth' },
                { key: 'gender', header: 'Gender' },
                { key: 'maritalStatus', header: 'Marital Status' },
                { key: 'nationality', header: 'Nationality' },
                { key: 'bloodGroup', header: 'Blood Group' },
                { key: 'nationalId', header: 'National ID' },
                { key: 'passportNo', header: 'Passport No' },
                { key: 'passportIssueDate', header: 'Passport Issue Date' },
                { key: 'passportExpiryDate', header: 'Passport Expiry Date' },
                { key: 'occupation', header: 'Occupation' },
                { key: 'spouseName', header: 'Spouse Name' },
                { key: 'emergencyContact', header: 'Emergency Contact' },
                { key: 'emergencyPhone', header: 'Emergency Phone' },
                { key: 'permanentAddress', header: 'Permanent Address' },
                { key: 'currentAddressSameAsPermanent', header: 'Current Address Same As Permanent' },
                { key: 'currentAddress', header: 'Current Address' },
                { key: 'education', header: 'Education (JSON)' },
                { key: 'employment', header: 'Employment (JSON)' },
                { key: 'languageEducation', header: 'Language Education (JSON)' },
                { key: 'languageTest', header: 'Language Test (JSON)' },
                { key: 'visaType', header: 'Visa Type' },
                { key: 'country', header: 'Country' },
                { key: 'schoolName', header: 'School Name' },
                { key: 'intake', header: 'Intake' },
                { key: 'expectedIntake', header: 'Expected Intake' },
                { key: 'source', header: 'Source' },
                { key: 'applicationType', header: 'Application Type' },
                { key: 'studentType', header: 'Student Type' },
                { key: 'branch.name', header: 'Branch' },
                { key: 'counselor.fullName', header: 'Counselor' },
                { key: 'agent.fullName', header: 'Agent' },
                { key: 'partnerAgency.agencyName', header: 'Partner Agency' },
                { key: 'googleDriveLink', header: 'Google Drive Link' },
                { key: 'internalNotes', header: 'Internal Notes' },
                { key: 'createdAt', header: 'Join Date' }
            ],
            cast: {
                object: (value) => {
                    if (Array.isArray(value)) return JSON.stringify(value);
                    return value;
                },
                date: (value) => value.toISOString()
            }
        });

        return reply.send(outputStream);
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to export student records.' });
    }
};

export const importStudents = async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, message: 'No file uploaded.' });

        const results = [];
        const stream = data.file.pipe(parse({ columns: true, skip_empty_lines: true }));

        for await (const row of stream) {
            if (row['Full Name (EN)'] && row['Email']) {
                let agencyId = null;
                if (row['Partner Agency']) {
                    const agency = await PartnerAgency.findOne({ 
                        agencyName: { $regex: new RegExp(`^${row['Partner Agency']}$`, 'i') } 
                    });
                    if (agency) agencyId = agency._id;
                }

                let branchId = null;
                if (row['Branch']) {
                    const branchDoc = await Branch.findOne({ 
                        name: { $regex: new RegExp(`^${row['Branch']}$`, 'i') } 
                    });
                    if (branchDoc) branchId = branchDoc._id;
                }

                let counselorId = null;
                if (row['Counselor']) {
                    const counselorDoc = await User.findOne({ 
                        fullName: { $regex: new RegExp(`^${row['Counselor']}$`, 'i') },
                        role: 'counselor'
                    });
                    if (counselorDoc) counselorId = counselorDoc._id;
                }

                let agentId = null;
                if (row['Agent']) {
                    const agentDoc = await User.findOne({ 
                        fullName: { $regex: new RegExp(`^${row['Agent']}$`, 'i') },
                        role: 'agent'
                    });
                    if (agentDoc) agentId = agentDoc._id;
                }

                const safeJsonParse = (str) => {
                    try { return str ? JSON.parse(str) : []; }
                    catch (e) { return []; }
                };

                results.push({
                    fullNameEn: row['Full Name (EN)'],
                    nameKatakana: row['Name Katakana'],
                    email: row['Email'],
                    phone: row['Phone'],
                    whatsapp: row['WhatsApp'],
                    guardianPhone: row['Guardian Phone'],
                    dob: row['Date of Birth'] ? new Date(row['Date of Birth']) : new Date(),
                    gender: row['Gender'] ? row['Gender'].toLowerCase() : 'other',
                    maritalStatus: row['Marital Status'] ? row['Marital Status'].toLowerCase() : 'single',
                    nationality: row['Nationality'],
                    bloodGroup: row['Blood Group'],
                    nationalId: row['National ID'],
                    passportNo: row['Passport No'],
                    passportIssueDate: row['Passport Issue Date'] ? new Date(row['Passport Issue Date']) : undefined,
                    passportExpiryDate: row['Passport Expiry Date'] ? new Date(row['Passport Expiry Date']) : undefined,
                    occupation: row['Occupation'],
                    spouseName: row['Spouse Name'],
                    emergencyContact: row['Emergency Contact'],
                    emergencyPhone: row['Emergency Phone'],
                    permanentAddress: row['Permanent Address'],
                    currentAddressSameAsPermanent: row['Current Address Same As Permanent'] === 'true',
                    currentAddress: row['Current Address'],
                    
                    education: safeJsonParse(row['Education (JSON)']),
                    employment: safeJsonParse(row['Employment (JSON)']),
                    languageEducation: safeJsonParse(row['Language Education (JSON)']),
                    languageTest: safeJsonParse(row['Language Test (JSON)']),

                    visaType: row['Visa Type'],
                    country: row['Country'],
                    schoolName: row['School Name'],
                    intake: row['Intake'],
                    expectedIntake: row['Expected Intake'],
                    source: row['Source'],
                    applicationType: row['Application Type'],
                    studentType: row['Student Type'] ? row['Student Type'].toLowerCase() : 'own',
                    
                    googleDriveLink: row['Google Drive Link'],
                    internalNotes: row['Internal Notes'],

                    branch: branchId,
                    counselor: counselorId,
                    agent: agentId,
                    partnerAgency: agencyId
                });
            }
        }

        if (results.length > 0) {
            await Student.insertMany(results);
        }

        return reply.send({ success: true, message: 'Student records imported successfully.' });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to import student records.' });
    }
};

export const searchStudents = async (request, reply) => {
    try {
        const { q } = request.query;
        if (!q) {
            return reply.send({ success: true, data: [] });
        }
        
        const students = await Student.find({
            $or: [
                { fullNameEn: { $regex: q, $options: 'i' } },
                { phone: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        }).select('_id fullNameEn phone email').limit(20);
        
        return reply.send({ success: true, data: students });
    } catch (error) {
        logger.error(error);
        return reply.code(500).send({ success: false, message: 'Failed to search students.' });
    }
};
