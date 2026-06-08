const normalizeTemplateVariable = (templateVariable) =>
    String(templateVariable || '')
        .replace(/^\{\{|\}\}$/g, '')
        .trim();

const toDocVariablePath = (templateVariable) => `docVariables.${normalizeTemplateVariable(templateVariable)}`;

const explicitFieldMap = {
    '{{name_en}}': { dbField: 'fullNameEn', source: 'field' },
    '{{name_en:first}}': { dbField: 'fullNameEn', source: 'derived', transform: 'name.first' },
    '{{name_en:middle}}': { dbField: 'fullNameEn', source: 'derived', transform: 'name.middle' },
    '{{name_en:last}}': { dbField: 'fullNameEn', source: 'derived', transform: 'name.last' },
    '{{name_katakana}}': { dbField: 'nameKatakana', source: 'field' },
    '{{name_katakana:first}}': { dbField: 'nameKatakana', source: 'derived', transform: 'name.first' },
    '{{name_katakana:middle}}': { dbField: 'nameKatakana', source: 'derived', transform: 'name.middle' },
    '{{name_katakana:last}}': { dbField: 'nameKatakana', source: 'derived', transform: 'name.last' },
    '{{name_bd}}': { dbField: 'name_bd', source: 'field' },
    '{{dob}}': { dbField: 'dob', source: 'field' },
    '{{dob:day}}': { dbField: 'dob', source: 'derived', transform: 'date.day' },
    '{{dob:month}}': { dbField: 'dob', source: 'derived', transform: 'date.month' },
    '{{dob:year}}': { dbField: 'dob', source: 'derived', transform: 'date.year' },
    '{{age}}': { dbField: 'dob', source: 'derived', transform: 'age' },
    '{{gender}}': { dbField: 'gender', source: 'field' },
    '{{marital_status}}': { dbField: 'maritalStatus', source: 'field' },
    '{{nationality}}': { dbField: 'nationality', source: 'field' },
    '{{nationality_en}}': { dbField: 'nationality', source: 'field' },
    '{{nationality_bd}}': { dbField: 'nationality', source: 'docVariable' },
    '{{blood_group}}': { dbField: 'bloodGroup', source: 'field' },
    '{{phone}}': { dbField: 'phone', source: 'field' },
    '{{email}}': { dbField: 'email', source: 'field' },
    '{{whatsapp}}': { dbField: 'whatsapp', source: 'field' },
    '{{lineapp}}': { dbField: 'lineapp', source: 'field' },
    '{{facebookprofile}}': { dbField: 'facebookprofile', source: 'field' },
    '{{birth_place}}': { dbField: 'birth_place', source: 'field' },
    '{{birth_place_en}}': { dbField: 'birth_place', source: 'field' },
    '{{birth_place_bd}}': { dbField: 'birth_place', source: 'docVariable' },
    '{{occupation}}': { dbField: 'occupation', source: 'field' },
    '{{spouse_name}}': { dbField: 'spouseName', source: 'field' },
    '{{emergency_contact}}': { dbField: 'emergencyContact', source: 'field' },
    '{{emergency_phone}}': { dbField: 'emergencyPhone', source: 'field' },
    '{{nid}}': { dbField: 'nationalId', source: 'field' },
    '{{nid_number}}': { dbField: 'nationalId', source: 'field' },
    '{{nid_number }}': { dbField: 'nationalId', source: 'field' },
    '{{passport_number}}': { dbField: 'passportNo', source: 'field' },
    '{{passport_issue}}': { dbField: 'passportIssueDate', source: 'field' },
    '{{passport_issue:year}}': { dbField: 'passportIssueDate', source: 'derived', transform: 'date.year' },
    '{{passport_issue:month}}': { dbField: 'passportIssueDate', source: 'derived', transform: 'date.month' },
    '{{passport_issue:day}}': { dbField: 'passportIssueDate', source: 'derived', transform: 'date.day' },
    '{{passport_expiry}}': { dbField: 'passportExpiryDate', source: 'field' },
    '{{passport_expiry:year}}': { dbField: 'passportExpiryDate', source: 'derived', transform: 'date.year' },
    '{{passport_expiry:month}}': { dbField: 'passportExpiryDate', source: 'derived', transform: 'date.month' },
    '{{passport_expiry:day}}': { dbField: 'passportExpiryDate', source: 'derived', transform: 'date.day' },
    '{{bc_date of registration}}': { dbField: 'bc_date_of_registration', source: 'field' },
    '{{bc_registration:year}}': { dbField: 'bc_date_of_registration', source: 'derived', transform: 'date.year' },
    '{{bc_registration:month}}': { dbField: 'bc_date_of_registration', source: 'derived', transform: 'date.month' },
    '{{bc_registration:day}}': { dbField: 'bc_date_of_registration', source: 'derived', transform: 'date.day' },
    '{{bc_date of Issuance}}': { dbField: 'bc_date_of_issuance', source: 'field' },
    '{{bc_ Issuance:year}}': { dbField: 'bc_date_of_issuance', source: 'derived', transform: 'date.year' },
    '{{bc_ Issuance:month}}': { dbField: 'bc_date_of_issuance', source: 'derived', transform: 'date.month' },
    '{{bc_ Issuance:day}}': { dbField: 'bc_date_of_issuance', source: 'derived', transform: 'date.day' },
    '{{father_name:en}}': { dbField: 'father_name_en', source: 'field' },
    '{{mother_name:en}}': { dbField: 'mother_name_en', source: 'field' },
    '{{permanent_address}}': { dbField: 'permanentAddress', source: 'field' },
    '{{permanent_address:en}}': { dbField: 'permanentAddress', source: 'field' },
    '{{present_address}}': { dbField: 'currentAddress', source: 'field' },
    '{{sponsor_name:en}}': { dbField: 'sponsor_name_en', source: 'field' },
    '{{sponsor_name_en}}': { dbField: 'sponsor_name_en', source: 'field' },
    '{{sponsor_relationship}}': { dbField: 'sponsor_relationship', source: 'field' },
    '{{edu_ssc_school}}': { dbField: 'edu_ssc_school', source: 'field' },
    '{{edu_ssc_year}}': { dbField: 'edu_ssc_year', source: 'field' },
    '{{edu_ssc_ year}}': { dbField: 'edu_ssc_year', source: 'field' },
    '{{edu_ssc:year}}': { dbField: 'edu_ssc_year', source: 'field' },
    '{{edu_ssc :year}}': { dbField: 'edu_ssc_year', source: 'field' },
    '{{edu_ssc_board}}': { dbField: 'edu_ssc_board', source: 'field' },
    '{{edu_ssc_subject}}': { dbField: 'edu_ssc_subject', source: 'field' },
    '{{edu_hsc_school}}': { dbField: 'edu_hsc_school', source: 'field' },
    '{{edu_hsc_year}}': { dbField: 'edu_hsc_year', source: 'field' },
    '{{edu_hsc_ year}}': { dbField: 'edu_hsc_year', source: 'field' },
    '{{edu_hsc:year}}': { dbField: 'edu_hsc_year', source: 'field' },
    '{{edu_hsc_board}}': { dbField: 'edu_hsc_board', source: 'field' },
    '{{edu_hsc_subject}}': { dbField: 'edu_hsc_subject', source: 'field' },
    '{{edu_hsc:months}}': { dbField: 'edu_hsc_months', source: 'field' },
    '{{edu_hsc_ months}}': { dbField: 'edu_hsc_months', source: 'field' },
    '{{edu_hsc expected schedule:year}}': { dbField: 'edu_hsc_expected_schedule_year', source: 'field' },
    '{{edu_ hsc expected schedule:months}}': { dbField: 'edu_hsc_expected_schedule_months', source: 'field' },
    '{{edu_hsc exam conducted:year}}': { dbField: 'edu_hsc_exam_conducted_year', source: 'field' },
    '{{edu_ hsc exam conducted:months}}': { dbField: 'edu_hsc_exam_conducted_months', source: 'field' },
    '{{edu_bachelor/degree:subject}}': { dbField: 'edu_bachelor_degree_subject', source: 'field' },
    '{{name_course}}': { dbField: 'name_course', source: 'field' },
    '{{name_subject}}': { dbField: 'name_subject', source: 'field' },
    '{{course_completion:Year}}': { dbField: 'course_completion_year', source: 'field' },
    '{{course_completion:month}}': { dbField: 'course_completion_month', source: 'field' },
    '{{course_under:institution}}': { dbField: 'course_under_institution', source: 'field' },
    '{{institution_ board}}': { dbField: 'institution_board', source: 'field' },
    '{{institution_ college}}': { dbField: 'institution_college', source: 'field' },
    '{{institution_ university}}': { dbField: 'institution_university', source: 'field' },
    '{{institution_ national university}}': { dbField: 'institution_national_university', source: 'field' },
    '{{institution_ private university}}': { dbField: 'institution_private_university', source: 'field' },
    '{{institution_ dhaka university}}': { dbField: 'institution_dhaka_university', source: 'field' },
    '{{jp_study_institution}}': { dbField: 'jp_study_institution', source: 'field' },
    '{{jp_study_institution_Nexus Japanese Language Academy/Aim Education}}': { dbField: 'jp_study_institution_preferred', source: 'field' },
    '{{jp_study_hours}}': { dbField: 'jp_study_hours', source: 'field' },
    '{{jp_study_months}}': { dbField: 'jp_study_months', source: 'field' },
    '{{country}}': { dbField: 'country', source: 'field' },
    '{{school}}': { dbField: 'schoolName', source: 'field' },
    '{{batch}}': { dbField: 'batch', source: 'field' },
    '{{intake}}': { dbField: 'intake', source: 'field' },
    '{{visa_type}}': { dbField: 'visaType', source: 'field' },
    '{{student_type}}': { dbField: 'studentType', source: 'field' },
    '{{source}}': { dbField: 'source', source: 'field' },
    '{{branch}}': { dbField: 'branch', source: 'field' },
    '{{status}}': { dbField: 'status', source: 'field' }
};

export const STUDENT_VARIABLE_TEMPLATES = [
    '{{name_en}}','{{name_en:first}}','{{name_en:middle}}','{{name_en:last}}','{{name_katakana}}','{{name_katakana:first}}','{{name_katakana:middle}}','{{name_katakana:last}}','{{name_bd}}','{{dob}}','{{dob:day}}','{{dob:month}}','{{dob:year}}','{{age}}','{{gender}}','{{marital_status}}','{{nationality}}','{{blood_group}}','{{phone}}','{{email}}','{{whatsapp}}','{{lineapp}}','{{facebookprofile}}','{{birth_place}}','{{occupation}}','{{spouse_name}}','{{emergency_contact}}','{{emergency_phone}}','{{nid}}','{{nid_number}}','{{nid_issue:year}}','{{nid_issue:month}}','{{nid_issue:day}}','{{dob:in word in English}}','{{dob:in word in JP}}','{{bc_code}}','{{bc_number}}','{{birth certificate_Issue from}}','{{bc_union parishad}}','{{bc_paurashava}}','{{bc_city corporration}}','{{bc_location of the register office}}','{{bc_location:union/paurashava/city corporation}}','{{bc_location:upozila}}','{{bc_location:district}}','{{bc_date of registration}}','{{bc_registration:year}}','{{bc_registration:month}}','{{bc_registration:day}}','{{bc_date of Issuance}}','{{bc_ Issuance:year}}','{{bc_ Issuance:month}}','{{bc_ Issuance:day}}','{{father_name:en}}','{{father_name:bd}}','{{mother_name:en}}','{{mother_name:bd}}','{{nationality_en}}','{{nationality_bd}}','{{birth_place_en}}','{{birth_place_bd}}','{{permanent_address:en}}','{{permanent_address:bd}}','{{passport_number}}','{{passport_Issuing authority}}','{{passport_issue}}','{{passport_issue:year}}','{{passport_issue:month}}','{{passport_issue:day}}','{{passport_expiry}}','{{passport_expiry:year}}','{{passport_expiry:month}}','{{passport_expiry:day}}','{{nid_number }}','{{permanent_address}}','{{sponsor_name:en}}','{{sponsor_relationship}}','{{sponsor_personal number}}','{{present_address}}','{{father_dob}}','{{father_dob:year}}','{{father_dob:month}}','{{father_dob:day}}','{{father_occupation}}','{{father_phone}}','{{mother_dob}}','{{mother_dob:year}}','{{mother_dob:month}}','{{mother_dob:day}}','{{mother_occupation}}','{{mother_phone}}','{{frc_union parishad}}','{{frc_paurashava}}','{{frc_city corporration}}','{{frc_location of the register office}}','{{frc_location_union/paurashava/city corporation}}','{{frc_location_upozila}}','{{frc_location_district}}','{{frc_ issue_authority:officer}}','{{frc_ issue_authority:chairman}}','{{frc_ issue_authority:mayor}}','{{frc_ issue_authority:administrator}}','{{frc_ issue_authority:secretary}}','{{frc_ issue_authority:name}}','{{frc_ issue_authority:designation:en}}','{{frc_ issue_authority:designation:jp}}','{{frc_ issue_authority_phone/mobile number}}','{{frc_ issue_authority_email}}','{{family1_name}}','{{family1_relation}}','{{family1_dob}}','{{family1_occupation}}','{{family1_address}}','{{family2_name}}','{{family2_relation}}','{{family2_dob}}','{{family2_occupation}}','{{family2_address}}','{{family3_name}}','{{family3_relation}}','{{family3_dob}}','{{family3_occupation}}','{{family3_address}}','{{edu_ssc_school}}','{{edu_ssc_year}}','{{edu_ssc_board}}','{{edu_ssc_gpa}}','{{edu_ssc_subject}}','{{edu_ssc_address}}','{{edu_ssc_entrance}}','{{edu_hsc_school}}','{{edu_hsc_year}}','{{edu_hsc_board}}','{{edu_hsc_gpa}}','{{edu_hsc_subject}}','{{edu_hsc_address}}','{{edu_hsc_entrance}}','{{edu_honours_school}}','{{edu_honours_year}}','{{edu_honours_gpa}}','{{edu_honours_subject}}','{{edu_honours_address}}','{{edu_honours_entrance}}','{{edu_elementary_school}}','{{edu_elementary_address}}','{{edu_elementary_entrance}}','{{edu_elementary_entrance:year}}','{{edu_elementary_entrance:month}}','{{edu_elementary_graduation}}','{{edu_elementary_graduation:year}}','{{edu_elementary_graduation:month}}','{{edu_elementary_years}}','{{edu_junior_school}}','{{edu_junior_address}}','{{edu_junior_entrance}}','{{edu_junior_entrance:year}}','{{edu_junior_entrance:month}}','{{edu_junior_graduation}}','{{edu_junior_graduation:year}}','{{edu_junior_graduation:month}}','{{edu_junior_years}}','{{edu_highSchool_school}}','{{edu_highSchool_address}}','{{edu_highSchool_entrance}}','{{edu_highSchool_entrance:year}}','{{edu_highSchool_entrance:month}}','{{edu_highSchool_graduation}}','{{edu_highSchool_graduation:year}}','{{edu_highSchool_graduation:month}}','{{edu_highSchool:years}}','{{edu_technical:school}}','{{edu_technical:address}}','{{edu_technical:entrance}}','{{edu_technical:graduation}}','{{edu_university:school}}','{{edu_university:address}}','{{edu_university:entrance}}','{{edu_university:graduation}}','{{jp_exam_type}}','{{jp_NAT Test}}','{{jp_level}}','{{jp_score}}','{{jp_result}}','{{jp_exam:date}}','{{jp_exam_date:year}}','{{jp_exam_date:month}}','{{jp_exam_date:day}}','{{jp_ result :date}}','{{jp_ result _date:year}}','{{jp_ result _date:month}}','{{jp_ result _date:day}}','{{jp_JLPT}}','{{jp_exam_date}}','{{jp_ result _date}}','{{jp_JPT}}','{{jp_study_institution}}','{{jp_study_institution_Nexus Japanese Language Academy/Aim Education}}','{{jp_study_address}}','{{jp_study_from}}','{{jp_study_from:year}}','{{jp_study_from:month}}','{{jp_study_from:day}}','{{jp_study_to}}','{{jp_study_to:year}}','{{jp_study_to:month}}','{{jp_study_to:day}}','{{jp_study_hours}}','{{work_company_name}}','{{work_address}}','{{work_position}}','{{work_start}}','{{work_start:year}}','{{work_start:month}}','{{work_end}}','{{work_end:year}}','{{work_end:month}}','{{work2_company:name}}','{{work2_address}}','{{work2_position}}','{{work2_start}}','{{work2_end}}','{{reason_for_study}}','{{future_plan}}','{{study_subject}}','{{sponsor_name}}','{{sponsor_name_en}}','{{sponsor_name_bd}}','{{sponsor_phone:personal}}','{{sponsor_phone:business}}','{{sponsor_dob}}','{{sponsor_dob:year}}','{{sponsor_dob:month}}','{{sponsor_dob:day}}','{{sponsor_nid}}','{{sponsor_father:name}}','{{sponsor_mother:name}}','{{sponsor_present:address}}','{{sponsor_permanent:address}}','{{sponsor_business:address}}','{{sponsor_company}}','{{sponsor_company;phone}}','{{sponsor_company:address}}','{{sponsor_work:address}}','{{sponsor_trade_license}}','{{sponsor_tin}}','{{sponsor_email}}','{{sponsor_income_year_1}}','{{sponsor_income_y1}}','{{sponsor_tax_y1}}','{{sponsor_income_year_2}}','{{sponsor_income_y2}}','{{sponsor_tax_y2}}','{{sponsor_income_year_3}}','{{sponsor_income_y3}}','{{sponsor_tax_y3}}','{{sponsor_statement_why he/she is Sponsor}}','{{sponsor_statement_mathod of payment}}','{{edu_ssc_ year}}','{{edu_hsc_ year}}','{{edu_bachelor/degree:school}}','{{edu_ bachelor/degree : year}}','{{edu_bachelor/degree:subject}}','{{edu_ bachelor/degree:entrance}}','{{edu_bachelor/degree:session}}','{{edu_bachelor/degree_expected graduation}}','{{expected graduation:day}}','{{expected graduation:month}}','{{expected graduation:year}}','{{jp_study_months}}','{{Japan_school}}','{{japan_city}}','{{japan_major subject}}','{{adimission in class 1:years}}','{{adimission in class 1:months}}','{{early adimission:years}}','{{early adimission:months}}','{{late adimission in class 1:years}}','{{late adimission in class 1:months}}','{{late adimission:years}}','{{late adimission:months}}','{{late adimission: how many years}}','{{edu_ssc :year}}','{{edu_ssc_:months}}','{{edu_ssc original schedule:year}}','{{edu_ ssc original schedule:months}}','{{edu_ssc:months}}','{{edu_hsc:year}}','{{edu_hsc:months}}','{{edu_hsc expected schedule:year}}','{{edu_ hsc expected schedule:months}}','{{edu_hsc exam conducted:year}}','{{edu_ hsc exam conducted:months}}','{{name_course}}','{{name_subject}}','{{course_completion:Year}}','{{course_completion:month}}','{{course_under:institution}}','{{institution_ board}}','{{institution_ college}}','{{institution_ university}}','{{institution_ national university}}','{{institution_ private university}}','{{institution_ dhaka university}}','{{course_present status:year}}','{{course_expected graduation:year}}','{{course_expected graduation:months}}','{{course_extended reason:session jam}}','{{course_extended reason:}}','{{edu_hsc_ months}}','{{edu_bachelor_admission:year}}','{{edu_bachelor_admission:months}}','{{reason of admission gap:chikungunya fever}}','{{reason of admission gap:dengue fever}}','{{reason of admission gap:accident}}','{{reason of admission gap:family issue}}','{{edu_bachelor_admission gap:year}}','{{ edu_bachelor_admission gap:months}}','{{edu_ssc:year}}','{{reason of delay: chikungunya fever}}','{{reason of delay: dengue fever}}','{{reason of delay: covid-19}}','{{edu_ bachelor/degree :year}}','{{jp_study  enrolled:year}}','{{jp_study enrolled:months}}','{{jp_study:batch}}','{{jp_study_batch:morning}}','{{jp_study_batch:evening}}','{{jp_study_batch:time}}','{{edu_gap:reason}}','{{edu_gap:duration}}','{{edu_gap:year}}','{{edu_gap:months}}','{{bc_1st seal_name:en}}','{{bc_1st seal_designation:en}}','{{bc_2nd seal_name:en}}','{{bc_2nd seal_designation}}','{{bc_3rd round seal:union parisahad/paurashava/citycorporation}}','{{bc_3rd round seal_ location:upozila}}','{{bc_3rd round seal_ location:district}}','{{college running_seal_name:en}}','{{college running_seal_designation:en}}','{{income tax_seal_taxes officer:name:en}}','{{income tax_seal_taxes officer: designation}}','{{country}}','{{school}}','{{batch}}','{{intake}}','{{visa_type}}','{{student_type}}','{{source}}','{{branch}}','{{status}}'
];

export const STUDENT_VARIABLE_MAP = Object.freeze(
    Object.fromEntries(
        STUDENT_VARIABLE_TEMPLATES.map((templateVariable) => {
            const config = explicitFieldMap[templateVariable] || {
                dbField: toDocVariablePath(templateVariable),
                source: 'docVariable'
            };

            return [
                templateVariable,
                {
                    templateVariable,
                    variableName: normalizeTemplateVariable(templateVariable),
                    dbField: config.dbField,
                    source: config.source,
                    transform: config.transform || null
                }
            ];
        })
    )
);

export const getStudentVariableConfig = (templateVariable) =>
    STUDENT_VARIABLE_MAP[templateVariable] || {
        templateVariable,
        variableName: normalizeTemplateVariable(templateVariable),
        dbField: toDocVariablePath(templateVariable),
        source: 'docVariable',
        transform: null
    };

export const getStudentVariableList = () => Object.values(STUDENT_VARIABLE_MAP);

export default STUDENT_VARIABLE_MAP;
