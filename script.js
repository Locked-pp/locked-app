const form = document.getElementById('form');
const text = document.getElementById('text');
const file = document.getElementById('hide');
const resetBtn = document.getElementById("resetBtn");

//check the data
function check() {
    const userName = document.getElementById('name').value;
    const passWord = document.getElementById('password').value;
    const savedName = localStorage.getItem("savedName");
    const savedPassword = localStorage.getItem("savedPassword");
    //data validation
    if (userName === '') {
        text.innerText = 'Enter your name please';
    } else if (passWord === '') {
        text.innerText = 'Enter a password please';
    } else if (userName.length < 5) {
        text.innerText = 'The name can not be less than 5 letters';
    } else if (passWord.length < 6) {
        text.innerText = 'The password can not be less than 6 characters'
    } else {
        //check if the data if it's saved before
        if (!savedName || !savedPassword) {
            //if not saved then save them
            localStorage.setItem("savedName", userName);
            localStorage.setItem("savedPassword", passWord);

            text.innerText = 'Registered successfully';
            text.style.color = 'green';
            text.style.fontStyle = 'italic';
            file.style.display = 'block';
            //if saved the welcome back the user
        } else {
            if (userName === savedName && passWord === savedPassword) {
                text.innerText = 'Welcome back Login successful';
                text.style.color = 'green';
                text.style.fontStyle = 'italic';
                file.style.display = 'block';
                //if he had an accout it'll check the data
            } else {
                text.innerText = 'please check your data again';
            }
        }
    }
}

//on submit do....
if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        check();
    });
}

//if I pressed the reset button
if (resetBtn) {
    resetBtn.addEventListener("click", function () {

        localStorage.removeItem("savedName");
        localStorage.removeItem("savedPassword");

        text.innerText = "Account has been reset. You can register again.";
        text.style.color = "orange";
        text.style.fontStyle = "italic";

        if (file) {
            file.style.display = "none";
        }

        clearFiles();
    });
}

//////////////////////////////////////////////////////////////////////////////////////

const fileInput = document.getElementById('fileInput');
const preview = document.getElementById("preview");
const savedName = localStorage.getItem("savedName");
const savedPassword = localStorage.getItem("savedPassword");

//stop the user from entering the secret page
if (!localStorage.getItem("savedName") || !localStorage.getItem("savedPassword")) {
    if (document.body.id === "secret") {
        window.location.href = "index.html";
    }
}

//open a data base to save the filles
let db;
const request = indexedDB.open("MyFilesDB", 1);

request.onupgradeneeded = (e) => {
    db = e.target.result;

    if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "name" });
    }
};

request.onsuccess = (e) => {
    db = e.target.result;
    displayFiles();
};

//saving the files
function saveFile(fileInput) {
    if (!db) return;

    const transaction = db.transaction("files", "readwrite");
    const store = transaction.objectStore("files");
    store.put({ name: fileInput.name, file: fileInput });
}

//take the files and display them
function renderFile(file, clear = false) {
    if (clear) preview.innerHTML = "";

    const url = URL.createObjectURL(file);

    if (file.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = url;
        preview.appendChild(img);
        img.onload = () => URL.revokeObjectURL(url);

    } else if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.src = url;
        video.controls = true;
        preview.appendChild(video);
        video.onloadeddata = () => URL.revokeObjectURL(url);

    } else if (file.type === "application/pdf") {
        const iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.style.width = "100%";
        preview.appendChild(iframe);
        iframe.onload = () => URL.revokeObjectURL(url);

    } else {
        const p = document.createElement("p");
        p.innerText = `File: ${file.name}`;
        p.style.color = "white";
        preview.appendChild(p);
        URL.revokeObjectURL(url);
    }
}

if (fileInput) {
    fileInput.addEventListener("change", () => {
        const selectedFile = fileInput.files[0];
        if (!selectedFile) return;

        saveFile(selectedFile);
        renderFile(selectedFile);
    });
}

//display the file
function displayFiles() {
    preview.innerHTML = "";

    const transaction = db.transaction("files", "readonly");
    const store = transaction.objectStore("files");
    const request = store.getAll();

    request.onsuccess = (e) => {
        const files = e.target.result;
        files.forEach(f => {
            renderFile(f.file);
        });
    };
}

function clearFiles() {

    const request = indexedDB.deleteDatabase("MyFilesDB");

    request.onsuccess = () => {
        if (preview) {
            preview.innerHTML = "";
        }
        console.log("Database deleted");
    };

    request.onerror = () => {
        console.log("Error deleting database");
    };
}
