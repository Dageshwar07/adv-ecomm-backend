// imageStore.js
let imagesArr = [];

export function setImages(arr) {
  imagesArr = arr;
}

export function getImages() {
  return imagesArr;
}

export function clearImages() {
  imagesArr = [];
}
