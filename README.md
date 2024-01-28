# Simple M3U Parser

## Overview

This is a simple JavaScript library for parsing M3U playlist files. It includes two classes: `MediaPlaylist` for parsing entire M3U files and `MediaPlaylistItem` for parsing individual items within the playlist.

## Installation

```bash
npm install simple-m3u-parser
```

## Usage

### Parsing M3U Playlist

```javascript
import { MediaPlaylist } from "simple-m3u-parser";
import fs from "fs";

// Example: Read M3U file as Uint8Array
const fileData = fs.readFileSync("example.m3u");
const playlist = new MediaPlaylist(fileData);

// Access playlist items
console.log(playlist.playlist_items);
```

### Parsing Individual Playlist Item

```javascript
import { MediaPlaylistItem } from "simple-m3u-parser";

// Example: Create a MediaPlaylistItem
const itemInfo = "#EXTINF:180,Song 1\nhttp://example.com/song1.mp3";
const playlistItem = new MediaPlaylistItem(itemInfo);

// Access properties of the playlist item
console.log(playlistItem.name);
console.log(playlistItem.duration);
console.log(playlistItem.uri);
console.log(playlistItem.attributes);
```

## Classes

### `MediaPlaylistItem`

- `name`: Name of the media item.
- `duration`: Duration of the media item in seconds.
- `uri`: Location of the media file.
- `attributes`: Additional attributes defined in the #EXTINF tag.

### `MediaPlaylist`

- `playlist_items`: An array of `MediaPlaylistItem` objects representing the items in the playlist.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
