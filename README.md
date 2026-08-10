Check:- https://itsanshux.github.io/Bus-Playlist/

# Driver's Choice 🚌

A single-page music jukebox inspired by [saloon.wtf](https://saloon.wtf/), themed around the songs every bus driver blasts from the dashboard speaker — jhalar tassels swaying up top, a scrolling destination-board marquee, and a road-shaped progress bar with a moving bus icon.

## How it plays music

Unlike a normal jukebox, this site does **not** host any audio files. Every track streams live from an **official YouTube channel** using the YouTube IFrame Player API — same idea as embedding a YouTube video, just kept small and tucked out of sight so it feels like a native player. This means:

- No copyright issues from hosting song files yourself.
- Album art is pulled automatically from YouTube's own thumbnail (`https://img.youtube.com/vi/<videoId>/hqdefault.jpg`).
- The first "Play" tap has to come from the user — browsers block autoplaying sound until you interact with the page, so the first track loads paused and waits for a tap.

`songs.json` ships with 4 real starter tracks (Tip Tip Barsa Paani, Kajra Re, Chura Ke Dil Mera, Tunak Tunak Tun) pointing at official channel uploads. Add as many more as you like.

## Files
- `index.html` — page structure
- `style.css` — truck-art theme (pink/marigold/teal palette)
- `script.js` — YouTube player logic, no-repeat shuffle, road progress bar, horn easter-egg
- `songs.json` — playlist data (edit this to change songs)

## 1. Add your own songs

Find the song's **official** YouTube upload (channel name usually says "official," or it's the label's / studio's own channel — e.g. T-Series, YRF, Zee Music, Tips Official, Shemaroo, or the artist's own channel). Copy the video ID from the URL:

`https://www.youtube.com/watch?v=`**`4dsFQFCvVGU`** → the ID is `4dsFQFCvVGU`

Then add an entry to `songs.json`:

```json
{
  "title": "Song Name",
  "artist": "Singer(s) — Movie/Album",
  "videoId": "XXXXXXXXXXX",
  "channel": "T-Series (official)",
  "spotify": "https://open.spotify.com/search/Song%20Name",
  "ytmusic": "https://music.youtube.com/search?q=Song+Name"
}
```

- `videoId` is the only field the player strictly needs — everything else is display/links.
- `spotify` / `ytmusic` can be direct track links if you have them, or a search link like the examples above.

## 2. No-repeat shuffle — how it works

The player keeps a shuffled queue of every song's index. Each time a track ends (or you hit next), it pops the next one from that queue — so you hear every song once before anything repeats. Once the queue empties, it reshuffles for a fresh cycle, and makes sure the first song of the new cycle isn't the same one that just finished. Toggle the 🔀 button to switch to plain in-order playback instead.

## 3. Host on GitHub (GitHub Pages)

1. Create a new repo on GitHub — e.g. `drivers-choice`.
2. Push these files to it:
   ```bash
   git init
   git add .
   git commit -m "Driver's Choice jukebox"
   git branch -M main
   git remote add origin https://github.com/<your-username>/drivers-choice.git
   git push -u origin main
   ```
3. Go to **Settings → Pages** in the repo.
4. **Source** = `Deploy from a branch`, **Branch** = `main`, folder = `/ (root)`, then **Save**.
5. Live in a few minutes at: `https://<your-username>.github.io/drivers-choice/`

### Custom domain (optional)
Repo Settings → Pages → **Custom domain**, then point a `CNAME` record at your registrar to `<your-username>.github.io`.

## 4. Customize

- **Colors:** `style.css` → `:root` variables (`--pink`, `--marigold`, `--teal`, `--bg`).
- **Route badge:** `index.html` → `.route-badge` section.
- **Online counter:** simulated for now (`script.js` → `startOnlineCounter`); wire up real analytics if you want a live number.
- **Horn button:** pure Web Audio synth, no file needed.
