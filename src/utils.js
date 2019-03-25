export const setLoginName = name => {
  localStorage['LOGINNAME'] = name;
}

export const getLoginName = () => localStorage['LOGINNAME'] || '';

export const appId = 'app';

export const mobilePattern = /^1[3456789]\d{9}$/;

export const transformArrayBufferToBase64 = buffer => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let len = bytes.byteLength, i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}