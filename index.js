/**
 * Parses a individual item in an M3U playlist.
 */
export class MediaPlaylistItem {
  /**
   * Original string from #EXTINF tag
   * @property {string} info
   */
  #raw_info = "";

  /**
   * Name of media item
   * @property {string} name
   */
  name = "";

  /**
   * Duration in seconds
   * @property {number} duration
   */
  duration = -1;

  /**
   * Location of media file
   * @property {string} uri
   */
  uri = undefined;

  /**
   * Additional attributes defined in #EXTINF
   */
  attributes = {};

  /**
   * @param {string} info - A string that begins with #EXTINF. Denotes a single item in an M3U playlist.
   */
  constructor(info) {
    MediaPlaylistItem.is_valid(info);
    this.#raw_info = info;
    this.name = MediaPlaylistItem.parse_name(info);
    this.duration = MediaPlaylistItem.parse_duration(this.#raw_info);
    this.uri = MediaPlaylistItem.parse_uri(this.#raw_info);
    this.attributes = MediaPlaylistItem.parse_attributes(info);
  }

  /**
   * Check validity of info string, such as whether it begins with #EXTINF.
   * @param {string} info
   */
  static is_valid(info) {
    // const conditions = [typeof info === string, info.startsWith("#EXTINF")];
    // return conditions.every((condition) => condition == true);

    const conditions = [
      // Check if info is a string
      () => {
        if (typeof info !== "string") throw new Error("Must be a string.");
      },
      // Check if info starts with #EXTINF
      () => {
        if (!info.startsWith("#EXTINF")) {
          throw new Error("Does not begin with #EXTINF");
        }
      },
    ];

    conditions.forEach((condition) => condition());
  }

  /**
   * Parse duration from #EXTINF:<duration> in info string
   * @param {string} info
   */
  static parse_duration(info) {
    const start_at = info.charAt(7) === ":" ? 8 : 0;
    // const end_regex = /\d+(?=[\s,])/
    const end_at = info.search(/\d+(?=[\s,])/) + 1;

    // If neither the start or end characters exist, return early.
    if (start_at === 0 || end_at === 0) return;

    const duration_string = info.substring(start_at, end_at);
    const duration = parseInt(duration_string);

    if (isNaN(duration)) {
      throw new Error(
        `Invalid duration provided. '${duration}' is not a number.`
      );
    }

    return duration;
  }

  /**
   * Parse media name from #EXTINF
   * @param {string} info
   */
  static parse_name(info) {
    const first_line = info.substring(0, info.indexOf("\n"));
    const name = first_line.substring(first_line.lastIndexOf(",") + 1);
    return name.trim();
  }

  /**
   * Parse additional attributes from first line of #EXTINF into an object
   * @param {string} info
   */
  static parse_attributes(info) {
    const first_line = info.substring(0, info.indexOf("\n"));

    // Get substring containing attributes
    const duration_end = info.search(/\d+(?=[\s,])/);
    const start_at = duration_end === -1 ? 8 : duration_end + 1;
    const end_at = first_line.lastIndexOf(",");
    const attributes_str = first_line.substring(start_at, end_at).trim();

    // If there are no attributes, return early
    if (!attributes_str) return;

    let attributes = {};
    const attributes_list = attributes_str.split(" ");

    // Add each attribute to object as key-value pair
    attributes_list.forEach((str) => {
      const [key, value] = str.split("=");
      attributes[key] = value ? value.slice(1, -1) : undefined;
    });

    return attributes;
  }

  /**
   * Parse media URI from second line of #EXTINF containing the URI of the media file
   * @param {string} info
   */
  static parse_uri(info) {
    const uri = info.split("\n")[1];
    return uri;
  }
}

/**
 * Parses M3U/M3U8 files into a JS readable object
 */
export class MediaPlaylist {
  static M3U_SIGNATURE = new Uint8Array([
    0x23, 0x45, 0x58, 0x54, 0x4d, 0x33, 0x55,
  ]);

  #bytes_array = undefined;
  #plain_text = "";
  playlist_items = [];
  /**
   * Create a new MediaPlaylist object from an M3U file.
   * @param {Uint8Array} bytes_array
   */
  constructor(bytes_array) {
    MediaPlaylist.check_signature(bytes_array);

    this.#bytes_array = bytes_array;
    this.#plain_text = MediaPlaylist.uint8array_to_utf8(bytes_array);
    this.playlist_items = MediaPlaylist.parse_playlist_items(bytes_array);
  }

  /**
   * Parse playlist string into list of `MediaPlaylistItem`
   * @param {string | Uint8Array} playlist_data
   */
  static parse_playlist_items(playlist_data) {
    let str = "";

    if (isUint8Array(playlist_data)) {
      str = MediaPlaylist.uint8array_to_utf8(playlist_data);
    } else if (typeof playlist_data === "string") str = playlist_data;

    // Remove header line
    if (str.startsWith("#EXTM3U")) str = str.substring(7).trim();

    const split_str = str.split(/(?=#EXTINF)/);
    const playlist_items = split_str.map(
      (info_str) => new MediaPlaylistItem(info_str)
    );

    return playlist_items;
  }

  /**
   * Check if bytes_array is type Uint8Array
   * @param {Uint8Array} bytes_array
   */
  static is_bytes_array(bytes_array) {
    if (!ArrayBuffer.isView(bytes_array)) {
      throw new Error("Not a valid bytes array. Must be of type Uint8Array.");
    }
  }

  /**
   * Make sure the signature of a given bytes array matches the file signature for M3U files.
   * @param {Uint8Array} bytes_array
   */
  static check_signature(bytes_array) {
    MediaPlaylist.is_bytes_array(bytes_array);

    const signature = bytes_array.subarray(0, 7);

    for (let i = 0; i < this.M3U_SIGNATURE.length; i++) {
      if (this.M3U_SIGNATURE[i] !== signature[i]) {
        throw new Error("Invalid file signature. Must be M3U/M3U8.");
      }
    }
  }

  /**
   * Convert bytes array into a UTF-8 string.
   * @param {Uint8Array} bytes_array
   */
  static uint8array_to_utf8(bytes_array) {
    this.is_bytes_array(bytes_array);
    return new TextDecoder().decode(bytes_array);
  }
}
