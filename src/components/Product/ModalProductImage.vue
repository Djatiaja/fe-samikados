<template>
  <div>
    <!-- Invisible button that can be targeted programmatically -->
    <button ref="modalTrigger" class="hidden" @click="open"></button>
  </div>
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
        Swal.fire({
          title: product.name,
          text: 'No images available for this product',
          icon: 'info',
          confirmButtonText: 'Close',
          confirmButtonColor: '#3085d6',
        })
        return
      }

      const renderSlider = () => {
        const images = product.images
        const currentImage = images[this.currentImageIndex]
        const totalImages = images.length

        let dotsHtml = ''
        for (let i = 0; i < totalImages; i++) {
          dotsHtml += `
            <span
              class="dot ${i === this.currentImageIndex ? 'active' : ''}"
              onclick="window.setCurrentImage(${i})"
            ></span>
          `
        }

        return `
          <div class="image-slider-container">
            <div class="image-wrapper">
              <img
                src="${currentImage}"
                alt="${product.name} - Image ${this.currentImageIndex + 1}"
                class="product-image"
                onerror="this.onerror=null; this.src='https://via.placeholder.com/400x400?text=Image+Not+Found';"
              >

              ${
                totalImages > 1
                  ? `
                <div class="slider-nav">
                  <button
                    class="nav-btn prev-btn ${this.currentImageIndex === 0 ? 'disabled' : ''}"
                    onclick="window.prevImage()"
                    ${this.currentImageIndex === 0 ? 'disabled' : ''}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>

                  <button
                    class="nav-btn next-btn ${this.currentImageIndex === totalImages - 1 ? 'disabled' : ''}"
                    onclick="window.nextImage()"
                    ${this.currentImageIndex === totalImages - 1 ? 'disabled' : ''}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              `
                  : ''
              }
            </div>

            ${
              totalImages > 1
                ? `
              <div class="slider-dots-container">
                <div class="slider-dots">${dotsHtml}</div>
                <div class="image-counter">Image ${this.currentImageIndex + 1} of ${totalImages}</div>
              </div>

                              ${
                                images.length <= 8
                                  ? `
                <div class="thumbnails-container">
                  ${images
                    .map(
                      (img, idx) => `
                    <div
                      class="thumbnail ${idx === this.currentImageIndex ? 'active' : ''}"
                      onclick="window.setCurrentImage(${idx})"
                    >
                      <img
                        src="${img}"
                        alt="Thumbnail ${idx + 1}"
                        onerror="this.onerror=null; this.src='https://via.placeholder.com/60x60?text=Thumb';"
                      >
                    </div>
                  `,
                    )
                    .join('')}
                </div>
                `
                                  : ''
                              }
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

      // Add keyboard navigation
      const handleKeydown = (e) => {
        if (e.key === 'ArrowLeft') window.prevImage()
        if (e.key === 'ArrowRight') window.nextImage()
        if (e.key === 'Escape') Swal.close()
      }

      document.addEventListener('keydown', handleKeydown)

      Swal.fire({
        title: product.name,
        html: renderSlider(),
        showCancelButton: false,
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#ff0000',
        buttonsStyling: false,
        width: '40%',
        maxWidth: '600px',
        padding: '0.75rem',
        customClass: {
          confirmButton: 'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base',
          container: 'product-modal-container',
          popup: 'product-modal-popup',
          title: 'product-modal-title',
          htmlContainer: 'product-modal-content',
        },
        didOpen: () => {
          // Init swipe detection for mobile
          let touchstartX = 0
          let touchendX = 0
          const slider = document.querySelector('.image-slider-container')

          slider.addEventListener('touchstart', (e) => {
            touchstartX = e.changedTouches[0].screenX
          })

          slider.addEventListener('touchend', (e) => {
            touchendX = e.changedTouches[0].screenX
            handleSwipe()
          })

          const handleSwipe = () => {
            if (touchendX < touchstartX - 50) window.nextImage()
            if (touchendX > touchstartX + 50) window.prevImage()
          }
        },
        willClose: () => {
          document.removeEventListener('keydown', handleKeydown)
        },
      })
    },
    // Method to open modal externally
    openModal(product) {
      this.open(product)
    },
  },
}
</script>

<style scoped>
/* This style is scoped to the component */
.hidden {
  display: none;
}
</style>

<style>
/* Global styles for the SweetAlert modal */
.product-modal-container {
  z-index: 1050;
}

.product-modal-popup {
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.product-modal-content {
  padding: 0 !important;
  margin: 0 !important;
  overflow: hidden;
}

/* Image slider styles */
.image-slider-container {
  width: 100%;
  margin: 0 auto;
  padding: 0.5rem;
}

.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16/10;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: opacity 0.3s ease;
}

.slider-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
}

.nav-btn {
  width: 32px;
  height: 32px;
  background-color: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  pointer-events: auto;
  margin: 0 8px;
  color: #333;
  z-index: 10;
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.9);
  transform: scale(1.1);
}

.nav-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider-dots-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.5rem;
}

.slider-dots {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ddd;
  margin: 0 5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dot.active {
  background-color: #ff0000;
  transform: scale(1.2);
}

.image-counter {
  font-size: 0.875rem;
  color: #777;
}

.thumbnails-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  padding: 5px 0;
  scrollbar-width: thin;
  scrollbar-color: #ddd transparent;
  margin-bottom: 0.25rem;
}

.thumbnails-container::-webkit-scrollbar {
  height: 6px;
}

.thumbnails-container::-webkit-scrollbar-track {
  background: transparent;
}

.thumbnails-container::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 10px;
}

.thumbnail {
  width: 60px;
  height: 60px;
  flex: 0 0 auto;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.thumbnail:hover {
  opacity: 1;
}

.thumbnail.active {
  border-color: #ff0000;
  opacity: 1;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .image-wrapper {
    aspect-ratio: 3/2;
  }

  .nav-btn {
    width: 28px;
    height: 28px;
  }

  .thumbnail {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 480px) {
  .image-wrapper {
    aspect-ratio: 4/3;
  }

  .nav-btn {
    width: 26px;
    height: 26px;
  }

  .thumbnail {
    width: 40px;
    height: 40px;
  }

  .product-modal-title {
    font-size: 1rem;
    padding: 0.25rem 0;
  }

  .slider-dots-container {
    margin-bottom: 0.25rem;
  }

  .dot {
    width: 8px;
    height: 8px;
    margin: 0 3px;
  }
}
</style>
