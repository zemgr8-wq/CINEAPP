const { execSync, spawn } = require('child_process');

const CLIENT_ID = '178c6fc778ccc68e1d6a'; // Official GitHub CLI client ID

async function loginAndPush() {
  console.log('\n======================================================');
  console.log('   CONNECTING TO GITHUB (NO TOKEN NEEDED)             ');
  console.log('======================================================\n');

  try {
    const res = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, scope: 'repo' })
    });

    const data = await res.json();
    if (!data.user_code) {
      console.error('Failed to get device code from GitHub:', data);
      process.exit(1);
    }

    const { device_code, user_code, verification_uri, interval = 5 } = data;

    console.log(`Your 1-Click Code: [ ${user_code} ]`);
    console.log('(The code has also been automatically copied to your clipboard!)\n');

    // Copy code to clipboard for convenience
    try {
      execSync(`powershell -Command "Set-Clipboard -Value '${user_code}'"`);
    } catch {}

    // Open browser to verification page
    console.log(`Opening ${verification_uri} in your browser...`);
    try {
      execSync(`start ${verification_uri}`);
    } catch {}

    console.log('\nWaiting for you to click "Continue / Authorize" in your browser...');

    // Poll for authorization
    let accessToken = null;
    while (!accessToken) {
      await new Promise(r => setTimeout(r, (interval + 1) * 1000));

      const pollRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          device_code: device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        })
      });

      const pollData = await pollRes.json();

      if (pollData.access_token) {
        accessToken = pollData.access_token;
        break;
      }

      if (pollData.error === 'authorization_pending') {
        process.stdout.write('.');
      } else if (pollData.error === 'slow_down') {
        await new Promise(r => setTimeout(r, 5000));
      } else {
        console.error('\nAuthorization error:', pollData.error_description || pollData.error);
        process.exit(1);
      }
    }

    console.log('\n\n[AUTHORIZED!] Authenticated successfully with your GitHub account.');
    console.log('Pushing CineBook repository to https://github.com/zemgr8-wq/CINEAPP.git ...');

    const pushUrl = `https://${accessToken}@github.com/zemgr8-wq/CINEAPP.git`;
    execSync(`git push "${pushUrl}" main`, { stdio: 'inherit' });

    console.log('\n======================================================');
    console.log('   SUCCESS! CineBook has been pushed to GitHub!       ');
    console.log('   Repository: https://github.com/zemgr8-wq/CINEAPP   ');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\nError pushing to GitHub:', err.message);
    process.exit(1);
  }
}

loginAndPush();
