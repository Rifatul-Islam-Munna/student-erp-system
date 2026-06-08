export const SYSTEM_VARIABLE_MAP = Object.freeze({
    '{{sys_agency_name}}': { dbField: 'site.name', source: 'settings' },
    '{{sys_agency_address}}': { dbField: 'site.address', source: 'settings' },
    '{{sys_agency_phone}}': { dbField: 'site.phone', source: 'settings' },
    '{{sys_agency_email}}': { dbField: 'site.email', source: 'settings' },
    '{{sys_branch_name}}': { dbField: 'branch.name', source: 'runtime-branch' },
    '{{sys_branch_address}}': { dbField: 'branch.address', source: 'runtime-branch' },
    '{{sys_today}}': { dbField: null, source: 'runtime-date' },
    '{{sys_today:year}}': { dbField: null, source: 'runtime-date' },
    '{{sys_today:month}}': { dbField: null, source: 'runtime-date' },
    '{{sys_today:day}}': { dbField: null, source: 'runtime-date' },
    '{{sys_today_jp}}': { dbField: null, source: 'runtime-date' },
    '{{sys_batch_name}}': { dbField: 'batch.name', source: 'runtime-batch' },
    '{{sys_batch_start}}': { dbField: 'batch.startDate', source: 'runtime-batch' },
    '{{sys_batch_start:year}}': { dbField: 'batch.startDate', source: 'runtime-batch' },
    '{{sys_batch_start:month}}': { dbField: 'batch.startDate', source: 'runtime-batch' },
    '{{sys_batch_start:day}}': { dbField: 'batch.startDate', source: 'runtime-batch' },
    '{{sys_batch_end}}': { dbField: 'batch.endDate', source: 'runtime-batch' },
    '{{sys_batch_end:year}}': { dbField: 'batch.endDate', source: 'runtime-batch' },
    '{{sys_batch_end:month}}': { dbField: 'batch.endDate', source: 'runtime-batch' },
    '{{sys_batch_end:day}}': { dbField: 'batch.endDate', source: 'runtime-batch' },
    '{{sys_batch_teacher}}': { dbField: 'batch.teacher', source: 'runtime-batch' },
    '{{sys_batch_schedule}}': { dbField: 'batch.schedule', source: 'runtime-batch' },
    '{{sys_batch_total_hours}}': { dbField: 'batch.totalHours', source: 'runtime-batch' },
    '{{sys_school_name}}': { dbField: 'school.name', source: 'runtime-school' },
    '{{sys_school_name_jp}}': { dbField: 'school.nameJapanese', source: 'runtime-school' },
    '{{sys_school_address}}': { dbField: 'school.address', source: 'runtime-school' }
});

export const getSystemVariableList = () =>
    Object.entries(SYSTEM_VARIABLE_MAP).map(([templateVariable, config]) => ({
        templateVariable,
        variableName: templateVariable.replace(/^\{\{|\}\}$/g, ''),
        ...config
    }));

export default SYSTEM_VARIABLE_MAP;
