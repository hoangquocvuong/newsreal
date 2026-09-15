# HoangVuongTech V20.9.27.42 — Laptop Showroom Unified Contract

- Replaces the obsolete EV/VinFast charging demo (`dich-vu-5`) with a professional laptop showroom.
- Base/renewal catalog price: 3,000,000 VND/year (Global Sale still applies to new registration according to the shared pricing contract).
- Clear laptop taxonomy: office, gaming, thin & light, creator, MacBook, buying guides.
- Full product cards: real laptop photography, configuration, sample price, old price and consultation CTA.
- Customer consultation form posts to the existing tenant-owned `/api/service-leads` inbox; Admin continues to manage requests under `Khách cần tư vấn`.
- Removes obsolete EV renderer, Leaflet dependency, station API/map settings and contracts to reduce conflicts.
- Keeps the legacy `/demo/dich-vu/tram-sac-vinfast/` route as a compatibility alias while the canonical route becomes `/demo/dich-vu/cua-hang-laptop/`.
- Uses the same Universal Template Runtime, Admin context, Hero, sample handover and responsive contracts as the rest of the system.
