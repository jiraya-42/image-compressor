function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(",");
  const mime = parts[0].match(/:(.*?);/)[1];
  const binary = atob(parts[1]);
  const array = [];

  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }

  return new Blob([new Uint8Array(array)], { type: mime });
}

const imageInput = document.getElementById("imageInput");
const uploadArea = document.getElementById("uploadArea");
const compressBtn = document.getElementById("compressBtn");
const targetSizeSelect = document.getElementById("targetSize");
const result = document.getElementById("result");
const preview = document.getElementById("preview");
const sizeInfo = document.getElementById("sizeInfo");
const downloadBtn = document.getElementById("downloadBtn");
const formatNote = document.getElementById("formatNote");

/* Drag & Drop */
uploadArea.addEventListener("dragover", e => {
  e.preventDefault();
  uploadArea.classList.add("drag-over");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("drag-over");
});

uploadArea.addEventListener("drop", e => {
  e.preventDefault();
  uploadArea.classList.remove("drag-over");
  imageInput.files = e.dataTransfer.files;
});

/* Compress */
compressBtn.addEventListener("click", () => {
  if (!imageInput.files.length) {
    alert("Please select an image");
    return;
  }

  const file = imageInput.files[0];
  const targetKB = parseInt(targetSizeSelect.value, 10);

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      formatNote.style.display = file.type === "image/png" ? "block" : "none";
      compressImage(img, targetKB);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

function compressImage(img, targetKB) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  let quality = 0.9;
  let dataUrl;

  do {
    dataUrl = canvas.toDataURL("image/jpeg", quality);
    quality -= 0.05;
  } while (dataUrl.length / 1024 > targetKB && quality > 0.1);

  const blob = dataURLtoBlob(dataUrl);
  const finalSizeKB = Math.round(blob.size / 1024);

  preview.src = dataUrl;
  downloadBtn.href = dataUrl;

  sizeInfo.innerText =
    finalSizeKB > targetKB
      ? `Final size: ${finalSizeKB} KB (Target not reachable without heavy quality loss)`
      : `Final size: ${finalSizeKB} KB`;

  result.classList.remove("hidden");
}
