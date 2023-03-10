document.addEventListener("newism:ckeditor:init", (event) => {
    window.ClassicEditor.create(event.target, event.detail).then((editor) => {
        editor.model.document.on("change", () => {
            editor.updateSourceElement();
        });
    });
});
