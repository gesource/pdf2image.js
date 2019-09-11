<template>
  <div id="app">
    <div>
      <label>
        PDFファイルを選択
        <input type="file" accept="application/pdf" v-on:change="onFileChange">
      </label>
    </div>
    <div v-show="isLoading">読込中</div>
    <div v-for="image in images" v-bind:key="image">
      <img v-bind:src="image">
    </div>
  </div>
</template>

<script>
import Pdf2Image from './pdf2image';

export default {
  name: 'app',
  data() {
    return {
      isLoading: false,
      images: [],
    };
  },
  methods: {
    async onFileChange(e) {
      this.isLoading = true;
      try {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        const pdf2image = await Pdf2Image.open(url);
        // const images = await pdf2image.getAllImageDataUrl({scale:2.0});
        const images = await pdf2image.getAllImageDataUrl({ width: 400, height: 400 });
        this.images = images;
      } catch (error) {
        console.log(error);
      }
      this.isLoading = false;
    },
  },
};
</script>
