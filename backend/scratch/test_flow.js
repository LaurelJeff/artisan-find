import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function makeRequest(path, options = {}) {
    const url = `${BASE_URL}${path}`;
    const method = options.method || "GET";
    const headers = {
        "Content-Type": "application/json",
        ...(options.cookie ? { "Cookie": options.cookie } : {}),
        ...(options.headers || {}),
    };

    const fetchOptions = {
        method,
        headers,
    };

    if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, fetchOptions);
        const text = await response.text();
        let data = {};
        try {
            if (text) {
                data = JSON.parse(text);
            }
        } catch {
            data = { text };
        }

        const setCookie = response.headers.get("set-cookie");
        return {
            status: response.status,
            data,
            cookie: setCookie ? setCookie.split(";")[0] : options.cookie,
        };
    } catch (error) {
        console.error(`Request to ${url} failed:`, error.message);
        throw error;
    }
}

async function runTests() {
    console.log("=== STARTING E2E VERIFICATION FLOW ===");

    // Generate unique emails for test isolation
    const timestamp = Date.now();
    const clientEmail = `client_${timestamp}@test.com`;
    const artisan1Email = `artisan1_${timestamp}@test.com`;
    const artisan2Email = `artisan2_${timestamp}@test.com`;

    console.log(`Generating test accounts:\n- Client: ${clientEmail}\n- Artisan 1: ${artisan1Email}\n- Artisan 2: ${artisan2Email}\n`);

    // 1. Register Client (User A)
    console.log("1. Registering Client (User A)...");
    const regClientRes = await makeRequest("/api/auth/register", {
        method: "POST",
        body: {
            name: "John Client",
            email: clientEmail,
            password: "password123",
            confirmPassword: "password123",
        },
    });
    if (regClientRes.status !== 201) {
        throw new Error(`Failed to register Client. Status: ${regClientRes.status}, Data: ${JSON.stringify(regClientRes.data)}`);
    }
    const clientCookie = regClientRes.cookie;
    console.log("Client registered successfully!\n");

    // 2. Register Artisan 1 (User B)
    console.log("2. Registering Artisan 1 (User B)...");
    const regArt1Res = await makeRequest("/api/auth/register", {
        method: "POST",
        body: {
            name: "Alice Plumber",
            email: artisan1Email,
            password: "password123",
            confirmPassword: "password123",
        },
    });
    const art1Cookie = regArt1Res.cookie;
    console.log("Artisan 1 registered successfully!\n");

    // 3. Register Artisan 2 (User C)
    console.log("3. Registering Artisan 2 (User C)...");
    const regArt2Res = await makeRequest("/api/auth/register", {
        method: "POST",
        body: {
            name: "Bob Electrician",
            email: artisan2Email,
            password: "password123",
            confirmPassword: "password123",
        },
    });
    const art2Cookie = regArt2Res.cookie;
    console.log("Artisan 2 registered successfully!\n");

    // 4. Upgrade Artisan 1 to Artisan profile (Plumber)
    console.log("4. Upgrading Artisan 1 (User B) to an Artisan profile...");
    const upgArt1Res = await makeRequest("/api/auth/become-artisan", {
        method: "POST",
        cookie: art1Cookie,
        body: { profession: "Plumber" },
    });
    if (upgArt1Res.status !== 200) {
        throw new Error(`Failed to upgrade Artisan 1. Status: ${upgArt1Res.status}, Data: ${JSON.stringify(upgArt1Res.data)}`);
    }
    const artisan1Id = upgArt1Res.data.artisan.id;
    console.log(`Artisan 1 upgraded! Profile ID: ${artisan1Id}, Profession: ${upgArt1Res.data.artisan.profession}\n`);

    // 5. Upgrade Artisan 2 to Artisan profile (Electrician)
    console.log("5. Upgrading Artisan 2 (User C) to an Artisan profile...");
    const upgArt2Res = await makeRequest("/api/auth/become-artisan", {
        method: "POST",
        cookie: art2Cookie,
        body: { profession: "Electrician" },
    });
    const artisan2Id = upgArt2Res.data.artisan.id;
    console.log(`Artisan 2 upgraded! Profile ID: ${artisan2Id}, Profession: ${upgArt2Res.data.artisan.profession}\n`);

    // 6. Client (User A) creates Job 1 ("Leaky Pipe in Kitchen")
    console.log("6. Client posting Job 1 ('Leaky Pipe in Kitchen')...");
    const job1Res = await makeRequest("/api/jobs", {
        method: "POST",
        cookie: clientCookie,
        body: {
            title: "Leaky Pipe in Kitchen",
            description: "Need an experienced plumber to fix kitchen pipes under the sink.",
            location: "Lagos Mainland",
            jobType: "Contract",
            salary: "50000",
        },
    });
    if (job1Res.status !== 201) {
        throw new Error(`Failed to create Job 1. Status: ${job1Res.status}, Data: ${JSON.stringify(job1Res.data)}`);
    }
    const job1Id = job1Res.data.job.id;
    console.log(`Job 1 created successfully! ID: ${job1Id}\n`);

    // 7. Client (User A) creates Job 2 ("Rewire Living Room")
    console.log("7. Client posting Job 2 ('Rewire Living Room')...");
    const job2Res = await makeRequest("/api/jobs", {
        method: "POST",
        cookie: clientCookie,
        body: {
            title: "Rewire Living Room",
            description: "Need an electrician to run new conduit and wire the entire living room.",
            location: "Lagos Island",
            jobType: "Contract",
            salary: "100000",
        },
    });
    const job2Id = job2Res.data.job.id;
    console.log(`Job 2 created successfully! ID: ${job2Id}\n`);

    // 8. Artisan 1 (B) registers/applies for Job 1
    console.log("8. Artisan 1 registering/applying for Job 1...");
    const regJob1A1 = await makeRequest(`/api/jobs/${job1Id}/register`, {
        method: "POST",
        cookie: art1Cookie,
    });
    if (regJob1A1.status !== 201) {
        throw new Error(`Failed Artisan 1 Job 1 registration. Status: ${regJob1A1.status}, Data: ${JSON.stringify(regJob1A1.data)}`);
    }
    console.log("Artisan 1 registered for Job 1 successfully!\n");

    // 9. Artisan 1 (B) registers/applies for Job 2
    console.log("9. Artisan 1 registering/applying for Job 2...");
    const regJob2A1 = await makeRequest(`/api/jobs/${job2Id}/register`, {
        method: "POST",
        cookie: art1Cookie,
    });
    if (regJob2A1.status !== 201) {
        throw new Error(`Failed Artisan 1 Job 2 registration. Status: ${regJob2A1.status}, Data: ${JSON.stringify(regJob2A1.data)}`);
    }
    console.log("Artisan 1 registered for Job 2 successfully! (Artisan registered for MULTIPLE jobs)\n");

    // 10. Artisan 2 (C) registers/applies for Job 1
    console.log("10. Artisan 2 registering/applying for Job 1...");
    const regJob1A2 = await makeRequest(`/api/jobs/${job1Id}/register`, {
        method: "POST",
        cookie: art2Cookie,
    });
    if (regJob1A2.status !== 201) {
        throw new Error(`Failed Artisan 2 Job 1 registration. Status: ${regJob1A2.status}, Data: ${JSON.stringify(regJob1A2.data)}`);
    }
    console.log("Artisan 2 registered for Job 1 successfully!\n");

    // 11. Client retrieves registrations for Job 1 and Job 2
    console.log("11. Client fetching registrations for Job 1...");
    const regJob1List = await makeRequest(`/api/jobs/${job1Id}/registrations`, {
        method: "GET",
        cookie: clientCookie,
    });
    console.log(`Job 1 registrations found: ${regJob1List.data.length}`);
    regJob1List.data.forEach(r => {
        console.log(`- Artisan: ${r.artisan.user.name} (Profession: ${r.artisan.profession}), Status: ${r.status}`);
    });
    console.log("");

    // 12. Client hires Artisan 1 for Job 1
    console.log("12. Client hiring Artisan 1 for Job 1...");
    const hireA1J1 = await makeRequest(`/api/jobs/${job1Id}/hire`, {
        method: "POST",
        cookie: clientCookie,
        body: { artisanId: artisan1Id },
    });
    if (hireA1J1.status !== 200) {
        throw new Error(`Failed to hire Artisan 1. Status: ${hireA1J1.status}, Data: ${JSON.stringify(hireA1J1.data)}`);
    }
    console.log("Artisan 1 hired for Job 1 successfully!\n");

    // 13. Client hires Artisan 2 for Job 1 (Hiring multiple artisans for a single job)
    console.log("13. Client hiring Artisan 2 for Job 1 (Multiple artisans for one job)...");
    const hireA2J1 = await makeRequest(`/api/jobs/${job1Id}/hire`, {
        method: "POST",
        cookie: clientCookie,
        body: { artisanId: artisan2Id },
    });
    if (hireA2J1.status !== 200) {
        throw new Error(`Failed to hire Artisan 2. Status: ${hireA2J1.status}, Data: ${JSON.stringify(hireA2J1.data)}`);
    }
    console.log("Artisan 2 hired for Job 1 successfully! (Verified: Multiple artisans hired for one job)\n");

    // 14. Client hires Artisan 1 for Job 2 (Hiring same artisan for multiple jobs)
    console.log("14. Client hiring Artisan 1 for Job 2...");
    const hireA1J2 = await makeRequest(`/api/jobs/${job2Id}/hire`, {
        method: "POST",
        cookie: clientCookie,
        body: { artisanId: artisan1Id },
    });
    if (hireA1J2.status !== 200) {
        throw new Error(`Failed to hire Artisan 1 for Job 2. Status: ${hireA1J2.status}, Data: ${JSON.stringify(hireA1J2.data)}`);
    }
    console.log("Artisan 1 hired for Job 2 successfully! (Verified: Artisan hired for multiple jobs)\n");

    // 15. Check Artisan 1 applied jobs
    console.log("15. Checking Artisan 1's applied jobs and hire statuses...");
    const art1Apps = await makeRequest("/api/artisans/my-applications", {
        method: "GET",
        cookie: art1Cookie,
    });
    console.log("art1Apps Response:", JSON.stringify(art1Apps, null, 2));
    if (art1Apps.status !== 200) {
        throw new Error(`Failed to fetch applied jobs. Status: ${art1Apps.status}, Data: ${JSON.stringify(art1Apps.data)}`);
    }
    console.log(`Artisan 1 applied jobs count: ${art1Apps.data.length}`);
    art1Apps.data.forEach(r => {
        console.log(`- Job: "${r.job.title}", Employer: ${r.job.employer.name}, Status: ${r.status}`);
    });
    console.log("");

    console.log("=== E2E VERIFICATION COMPLETED SUCCESSFULLY! ===");
    process.exit(0);
}

runTests().catch(err => {
    console.error("E2E Test Flow FAILED:", err);
    process.exit(1);
});
