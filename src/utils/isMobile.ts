export function isMobileByUserAgent(): boolean {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Checks for common mobile device identifiers
  if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |mobi|midp|mmp|mobile.+firefox|netfront|nokia|opera l(t|g)|palmos|pda|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(userAgent)) {
    return true;
  }
  
  // Checks for tablets which might have different user agents
  if (/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(d|ex)|at(t|us)|av30|bado|bd\-r|mo\-g|bl(ac|km)|go(\.on|\-m)|c.ad|cb(i|m)|cdm|ceg|cell|cwi|m\-cr|n(e|t)|r(su|u)m|te(c|t)|tipa|tren|v(g|k)|vk(4|5)|v70|wa(g|s)|wh(c|st)/i.test(userAgent.substring(0, 4))) {
    return true;
  }
  
  return false;
}