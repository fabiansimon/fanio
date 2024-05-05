export class REGEX {
  static youtubeSong: RegExp =
    /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/;
  static youtubePlaylist: RegExp =
    /^(https?:\/\/)?((www\.)?youtube\.com|youtu\.be)\/(watch\?v=[\w-]+&list=[\w-]+).*$/;
}
