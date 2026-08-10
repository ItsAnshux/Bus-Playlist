# Driver's Choice 🚌

Ek "saloon.wtf" jaisa single-page music jukebox, lekin theme hai **bus driver ki pasand** — Indian bus/truck-art style (jhalar tassels, destination-board marquee, road-shaped progress bar with a moving bus icon).

## Files
- `index.html` — page structure
- `style.css` — truck-art theme (pink/marigold/teal palette)
- `script.js` — player logic (shuffle, road progress bar, horn easter-egg)
- `songs.json` — playlist data (edit this to change songs)
- `audio/` — song files
- `covers/` — album art

Abhi `songs.json` me **3 demo placeholder tracks** hain (sirf test tones, koi copyrighted gaana nahi) — ye isliye taaki site turant kaam kare. Live jaane se pehle inhe apne songs se replace karo.

## 1. Apne songs add karo

**Important — copyright:** Main aapko copyrighted Bollywood MP3s provide nahi kar sakta. Aapko khud hi legally-rahe files use karni hongi — jaise:
- Aapke apne recorded/licensed tracks
- Royalty-free / Creative Commons music
- Songs jinke aap rights-holder hain

`audio/` folder me apni `.mp3` files daalo aur `covers/` me matching cover art (`.jpg`/`.png`, ideally square, 500×500+).

Fir `songs.json` edit karo:

```json
[
  {
    "title": "Tera Naam Song",
    "artist": "Singer Name",
    "cover": "covers/tera-naam.jpg",
    "src": "audio/tera-naam.mp3",
    "spotify": "https://open.spotify.com/track/xxxx",
    "ytmusic": "https://music.youtube.com/watch?v=xxxx"
  }
]
```

Jitne chaho utne entries add kar sakte ho — player automatically random shuffle karke playlist se pick karega, saloon.wtf ki tarah.

## 2. GitHub par host karo (GitHub Pages)

1. GitHub par ek naya repo banao — e.g. `drivers-choice`.
2. Ye saari files (`index.html`, `style.css`, `script.js`, `songs.json`, `audio/`, `covers/`) us repo me push karo:
   ```bash
   git init
   git add .
   git commit -m "Driver's Choice jukebox"
   git branch -M main
   git remote add origin https://github.com/<your-username>/drivers-choice.git
   git push -u origin main
   ```
3. Repo ke **Settings → Pages** me jao.
4. **Source** = `Deploy from a branch`, **Branch** = `main`, folder = `/ (root)` select karo, phir **Save**.
5. Kuch minute me site live ho jayegi: `https://<your-username>.github.io/drivers-choice/`

### Custom domain (optional)
Agar apna domain (jaise saloon.wtf style) lagana ho, repo Settings → Pages me **Custom domain** field me daal do aur apne domain registrar par ek `CNAME` record `<your-username>.github.io` ki taraf point karo.

## 3. Customize karna

- **Colors:** `style.css` ke top me `:root` variables (`--pink`, `--marigold`, `--teal`, `--bg`) change karo.
- **Route number/name:** `index.html` me `.route-badge` section edit karo.
- **Online counter:** abhi ye ek simulated number hai (`script.js` ke `startOnlineCounter`). Agar real listener count chahiye to ek backend/analytics service jodni hogi.
- **Horn button:** ye ek Web Audio easter-egg hai, koi audio file nahi chahiye.

Bas — files ready hain, `/home/claude/bus-jukebox` folder me. Neeche download links diye ja rahe hain.
