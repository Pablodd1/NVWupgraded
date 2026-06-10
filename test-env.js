const { spawn } = require("child_process");

async function run() {
  console.log("Starting Next.js server...");
  const server = spawn("npm", ["run", "dev"], { stdio: "pipe", shell: true });
  
  let isReady = false;
  server.stdout.on("data", (data) => {
    const out = data.toString();
    if (out.includes("Ready") || out.includes("started server on") || out.includes("http://localhost:3000") || out.includes("Fast Refresh")) {
      isReady = true;
    }
  });

  for(let i=0; i<60; i++) {
    if (isReady) break;
    await new Promise(r => setTimeout(r, 1000));
  }

  if (!isReady) {
    console.error("❌ Server not ready in 60s");
    spawn("taskkill", ["/pid", server.pid, "/f", "/t"]);
    process.exit(1);
  }

  console.log("✅ Server ready. Testing login as Admin...");
  
  try {
    const loginRes = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@napawineries.com", password: "admin123" })
    });
    
    if (!loginRes.ok) {
        const text = await loginRes.text();
        console.error("❌ Login failed:", text);
        spawn("taskkill", ["/pid", server.pid, "/f", "/t"]);
        process.exit(1);
    }

    const cookieHeader = loginRes.headers.get("set-cookie");
    const cookie = cookieHeader ? cookieHeader.split(';')[0] : "";
    
    console.log("✅ Login OK. Testing winery creation...");
    const wineryName = "Auto-Approve Test " + Date.now();
    const createRes = await fetch("http://localhost:3000/api/winery", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({
        name: wineryName,
        location: { 
            address: "123 Test", 
            latitude: 38.2975, 
            longitude: -122.2868, 
            is_mountain_location: false 
        },
        contact_info: { phone: "555-0000", email: "test@t.com", website: "https://t.com" },
        description: "Test description",
        images: [],
        tasting_info: [{ 
            tasting_title: "Classic Tasting",
            tasting_description: "Enjoy our finest wines",
            tasting_price: 10, 
            ava: "Napa Valley" 
        }],
        amenities: {},
        transportation: {},
        operating_hours: {}
      })
    });
    
    const createData = await createRes.json();
    if (!createRes.ok) {
      console.error("❌ Create failed", createData);
      spawn("taskkill", ["/pid", server.pid, "/f", "/t"]);
      process.exit(1);
    }
    
    console.log(`✅ Created winery ID: ${createData.winery._id}. Testing GET /api/winery...`);
    
    await new Promise(r => setTimeout(r, 1000));

    const getRes = await fetch("http://localhost:3000/api/winery");
    const getData = await getRes.json();
    
    const found = getData.wineries?.find(w => w.name === wineryName);
    if (found) {
      console.log(`🎉 SUCCESS: Auto-approve works! Found winery "${wineryName}" in feed.`);
    } else {
      console.error(`❌ FAILURE: Auto-approve failed! Winery "${wineryName}" not in feed.`);
    }
  } catch (err) {
      console.error("❌ Test error:", err);
  } finally {
      spawn("taskkill", ["/pid", server.pid, "/f", "/t"]);
      process.exit(0);
  }
}

run();
