const cloudinary = (version, publicId) =>
  `https://res.cloudinary.com/dweqigxnz/image/upload/f_auto,q_auto,w_800,c_limit/${version}/ieee-gallery/${publicId}.webp`

export const galleryPhotos = [
  {
    id: 'techne-1',
    src: cloudinary('v1792177495', 'jwreo5k3fipyev2wfhqx'),
    alt: 'IEEE HITU at Techne Summit',
    title: 'Techne Summit',
    caption: 'Branch representation and technology exhibition at Techne Summit.',
  },
  {
    id: 'techne-2',
    src: cloudinary('v1792177496', 'xajhkvbvcfrqtfe6ydam'),
    alt: 'Techne Summit technical discussion',
    title: 'Techne Summit Discussions',
    caption: 'Connecting with technology leaders and industry innovators.',
  },
  {
    id: 'techne-3',
    src: cloudinary('v1792177497', 'kczcm4ohsjoxfhrrggwn'),
    alt: 'Techne Summit booth and demos',
    title: 'Techne Summit Booth',
    caption: 'Demonstrating student projects and engineering initiatives.',
  },
  {
    id: 'techne-4',
    src: cloudinary('v1792177498', 'uqwowlpmvv3pxwm0a9nc'),
    alt: 'Techne Summit branch team',
    title: 'Techne Summit Delegation',
    caption: 'IEEE HITU Student Branch delegation celebrating summit success.',
  },
  {
    id: 'event-1',
    src: cloudinary('v1792177499', 'f15dknjdvkcddoelxh5c'),
    alt: 'Branch technical workshop session',
    title: 'Hands-on Technical Workshop',
    caption: 'Engaging workshops empowering members with practical engineering skills.',
  },
  {
    id: 'cg-1',
    src: cloudinary('v1792177500', 'ors6vlxeeo0yj9hyit3y'),
    alt: 'Consulting Group collaborative session',
    title: 'Consulting Group Kickoff',
    caption: 'Interactive problem solving and strategy formulation.',
  },
  {
    id: 'cg-2',
    src: cloudinary('v1792177501', 'ubotvam5efptood4td8h'),
    alt: 'Consulting Group presentations',
    title: 'Consulting Group Presentations',
    caption: 'Teams pitching innovative solutions and technical frameworks.',
  },
  {
    id: 'cg-3',
    src: cloudinary('v1792177501', 'lgb4o7zb3rexawjcl1ky'),
    alt: 'Consulting Group breakout discussions',
    title: 'Breakout Ideation',
    caption: 'Deep-dive collaborative sessions tackling engineering challenges.',
  },
  {
    id: 'cg-4',
    src: cloudinary('v1792177503', 'c8rv53hmgwu9f2nylmys'),
    alt: 'Consulting Group concluding session',
    title: 'Consulting Group Completion',
    caption: 'Celebrating participant achievements and certificates.',
  },
]
