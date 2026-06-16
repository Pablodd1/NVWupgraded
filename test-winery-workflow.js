const http = require('http');

async function run() {
  const baseUrl = 'http://localhost:3000';
  console.log(`Starting test workflow against ${baseUrl}`);

  try {
    // Check if server is running
    await fetch(baseUrl).catch(() => {
      throw new Error(`Server is not running at ${baseUrl}. Please start it with 'npm run dev' or 'npm start'.`);
    });

    // 1. Create a mock user
    const email = `test-winery-${Date.now()}@example.com`;
    const phone = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    console.log(`\n[1] Creating user with email: ${email}`);
    
    const userPayload = {
      firstName: "Test",
      lastName: "WineryOwner",
      email,
      phone,
      password: "password123",
      dateOfBirth: "1990-01-01",
      role: "winery"
    };

    const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPayload)
    });

    if (!registerRes.ok) {
      const error = await registerRes.text();
      console.error('❌ Failed to register user:', error);
      process.exit(1);
    }

    const registerData = await registerRes.json();
    console.log('✅ User created:', registerData.user.email);

    // Extract auth cookie
    // fetch API sometimes returns multiple cookies joined by comma, or we can use headers.getSetCookie() in newer Node
    let tokenCookie = '';
    if (typeof registerRes.headers.getSetCookie === 'function') {
      const cookies = registerRes.headers.getSetCookie();
      tokenCookie = cookies.find(c => c.startsWith('token=')) || cookies[0];
    } else {
      const setCookieHeader = registerRes.headers.get('set-cookie');
      if (!setCookieHeader) {
        console.error('❌ No set-cookie header found in register response');
        process.exit(1);
      }
      tokenCookie = setCookieHeader.split(';')[0];
    }
    console.log('✅ Extracted cookie');

    // 2. Create a winery
    const wineryName = `Test Winery ${Date.now()}`;
    console.log(`\n[2] Creating winery with name: ${wineryName}`);
    
    const wineryPayload = {
      name: wineryName,
      description: "A beautiful test winery in Napa Valley",
      location: {
        address: "123 Test St",
        is_mountain_location: false,
        lat: 38.2975,
        lng: -122.2868
      },
      tasting_info: {
        tasting_price: 50,
        wine_types: ["Cabernet Sauvignon", "Chardonnay"],
        special_features: [],
        tours: { available: true }
      },
      amenities: {
        allows_children: true,
        allows_non_drinkers: true,
        handicap_accessible: true
      }
    };

    const createWineryRes = await fetch(`${baseUrl}/api/winery`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': tokenCookie 
      },
      body: JSON.stringify(wineryPayload)
    });

    if (!createWineryRes.ok) {
      const error = await createWineryRes.text();
      console.error('❌ Failed to create winery:', error);
      process.exit(1);
    }

    const createWineryData = await createWineryRes.json();
    console.log('✅ Winery created successfully:', createWineryData.winery.name);
    const wineryId = createWineryData.winery._id;

    // 3. Verify in GET response
    console.log('\n[3] Fetching homepage wineries from GET /api/winery...');
    // Add timestamp to prevent caching if any
    const getWineriesRes = await fetch(`${baseUrl}/api/winery?_t=${Date.now()}`);
    if (!getWineriesRes.ok) {
      const error = await getWineriesRes.text();
      console.error('❌ Failed to fetch wineries:', error);
      process.exit(1);
    }

    const getWineriesData = await getWineriesRes.json();
    console.log(`✅ Fetched ${getWineriesData.wineries.length} wineries.`);
    
    const found = getWineriesData.wineries.find(w => w._id === wineryId || w.name === wineryName);
    if (found) {
      console.log('\n🎉 SUCCESS: The newly created winery was found in the GET response!');
    } else {
      console.error('\n❌ FAILURE: The newly created winery was NOT found in the GET response.');
      console.log('Total returned from GET:', getWineriesData.total);
      process.exit(1);
    }

    console.log('\n✨ Workflow test completed successfully.');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    process.exit(1);
  }
}

run();
