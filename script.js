/* ================================
   Helper: Convert Base64 to Blob
   ================================ */
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

/* ================================
   DOM Elements
   ================================ */
const imageInput = document.getElementById("imageInput");
const uploadArea = document.getElementById("uploadArea");
const compressBtn = document.getElementById("compressBtn");
const targetSizeSelect = document.getElementById("targetSize");
const result = document.getElementById("result");
const preview = document.getElementById("preview");
const sizeInfo = document.getElementById("sizeInfo");
const downloadBtn = document.getElementById("downloadBtn");
const formatNote = document.getElementById("formatNote");

/* ================================
   Drag & Drop (Desktop only)
   ================================ */
uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("drag-over");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("drag-over");
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("drag-over");

  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith("image/")) return;

  imageInput.files = e.dataTransfer.files;
});

/* ================================
   Compress Button
   ================================ */
compressBtn.addEventListener("click", () => {
  if (!imageInput.files.length) {
    alert("Please select an image");
    return;
  }

  const file = imageInput.files[0];
  const targetKB = parseInt(targetSizeSelect.value, 10);

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = () => {
      formatNote.style.display = file.type === "image/png" ? "block" : "none";
      compressImage(img, targetKB);
    };
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
});

/* ================================
   Compression Logic
   ================================ */
function compressImage(img, targetKB) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  let quality = 0.9;
  let compressedDataUrl;

  do {
    compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
    quality -= 0.05;
  } while (compressedDataUrl.length / 1024 > targetKB && quality > 0.1);

  const blob = dataURLtoBlob(compressedDataUrl);
  const finalSizeKB = Math.round(blob.size / 1024);

  preview.src = compressedDataUrl;
  downloadBtn.href = compressedDataUrl;
  downloadBtn.download = "compressed.jpg";

  sizeInfo.innerText =
    finalSizeKB > targetKB
      ? `Final size: ${finalSizeKB} KB (Target not reachable without heavy quality loss)`
      : `Final size: ${finalSizeKB} KB`;

  result.classList.remove("hidden");
}
