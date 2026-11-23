const uploadForm = document.querySelector("#upload-form");
const libraryContent = document.querySelector("#library-content");
const itemCount = document.querySelector("#item-count");
const formMessage = document.querySelector("#form-message");
const uploads = [];

uploadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(uploadForm);
    const file = formData.get("file");
    const uploader = formData.get("uploader").trim();
    const title = formData.get("title").trim();

    if (!(file instanceof File) || file.size === 0 || !uploader || !title) {
        formMessage.textContent = "Add your name, a title, and a file first.";
        return;
    }

    uploads.push({
        id: `${Date.now()}-${Math.random()}`,
        uploader,
        category: formData.get("category"),
        title,
        file,
        url: URL.createObjectURL(file)
    });

    renderLibrary();
    formMessage.textContent = "Added to the library in this browser tab.";
    uploadForm.reset();
});

function renderLibrary() {
    itemCount.textContent = `${uploads.length} ${uploads.length === 1 ? "file" : "files"}`;

    if (uploads.length === 0) {
        libraryContent.replaceChildren(createEmptyState());
        return;
    }

    const folders = new Map();
    uploads.forEach((upload) => {
        const key = upload.uploader.trim().toLocaleLowerCase();
        if (!folders.has(key)) {
            folders.set(key, { name: upload.uploader, items: [] });
        }
        folders.get(key).items.push(upload);
    });

    const fragment = document.createDocumentFragment();
    folders.forEach((folder) => fragment.append(createFolder(folder)));
    libraryContent.replaceChildren(fragment);
}

function createEmptyState() {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";

    const icon = document.createElement("span");
    icon.className = "empty-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "↗";

    const heading = document.createElement("h3");
    heading.textContent = "It’s a little quiet in here.";

    const message = document.createElement("p");
    message.textContent = "Add a file to start your library. Items will be grouped in folders by uploader.";
    emptyState.append(icon, heading, message);
    return emptyState;
}

function createFolder(folder) {
    const section = document.createElement("section");
    section.className = "uploader-folder";

    const heading = document.createElement("div");
    heading.className = "folder-heading";

    const icon = document.createElement("span");
    icon.className = "folder-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "▰";

    const name = document.createElement("h3");
    name.textContent = folder.name;

    const count = document.createElement("span");
    count.textContent = `${folder.items.length} ${folder.items.length === 1 ? "file" : "files"}`;
    heading.append(icon, name, count);

    const list = document.createElement("div");
    list.className = "file-list";
    folder.items.forEach((upload) => list.append(createFileCard(upload)));

    section.append(heading, list);
    return section;
}

function createFileCard(upload) {
    const card = document.createElement("article");
    card.className = "file-card";

    const icon = document.createElement("span");
    icon.className = "file-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = getFileExtension(upload.file.name);

    const info = document.createElement("div");
    info.className = "file-info";

    const title = document.createElement("h4");
    title.textContent = upload.title;

    const metadata = document.createElement("p");
    metadata.className = "file-meta";
    metadata.textContent = `${upload.category} · ${upload.file.name} · ${formatFileSize(upload.file.size)}`;
    info.append(title, metadata);

    const actions = document.createElement("div");
    actions.className = "file-actions";

    const download = document.createElement("a");
    download.className = "download-link";
    download.href = upload.url;
    download.download = upload.file.name;
    download.textContent = "Download";

    const remove = document.createElement("button");
    remove.className = "remove-button";
    remove.type = "button";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", `Remove ${upload.title}`);
    remove.addEventListener("click", () => removeUpload(upload.id));

    actions.append(download, remove);
    card.append(icon, info, actions);
    return card;
}

function removeUpload(id) {
    const index = uploads.findIndex((upload) => upload.id === id);
    if (index < 0) {
        return;
    }

    URL.revokeObjectURL(uploads[index].url);
    uploads.splice(index, 1);
    renderLibrary();
    formMessage.textContent = "File removed from this browser tab.";
}

function getFileExtension(fileName) {
    const parts = fileName.split(".");
    return parts.length > 1 ? parts.pop().slice(0, 5) : "FILE";
}

function formatFileSize(size) {
    if (size < 1024) {
        return `${size} B`;
    }
    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}