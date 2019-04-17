import XLSX from 'xlsx'
import FileSaver from 'file-saver'

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

// 字符串转字符流
const s2ab = s => {
  if (typeof ArrayBuffer !== 'undefined') {
    const buffer = new ArrayBuffer(s.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i != s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buffer;
  }

  const buffer = new Array(s.length);
  for (let i = 0; i != s.length; ++i) {
    buffer[i] = s.charCodeAt(i) & 0xFF;
  }
  return buffer;
};

export const exportXLSX = ({filename, filedata}) => {
  const wopts = {bookType: 'xlsx', type: 'binary'};
  const wb = {SheetNames: ['Sheet1'], Sheets: {}, Props: {}};
  wb.Sheets['Sheet1'] = XLSX.utils.json_to_sheet(filedata);

  // 创建二进制对象写入转换好的字节流
  const tmpDown = new Blob([s2ab(XLSX.write(wb, wopts))], {type: "application/octet-stream"});
  FileSaver.saveAs(tmpDown, `${filename}.xlsx`);
};

const padStartZero = s => {
  s = s.toString();
  return s.padStart(2, 0);
};

export const getStamp = () => {
  const newDate = new Date();
  const [year, month, date, hour, minute, second] = [
    newDate.getFullYear(),
    padStartZero(newDate.getMonth() + 1),
    padStartZero(newDate.getDate()),
    padStartZero(newDate.getHours()),
    padStartZero(newDate.getMinutes()),
    padStartZero(newDate.getSeconds())
  ];
  return `${year}${month}${date}${hour}${minute}${second}`;
}