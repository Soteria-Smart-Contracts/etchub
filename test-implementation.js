const fs = require('fs');
const path = require('path');

console.log("Testing implementation of changes...");

// Check that server.js no longer imports ipWhitelist
const serverContent = fs.readFileSync('./server.js', 'utf8');
if (serverContent.includes('ipWhitelist')) {
    console.log("❌ FAIL: server.js still contains ipWhitelist references");
    process.exit(1);
} else {
    console.log("✅ PASS: server.js no longer contains ipWhitelist references");
}

// Check that submissions.js no longer imports ipWhitelist
const submissionsContent = fs.readFileSync('./submissions.js', 'utf8');
if (submissionsContent.includes('ipWhitelist')) {
    console.log("❌ FAIL: submissions.js still contains ipWhitelist references");
    process.exit(1);
} else {
    console.log("✅ PASS: submissions.js no longer contains ipWhitelist references");
}

// Check that admin.js no longer has IP whitelisting logic
const adminContent = fs.readFileSync('./admin.js', 'utf8');
if (adminContent.includes('ipWhitelist')) {
    console.log("❌ FAIL: admin.js still contains ipWhitelist references");
    process.exit(1);
} else {
    console.log("✅ PASS: admin.js no longer contains ipWhitelist references");
}

// Verify generated_news directory is created
const generatedNewsDir = path.join(__dirname, 'generated_news');
if (fs.existsSync(generatedNewsDir)) {
    console.log("✅ PASS: generated_news directory exists");
} else {
    console.log("⚠️  INFO: generated_news directory doesn't exist yet (will be created on first article)");
}

// Check that news.html has the correct navigation 
const newsContent = fs.readFileSync('./news.html', 'utf8');
if (newsContent.includes('href="news.html" class="nav-link text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">News</a>')) {
    console.log("✅ PASS: news.html has correct navigation");
} else {
    console.log("❌ FAIL: news.html navigation not updated properly");
    process.exit(1);
}

// Check that submit.html sends correct field names
const submitContent = fs.readFileSync('./submit.html', 'utf8');
if (submitContent.includes('xUsername: author')) {
    console.log("✅ PASS: submit.html sends correct field name (xUsername)");
} else {
    console.log("❌ FAIL: submit.html doesn't send correct field name");
    process.exit(1);
}

console.log("\n🎉 All tests passed! Implementation looks good.");