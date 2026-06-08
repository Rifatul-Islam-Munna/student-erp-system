
const BASE_URL = 'http://localhost:3000/api/v1';
const CREDENTIALS = {
    email: 'admin@agencybook.com',
    password: 'Admin@123'
};

async function runTests() {
    console.log('--- Starting API Tests ---');
    let token = '';

    try {
        // 1. Auth Login
        console.log('[1] Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(CREDENTIALS)
        });
        const loginData = await loginRes.json();
        if (!loginData.success) throw new Error('Login failed: ' + loginData.message);
        token = loginData.data.token;
        console.log('  SUCCESS: Token acquired.');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 2. Visitor Tests
        console.log('[2] Testing Visitor APIs...');
        
        // Stats
        const vStatsRes = await fetch(`${BASE_URL}/visitors/stats`, { headers });
        const vStats = await vStatsRes.json();
        console.log(`  Visitor Stats: ${vStats.success ? 'PASS' : 'FAIL'} (${vStats.data?.total || 0} total)`);

        // Create
        const vCreateRes = await fetch(`${BASE_URL}/visitors`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                fullName: 'Test Visitor',
                email: 'testvisitor@example.com',
                phone: '1234567890',
                dateOfBirth: '1995-01-01',
                gender: 'male',
                education: [
                    { examName: 'HSC', year: '2012', board: 'Dhaka', gpa: 4.5, groupSubject: 'Science' }
                ]
            })
        });
        const vCreate = await vCreateRes.json();
        const visitorId = vCreate.data?._id;
        console.log(`  Create Visitor: ${vCreate.success ? 'PASS' : 'FAIL'} (ID: ${visitorId})`);

        // Get List
        const vListRes = await fetch(`${BASE_URL}/visitors`, { headers });
        const vList = await vListRes.json();
        console.log(`  List Visitors: ${vList.success ? 'PASS' : 'FAIL'} (Count: ${vList.data?.length})`);

        // Update
        if (visitorId) {
            const vUpdateRes = await fetch(`${BASE_URL}/visitors/${visitorId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ fullName: 'Updated Visitor' })
            });
            const vUpdate = await vUpdateRes.json();
            console.log(`  Update Visitor: ${vUpdate.success ? 'PASS' : 'FAIL'}`);
            if (!vUpdate.success) console.log('    Error:', vUpdate);

            // Delete
            const vDelRes = await fetch(`${BASE_URL}/visitors/${visitorId}`, { method: 'DELETE', headers: { 'Authorization': headers['Authorization'] } });
            const vDel = await vDelRes.json();
            console.log(`  Delete Visitor: ${vDel.success ? 'PASS' : 'FAIL'}`);
            if (!vDel.success) console.log('    Error:', vDel);
        }

        // 3. Student Tests
        console.log('[3] Testing Student APIs...');
        
        // Stats
        const sStatsRes = await fetch(`${BASE_URL}/students/stats`, { headers });
        const sStats = await sStatsRes.json();
        console.log(`  Student Stats: ${sStats.success ? 'PASS' : 'FAIL'}`);
        if (!sStats.success) console.log('    Error:', sStats);

        // Create
        const sCreateRes = await fetch(`${BASE_URL}/students`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                fullNameEn: 'Student Test',
                email: 'studenttest@example.com',
                phone: '0987654321',
                dateOfBirth: '2000-05-15',
                gender: 'female',
                education: [
                    { degreeExam: 'Bachelor', institutionName: 'University X', passingYear: 2022, gpa: 3.8 }
                ]
            })
        });
        const sCreate = await sCreateRes.json();
        const studentId = sCreate.data?._id;
        console.log(`  Create Student: ${sCreate.success ? 'PASS' : 'FAIL'} (ID: ${studentId})`);
        if (!sCreate.success) console.log('    Error:', sCreate);

        // Get List
        const sListRes = await fetch(`${BASE_URL}/students`, { headers });
        const sList = await sListRes.json();
        console.log(`  List Students: ${sList.success ? 'PASS' : 'FAIL'}`);
        if (!sList.success) console.log('    Error:', sList);

        // Update
        if (studentId) {
            const sUpdateRes = await fetch(`${BASE_URL}/students/${studentId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ fullNameEn: 'Updated Student' })
            });
            const sUpdate = await sUpdateRes.json();
            console.log(`  Update Student: ${sUpdate.success ? 'PASS' : 'FAIL'}`);
            if (!sUpdate.success) console.log('    Error:', sUpdate);

            // Delete
            const sDelRes = await fetch(`${BASE_URL}/students/${studentId}`, { method: 'DELETE', headers: { 'Authorization': headers['Authorization'] } });
            const sDel = await sDelRes.json();
            console.log(`  Delete Student: ${sDel.success ? 'PASS' : 'FAIL'}`);
            if (!sDel.success) console.log('    Error:', sDel);
        }

        // 4. Branch Tests
        console.log('[4] Testing Branch APIs...');
        
        // Create
        const bCreateRes = await fetch(`${BASE_URL}/branches`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: 'Test Branch',
                address: '123 Test Street',
                phone: '5551234',
                email: 'branch@example.com',
                status: 'active'
            })
        });
        const bCreate = await bCreateRes.json();
        const branchId = bCreate.data?._id;
        console.log(`  Create Branch: ${bCreate.success ? 'PASS' : 'FAIL'} (ID: ${branchId})`);
        if (!bCreate.success) console.log('    Error:', bCreate);

        // List
        const bListRes = await fetch(`${BASE_URL}/branches`, { headers });
        const bList = await bListRes.json();
        console.log(`  List Branches: ${bList.success ? 'PASS' : 'FAIL'} (Count: ${bList.data?.length})`);

        // Update
        if (branchId) {
            const bUpdateRes = await fetch(`${BASE_URL}/branches/${branchId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ name: 'Updated Branch' })
            });
            const bUpdate = await bUpdateRes.json();
            console.log(`  Update Branch: ${bUpdate.success ? 'PASS' : 'FAIL'}`);
            if (!bUpdate.success) console.log('    Error:', bUpdate);

            // Delete
            const bDelRes = await fetch(`${BASE_URL}/branches/${branchId}`, { method: 'DELETE', headers: { 'Authorization': headers['Authorization'] } });
            const bDel = await bDelRes.json();
            console.log(`  Delete Branch: ${bDel.success ? 'PASS' : 'FAIL'}`);
            if (!bDel.success) console.log('    Error:', bDel);
        }

        // 5. Batch (Course) Tests
        console.log('[5] Testing Batch APIs...');
        
        // Stats
        const batchStatsRes = await fetch(`${BASE_URL}/batches/stats`, { headers });
        const batchStats = await batchStatsRes.json();
        console.log(`  Batch Stats: ${batchStats.success ? 'PASS' : 'FAIL'}`);
        if (!batchStats.success) console.log('    Error:', batchStats);

        // Create
        const batchCreateRes = await fetch(`${BASE_URL}/batches`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                batchName: 'JLPT N4 Intensive',
                country: 'Japan',
                level: 'N4',
                maxStudents: 15,
                teacher: 'Sensei Tanaka',
                classDays: ['mon', 'wed', 'fri'],
                classDuration: 2
            })
        });
        const batchCreate = await batchCreateRes.json();
        const newBatchId = batchCreate.data?._id;
        console.log(`  Create Batch Module: ${batchCreate.success ? 'PASS' : 'FAIL'} (ID: ${newBatchId})`);
        if (!batchCreate.success) console.log('    Error:', batchCreate);

        // List
        const batchListRes = await fetch(`${BASE_URL}/batches`, { headers });
        const batchList = await batchListRes.json();
        console.log(`  List Batches Module: ${batchList.success ? 'PASS' : 'FAIL'} (Count: ${batchList.data?.length})`);

        // Update
        if (newBatchId) {
            const batchUpdateRes = await fetch(`${BASE_URL}/batches/${newBatchId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ batchName: 'JLPT N4 Intensive Updated' })
            });
            const batchUpdate = await batchUpdateRes.json();
            console.log(`  Update Batch Module: ${batchUpdate.success ? 'PASS' : 'FAIL'}`);
            if (!batchUpdate.success) console.log('    Error:', batchUpdate);

            // Delete
            const batchDelRes = await fetch(`${BASE_URL}/batches/${newBatchId}`, { method: 'DELETE', headers: { 'Authorization': headers['Authorization'] } });
            const batchDel = await batchDelRes.json();
            console.log(`  Delete Batch Module: ${batchDel.success ? 'PASS' : 'FAIL'}`);
            if (!batchDel.success) console.log('    Error:', batchDel);
        }

        console.log('--- All Tests Completed ---');

    } catch (error) {
        console.error('ERROR during testing:', error.message);
    }
}

runTests();
