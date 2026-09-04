# Game Admin Taxonomy Contract V1

- Category is the single TH / BH / CH source of truth. Do not add a duplicate game-group field.
- Admin taxonomy follows the public progressive-filter model: Group -> Level -> Purpose/District -> Style -> Defense -> Year.
- Builder Hall Purpose and Defense must be semantically different. Purpose describes how the layout is used; Defense describes the attack/archetype it is designed to resist.
- Game Admin must never expose service lead / "Khách cần tư vấn" navigation.
- Existing payload compatibility is preserved by deriving `game_group` from the selected category on save.
