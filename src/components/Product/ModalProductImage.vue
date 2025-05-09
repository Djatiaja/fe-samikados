<template>
  <div></div>
</template>

<script>
import Swal from 'sweetalert2'

export default {
  name: 'ModalProductImage',
  data() {
    return {
      currentImageIndex: 0,
    }
  },
  methods: {
    open(product) {
      this.currentImageIndex = 0

      if (!product.images || product.images.length === 0) {
        return
      }

      const renderSlider = () => {
        const images = product.images
        const currentImage = images[this.currentImageIndex]
        const totalImages = images.length

        let dotsHtml = ''
        for (let i = 0; i < totalImages; i++) {
          dotsHtml += `<span class="${i === this.currentImageIndex ? 'active' : ''}" onclick="window.setCurrentImage(${i})"></span>`
        }

        return `
          <div class="image-slider">
            <img src="${currentImage}" alt="${product.name} - Image ${this.currentImageIndex + 1}">
            ${
              totalImages > 1
                ? `
              <div class="slider-nav">
                <button onclick="window.prevImage()" ${this.currentImageIndex === 0 ? 'disabled' : ''}>❮</button>
                <button onclick="window.nextImage()" ${this.currentImageIndex === totalImages - 1 ? 'disabled' : ''}>❯</button>
              </div>
              <div class="slider-dots">${dotsHtml}</div>
              <div class="text-center mt-2 text-sm text-gray-500">Image ${this.currentImageIndex + 1} of ${totalImages}</div>
            `
                : ''
            }
          </div>
        `
      }

      // Define navigation functions in window scope
      window.prevImage = () => {
        if (this.currentImageIndex > 0) {
          this.currentImageIndex--
          updateSliderContent()
        }
      }

      window.nextImage = () => {
        if (this.currentImageIndex < product.images.length - 1) {
          this.currentImageIndex++
          updateSliderContent()
        }
      }

      window.setCurrentImage = (index) => {
        this.currentImageIndex = index
        updateSliderContent()
      }

      const updateSliderContent = () => {
        const container = document.querySelector('.swal2-html-container')
        if (container) {
          container.innerHTML = renderSlider()
        }
      }

      Swal.fire({
        title: product.name,
        html: renderSlider(),
        showCancelButton: false,
        confirmButtonText: 'Tutup',
        width: 'auto',
        padding: '1rem',
      })
    },
  },
}
</script>
