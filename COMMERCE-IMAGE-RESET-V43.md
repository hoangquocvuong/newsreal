# Commerce Image Reset V43

Fixes stale product images when clicking “Đăng sản phẩm khác” after editing.

Root cause: V42 tried to call `syncOld([])` from a click handler outside the closure where `syncOld` is defined. The form reset could therefore stop before the private gallery state was cleared.

V43 adds one reset owner inside the gallery controller. It clears the private images array, cover/gallery hidden fields, file input, preview thumbnails, current-image thumbnails, edit id, status text, and restores the publish button label.
