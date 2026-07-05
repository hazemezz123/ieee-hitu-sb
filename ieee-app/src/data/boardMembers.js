function gDriveImg(url) {
  if (!url || url === '???' || url === 'ارفع صوره ازاي ده طالب تيكست🤡' || url.includes('icloud')) return null;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w400` : null;
}

const members = [
  { name: 'Abdelrhman Saleh Amin', committee: 'CS', position: 'Head', email: 'abdulrhman00saleh@gmail.com', phone: '01147955602', img: null },
  { name: 'Shahd Rady El-sayed', committee: 'PR', position: 'Head', email: 'shahdrelsayed@gmail.com', phone: '01225270652', img: gDriveImg('https://drive.google.com/file/d/1QmVsBmVtyZOuFEH1XJ4Q4pZSP4XlGuIn/view') },
  { name: 'Omar Raafat Hamed Abdelaziz', committee: 'Automation', position: 'Head', email: 'oraafat04@gmail.com', phone: '01145562033', img: gDriveImg('https://drive.google.com/open?id=1VnSDXYnMDE8FFKwnE1pkH10-1GQlG7Ep') },
  { name: 'Basel Khaled Matter', committee: 'T&D', position: 'Vice Head', email: 'basel84matter@gmail.com', phone: '01024567591', img: gDriveImg('https://drive.google.com/file/d/1wHztBssb1ak5exLB5Ls6I-KQ0V5DbMmE/view') },
  { name: 'Ahmed Hamdy', committee: 'Robotic', position: 'Head', email: 'alshabmido2007@gmail.com', phone: '01018248527', img: gDriveImg('https://drive.google.com/file/d/1RyzfxFZuLfRYaLXj-_KHrPjAnKuVFmap/view') },
  { name: 'Mohammed Basem Abdul Momen', committee: 'T&D', position: 'Vice Head', email: 'medomix777@gmail.com', phone: '01211446323', img: gDriveImg('https://drive.google.com/drive/folders/11Dx8JHm3grpy3Czbu3_0S2dt88nWQmwe') },
  { name: 'Menna Allah Mohamed', committee: 'Multi Media', position: 'Head', email: 'mennaallahmohammad8@gmail.com', phone: '01112157214', img: gDriveImg('https://drive.google.com/file/d/1GB8vSUjsAJd5R_2EwbaKfivxee_1DcuK/view') },
  { name: 'Kareem Mohammed Sayed', committee: 'AI', position: 'Vice Head', email: 'km3271762@gmail.com', phone: '01212832454', img: gDriveImg('https://drive.google.com/open?id=1DuGUtEeFbX-quxwXPQeW-pdcojcDFnht') },
  { name: 'Yahia Ahmed Saad', committee: 'Multi Media', position: 'Vice Head', email: 'yahiasaad2424@gmail.com', phone: '01152723330', img: gDriveImg('https://drive.google.com/file/d/1Urwboxgx0OzUL15QOQBi9STzPZMc3XZc/view') },
  { name: 'Mariam Ahmed El-Neblawy', committee: 'HR', position: 'Vice Head', email: 'mariamelneblawey@gmail.com', phone: '01229330443', img: gDriveImg('https://drive.google.com/open?id=1fT_g39YOiuQ4UDotePAF84i4RB5mOTsx') },
  { name: 'Hazem Mohammed', committee: 'Web', position: 'Head', email: 'hazemezz988@gmail.com', phone: '+201005291205', img: gDriveImg('https://drive.google.com/open?id=1Y7kiPpKUnOJz9ACWt-klfJ5kUm8Yz0y0') },
  { name: 'Ramez Kamal', committee: 'AI', position: 'Vice Head', email: 'ramezkmal3@gmail.com', phone: '01002160012', img: gDriveImg('https://drive.google.com/file/d/1cSziwWozZQTP5zivJLOxbgW12QzrxG1X/view') },
  { name: 'Moustafa Maher', committee: 'DS', position: 'Head', email: 'mustfa.maheer@gamil.com', phone: '01129115112', img: gDriveImg('https://drive.google.com/file/d/1BNxXPLZtZUb0Z5Bb0wqNR01E2YF5uiAR/view') },
  { name: 'Adham Ahmad Hosny Mohammad', committee: 'T&D', position: 'Head', email: 'adham.ahmad.hosny@gmail.com', phone: '+201026777688', img: gDriveImg('https://drive.google.com/file/d/1jIun4Wkhq4ZNF6IbevdBK1v6VfWCGFsR/view') },
  { name: 'Bassam Hossam', committee: 'CS', position: 'Vice Head', email: 'bassam.hossam69@gmail.com', phone: '01025100470', img: gDriveImg('https://drive.google.com/open?id=1yIno3Rx1jKbI8on7Vg9cUZHp24Ao2Ax8') },
  { name: 'Samer Muharram', committee: 'AI', position: 'Vice Head', email: 'samermuharram5@gmail.com', phone: '01111496560', img: gDriveImg('https://drive.google.com/file/d/1DnpsTJdJ24kfwTMHhfl1ej3CPEGs5glv/view') },
  { name: 'Ziad Mahmoud Mohamed', committee: 'Marketing', position: 'Vice Head', email: 'ZiadAbdelghany296@gmail.com', phone: '01094680629', img: null },
  { name: 'Ziad Mohamed Fathy', committee: 'Embedded', position: 'Head', email: 'zizo.alprnc.90@gmail.com', phone: '01126596120', img: gDriveImg('https://drive.google.com/file/d/15wNUP-DNhMwKPDOr0yLoFi3-SGILM_1_/view') },
  { name: 'Seif Allah Hany', committee: 'OC', position: 'Head', email: 'seifh3755@gmail.com', phone: '01013603524', img: gDriveImg('https://share.icloud.com/photos/038Idz0vrVELtSm_dH8Qu3fIA') },
  { name: 'Habiba Hamdy Aly Hassan', committee: 'AI / CS / Web', position: 'Technical Software Manager', email: 'habiba7amdy3li@gmail.com', phone: '01554009093', img: gDriveImg('https://drive.google.com/open?id=1CywoTY5GochCfzHnTBPBpVjaQnUO_xBB') },
  { name: 'Mohamed Osama Mohamed', committee: 'AI', position: 'Head', email: 'mo228710@gmail.com', phone: '01110634455', img: gDriveImg('https://drive.google.com/file/d/1k5blt8XXjw8HJI2cEMMtdHIgxQd3xXR3/view') },
  { name: 'Omnia Osama Mohammed', committee: 'CS', position: 'Vice Head', email: 'omnyhsmh@gmail.com', phone: '01015179400', img: gDriveImg('https://drive.google.com/open?id=1AUmhW9wmgYk5K-Mla3bo9sdpbbWmqXY_') },
  { name: 'Abdelrahman Mahmoud Zakaria', committee: 'Automation', position: 'Vice Head', email: 'abdelrahman.mahmoud.20.7.2002@gmail.com', phone: '1558568852', img: gDriveImg('https://drive.google.com/open?id=1WMq8iJp-hvvL8y-wzUcuwNVP8sCmtndf') },
  { name: 'Mariam Mohamed Khedr', committee: 'Robotic', position: 'Vice Head', email: 'mariamkhedr49@gmail.com', phone: '01010691805', img: gDriveImg('https://drive.google.com/open?id=1AnTWQKuSEHQpEs-BW1c_Rn3N-RxF01qB') },
  { name: 'Seif Ayman Abdelmoniem', committee: 'Automation', position: '', email: 'seif.abdelmoniem.ahmed@gmail.com', phone: '01145580163', img: gDriveImg('https://drive.google.com/open?id=1pruiB2OqzJLYBrsooyvB3u8tc59DkG4y') },
  { name: 'Youssef Ahmed Ali Gamal', committee: 'Multi Media', position: 'Vice Head', email: 'khalifaayossef@gmail.com', phone: '01151255210', img: gDriveImg('https://drive.google.com/open?id=1VIvzeChTunY_WOnwAEB9azBqdgyM_2YN') },
  { name: 'Omar Farouk', committee: 'HR', position: 'Vice Head', email: 'omarmfarok.47@gmail.com', phone: '01147825907', img: gDriveImg('https://drive.google.com/open?id=1oa8GdVC74QCpjF2tAY7TY_61q4B9eAd9') },
  { name: 'Seif Ayman Abdelmoniem Ahmed', committee: '', position: 'Technical Manager', email: 'seif.abdelmoniem.ahmed@gmail.com', phone: '1145580163', img: gDriveImg('https://drive.google.com/file/d/1yAR6CaV3w_BNSJ4R5xE3OCpJn1mExidi/view') },
];

export const boardMembers = members;
