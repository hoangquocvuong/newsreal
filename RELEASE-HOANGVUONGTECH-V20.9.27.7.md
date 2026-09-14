# Hoàng Vương Tech V20.9.27.7 — Lion empty-state contract fix

- Fixes Lân Sư Rồng `Không bài mẫu` mode where package cards (2–7 đầu lân) still exposed real demo copy.
- Keeps the populated card DOM/geometry 1:1 and masks image, title, excerpt, specs, effects, buttons, price and detail CTA as skeletons.
- Extends regression coverage so this cannot silently return.
- Preserves the existing shared professional-template simulation contract, mobile responsive contract, favicon/device preview, and HVT-chat isolation.
