# Website TODO

## Executive Officers section

- [x] Add an **Executive Officers** section to the public website (Home page).
- [x] Decide the final placement (Home page, between the partners strip and the recruitment band; About page optional later).
- [ ] Add the verified officer names and roles (5 of 6 published):
  - [x] Chairwoman — Mariam M Almahdi
  - [x] Vice Chair — Habiba Hamdy
  - [ ] Vice Chair 2
  - [x] Treasurer — Rania Elrediny
  - [x] Secretary — Adham
  - [x] Webmaster — Hazem Ezz
- [ ] Collect and add one approved profile picture for **each officer** (5 of 6 photos published).
- [ ] Store officer photos as optimized web images with consistent dimensions and clear filenames (all WebP, 34–310 KB; verify dimensions are consistent).
- [x] Add descriptive alt text for every published officer photo (`src/features/home/data/officers.js`).
- [ ] Confirm spelling, role titles, photos, and publication approval before launch.
- [x] Add responsive officer cards with accessible layout (non-interactive cards; global focus ring covers future links).
- [x] Refine the Chairwoman card: photo 192/224/256 px (mobile/md/lg), photo-driven height, horizontal layout with left-aligned text from md up.
- [x] Add optional per-officer social icon links (`SocialLinks` component; brand icons inline SVG; hover lift/fill, reduced-motion aware, accessible labels).
- [ ] Collect social links (LinkedIn/GitHub/email, etc.) for the remaining officers (Habiba, Rania, Adham, Hazem added; Mariam pending).
- [ ] Add tests covering all six roles, names, and required image rendering (5 published roles covered in `OfficersSection.test.jsx`).
