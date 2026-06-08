const BASE_URL = 'http://localhost:3000/api/v1';

async function testSettings() {
    console.log('--- Testing Setting APIs ---');
    
    try {
        // 1. Login
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@agencybook.com', password: 'Admin@123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.data?.token;
        console.log('Login:', loginData.success ? 'PASS' : 'FAIL');

        if (!token) {
            console.log('No token received');
            return;
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Get Settings
        console.log('Fetching settings from:', `${BASE_URL}/settings`);
        const getRes = await fetch(`${BASE_URL}/settings`, { headers });
        const getData = await getRes.json();
        console.log('Get Settings Status:', getRes.status);
        console.log('Get Settings Success:', getData.success ? 'PASS' : 'FAIL');
        if (getData.data) {
            console.log('  Counselors:', getData.data.counselors?.length);
        } else {
            console.log('  No data returned', getData);
        }

        // 3. Update Settings
        if (getData.success) {
            console.log('Updating settings...');
            const updateRes = await fetch(`${BASE_URL}/settings`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    counselors: [...(getData.data?.counselors || []), 'Test Counselor ' + Date.now()]
                })
            });
            const updateData = await updateRes.json();
            console.log('Update Status:', updateRes.status);
            console.log('Update Settings Success:', updateData.success ? 'PASS' : 'FAIL');
            console.log('  New Counselor count:', updateData.data?.counselors?.length);
        }

    } catch (err) {
        console.error('Test Error:', err);
    }

    console.log('--- Setting Tests Completed ---');
}

testSettings();
