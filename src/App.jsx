
import { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [shortLink, setShortLink] = useState('');

  const generate = async () => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: url })
    });
    const data = await res.json();
    setShortLink(window.location.origin + '/api/track/' + data.shortUrl + '?id=' + data.shortUrl);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>測試連結產生器</h2>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="請輸入目標網址"
        style={{ width: '300px', marginRight: '10px' }}
      />
      <button onClick={generate}>產生連結</button>
      {shortLink && (
        <p>追蹤連結：<a href={shortLink}>{shortLink}</a></p>
      )}
    </div>
  );
}

export default App;
