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
const formatNote = document.getElementById("formatNote");
const imageInput = document.getElementById("imageInput");
const compressBtn = document.getElementById("compressBtn");
const targetSizeSelect = document.getElementById("targetSize");
const result = document.getElementById("result");
const preview = document.getElementById("preview");
const sizeInfo = document.getElementById("sizeInfo");
const downloadBtn = document.getElementById("downloadBtn");

/* ================================
   Click Handler
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
      // UX note (no popup)
      if (file.type === "image/png") {
        formatNote.style.display = "block";
      } else {
        formatNote.style.display = "none";
      }

      compressImage(img, targetKB);
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
});

/* ================================
   Core Compression Logic
   ================================ */
function compressImage(img, targetKB) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  let quality = 0.9;
  let compressedDataUrl;

  // Iterative compression loop
  do {
    compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
    quality -= 0.05;
  } while (compressedDataUrl.length / 1024 > targetKB && quality > 0.1);

  // Accurate size calculation
  const blob = dataURLtoBlob(compressedDataUrl);
  const finalSizeKB = Math.round(blob.size / 1024);

  // UI updates
  preview.src = compressedDataUrl;
  downloadBtn.href = compressedDataUrl;
  downloadBtn.download = "compressed.jpg";

  if (finalSizeKB > targetKB) {
    sizeInfo.innerText =
      `Final size: ${finalSizeKB} KB (Target size not reachable without heavy quality loss)`;
  } else {
    sizeInfo.innerText = `Final size: ${finalSizeKB} KB`;
  }

  result.classList.remove("hidden");
}
