# Commerce Admin Management V36

- Removes the legacy inline submit interception so the real Commerce uploader/publisher owns submit.
- Multi-image upload persists real uploaded URLs; no sample-image substitution in the Admin publish path.
- After publish, the editor is hidden and Admin moves to the product list.
- Product list supports Edit / Hide / Delete.
- Categories support rename/delete; API refuses deletion while products still use the category.
- Product options are simplified for non-technical shop owners and variant combinations are generated automatically while typing.
- Advanced slider control remains internal/hidden from the quick publish form.
