export interface AuthData {
  sessions: Session[];
  user: User;
}

export default interface File {
  url: string;
  name: string;
}

export interface Session {
  sid: string;
  expired: number;
  sess: Sess;
  isOwnSession: boolean;
  createdAtStr: string;
  createdAtDt: Date;
  useragentStr: string;
  loginType: string;
}

export interface Sess {
  cookie: Cookie;
  passport: Passport;
  useragent: Useragent;
  createdAt: number;
  loginType: string;
}

export interface Cookie {
  originalMaxAge: number;
  expires: Date;
  secure: boolean;
  httpOnly: boolean;
  path: string;
  sameSite: string;
}

export interface Passport {
  user: string;
}

export interface Useragent {
  isYaBrowser: boolean;
  isAuthoritative: boolean;
  isMobile: boolean;
  isMobileNative: boolean;
  isTablet: boolean;
  isiPad: boolean;
  isiPod: boolean;
  isiPhone: boolean;
  isiPhoneNative: boolean;
  isAndroid: boolean;
  isAndroidNative: boolean;
  isBlackberry: boolean;
  isOpera: boolean;
  isIE: boolean;
  isEdge: boolean;
  isIECompatibilityMode: boolean;
  isSafari: boolean;
  isFirefox: boolean;
  isWebkit: boolean;
  isChrome: boolean;
  isKonqueror: boolean;
  isOmniWeb: boolean;
  isSeaMonkey: boolean;
  isFlock: boolean;
  isAmaya: boolean;
  isPhantomJS: boolean;
  isEpiphany: boolean;
  isDesktop: boolean;
  isWindows: boolean;
  isLinux: boolean;
  isLinux64: boolean;
  isMac: boolean;
  isChromeOS: boolean;
  isBada: boolean;
  isSamsung: boolean;
  isRaspberry: boolean;
  isBot: boolean;
  isCurl: boolean;
  isAndroidTablet: boolean;
  isWinJs: boolean;
  isKindleFire: boolean;
  isSilk: boolean;
  isCaptive: boolean;
  isSmartTV: boolean;
  isUC: boolean;
  isFacebook: boolean;
  isAlamoFire: boolean;
  isElectron: boolean;
  silkAccelerated: boolean;
  browser: string;
  version: string;
  os: string;
  platform: string;
  geoIp: GeoIP;
  source: string;
  isWechat: boolean;
}

export interface GeoIP {}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  avatarURL: string;
  createdAt: Date;
  coin: number;
}

export interface Album {
  album_id: number;
  user_id: number;
  title: string;
  description: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}
