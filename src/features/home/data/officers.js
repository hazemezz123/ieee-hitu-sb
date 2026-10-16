// Executive officers roster. Portraits served from Cloudinary CDN (ieee-officers).
// Order follows branch hierarchy; update names/roles here as the board evolves.
// Optional per officer: bio (string) and socials (linkedin, github, twitter, instagram, facebook, email).
const portrait = (version, publicId) =>
  `https://res.cloudinary.com/dweqigxnz/image/upload/f_auto,q_auto,w_600,c_limit/${version}/ieee-officers/${publicId}.webp`;

export const officers = [
  {
    name: "Mariam M Almahdi",
    role: "Chairwoman",
    img: portrait("v1792178192", "ma2iygcpmdy3bqplirgh"),
    alt: "Portrait of Mariam M Almahdi, Chairwoman",
    bio: "",
    socials: {
      linkedin: "https://www.linkedin.com/in/mariam-mostafa06/",
      email: "mailto:mariamalmahdi6@gmail.com",
    },
  },
  {
    name: "Habiba Hamdy",
    role: "Vice Chair",
    img: portrait("v1792178191", "vn5jqpcxworykaxmido5"),
    alt: "Portrait of Habiba Hamdy, Vice Chair",
    imgScale: "scale-90",
    imgHoverScale: "group-hover:scale-95",
    imgOrigin: "origin-bottom",
    socials: {
      linkedin: "https://www.linkedin.com/in/habiba7amdy/",
      email: "mailto:habiba.hamdy.business@gmail.com",
    },
  },
  {
    name: "Rania Elrediny",
    role: "Treasurer",
    img: portrait("v1792178195", "s4tpiwljsff0jqz0u9xb"),
    alt: "Portrait of Rania Elrediny, Treasurer",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/rania-elrediny-3217a7397?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      email: "mailto:raniaelrediny@gmail.com",
    },
  },
  {
    name: "Adham Ahmed",
    role: "Secretary",
    img: portrait("v1792178190", "asoiypao8cgzwhtukgll"),
    alt: "Portrait of Adham, Secretary",
    socials: {
      linkedin: "https://linkedin.com/in/douddev",
      email: "mailto:adham.ahmad@computer.org",
    },
  },
  {
    name: "Hazem Ezz",
    role: "Webmaster",
    img: portrait("v1792184593", "tert7rfbgfrozg2fkbbm"),
    alt: "Portrait of Hazem Ezz, Webmaster",
    imgScale: "scale-150",
    imgHoverScale: "group-hover:scale-[1.6]",
    socials: {
      linkedin: "https://www.linkedin.com/in/hazem-ezz-424498285",
      email: "mailto:hazemezz988@gmail.com",
    },
  },
];
