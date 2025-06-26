<template>
  <div>
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
      productImages: [],
    }
  },
  methods: {
    open(product) {
      // Gabungkan semua gambar (thumbnail + images)
      this.productImages = []

      // Tambahkan thumbnail jika ada
      if (product.thumbnail_url) {
        this.productImages.push({
          type: 'thumbnail',
          url: product.thumbnail_url,
          title: 'Thumbnail Produk',
        })
      }

      // Tambahkan gambar produk lainnya
      if (product.images && product.images.length > 0) {
        product.images.forEach((image, index) => {
          this.productImages.push({
            type: 'gallery',
            url: image.image_url || image,
            title: `Gambar Produk ${index + 1}` + (image.is_primary ? ' (Utama)' : ''),
          })
        })
      }

      this.currentImageIndex = 0

      if (this.productImages.length === 0) {
        Swal.fire({
          title: product.name,
          text: 'Produk ini belum memiliki gambar',
          icon: 'info',
          confirmButtonText: 'Tutup',
          confirmButtonColor: '#ef4444',
        })
        return
      }

      this.showModal()
    },

    showModal() {
      const currentImage = this.productImages[this.currentImageIndex]
      const totalImages = this.productImages.length

      // Render konten modal
      const renderContent = () => {
        let dotsHtml = ''
        if (totalImages > 1) {
          dotsHtml = this.productImages
            .map(
              (_, idx) => `
            <span class="dot ${idx === this.currentImageIndex ? 'active' : ''}"
                  onclick="window.currentModal.setCurrentImage(${idx})"></span>
          `,
            )
            .join('')
        }

        let thumbnailsHtml = ''
        if (totalImages > 1 && totalImages <= 8) {
          thumbnailsHtml = `
            <div class="thumbnails-container">
              ${this.productImages
                .map(
                  (img, idx) => `
                <div class="thumbnail ${idx === this.currentImageIndex ? 'active' : ''}"
                     onclick="window.currentModal.setCurrentImage(${idx})">
                  <img src="${img.url}" alt="Thumbnail ${idx + 1}"
                       onerror="this.onerror=null; this.src='https://via.placeholder.com/60x60?text=Thumb';">
                </div>
              `,
                )
                .join('')}
            </div>
          `
        }

        return `
          <div class="image-slider-container">
            <div class="image-wrapper">
              <img src="${currentImage.url}"
                   alt="${currentImage.title}"
                   class="product-image"
                   onerror="this.onerror=null; this.src='https://via.placeholder.com/400x400?text=Image+Not+Found';">

              ${
                totalImages > 1
                  ? `
                <div class="slider-nav">
                  <button class="nav-btn prev-btn ${this.currentImageIndex === 0 ? 'disabled' : ''}"
                          onclick="window.currentModal.prevImage()"
                          ${this.currentImageIndex === 0 ? 'disabled' : ''}>
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>

                  <button class="nav-btn next-btn ${this.currentImageIndex === totalImages - 1 ? 'disabled' : ''}"
                          onclick="window.currentModal.nextImage()"
                          ${this.currentImageIndex === totalImages - 1 ? 'disabled' : ''}>
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
              <div class="slider-controls">
                <div class="slider-dots">${dotsHtml}</div>
                <div class="image-counter">Gambar ${this.currentImageIndex + 1} dari ${totalImages}</div>
              </div>
              ${thumbnailsHtml}
            `
                : ''
            }
          </div>
        `
      }

      // Simpan referensi modal di window
      window.currentModal = this

      // Tampilkan modal
      Swal.fire({
        title: this.productImages[this.currentImageIndex].title,
        html: renderContent(),
        showConfirmButton: false,
        showCloseButton: true,
        width: '600px', // Reduced width
        maxWidth: '90%', // Slightly more flexible max-width
        padding: '0.5rem', // Reduced padding
        customClass: {
          container: 'product-image-modal',
          popup: 'product-image-popup',
          title: 'product-image-title',
          htmlContainer: 'product-image-content',
          closeButton: 'product-image-close',
        },
        didOpen: () => {
          document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevImage()
            if (e.key === 'ArrowRight') this.nextImage()
            if (e.key === 'Escape') Swal.close()
          })

          // Tambahkan swipe untuk mobile
          const slider = document.querySelector('.image-slider-container')
          if (slider) {
            let touchStartX = 0
            slider.addEventListener(
              'touchstart',
              (e) => {
                touchStartX = e.changedTouches[0].screenX
              },
              { passive: true },
            )

            slider.addEventListener(
              'touchend',
              (e) => {
                const touchEndX = e.changedTouches[0].screenX
                const diff = touchStartX - touchEndX
                if (diff > 50) this.nextImage()
                if (diff < -50) this.prevImage()
              },
              { passive: true },
            )
          }
        },
        willClose: () => {
          document.removeEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevImage()
            if (e.key === 'ArrowRight') this.nextImage()
            if (e.key === 'Escape') Swal.close()
          })
          delete window.currentModal
        },
      })
    },

    prevImage() {
      if (this.currentImageIndex > 0) {
        this.currentImageIndex--
        this.updateModal()
      }
    },

    nextImage() {
      if (this.currentImageIndex < this.productImages.length - 1) {
        this.currentImageIndex++
        this.updateModal()
      }
    },

    setCurrentImage(index) {
      if (index >= 0 && index < this.productImages.length) {
        this.currentImageIndex = index
        this.updateModal()
      }
    },

    updateModal() {
      const modal = Swal.getPopup()
      if (modal) {
        const titleElement = modal.querySelector('.swal2-title')
        if (titleElement) {
          titleElement.textContent = this.productImages[this.currentImageIndex].title
        }

        const container = modal.querySelector('.swal2-html-container')
        if (container) {
          container.innerHTML = this.renderModalContent()
        }
      }
    },

    renderModalContent() {
      const currentImage = this.productImages[this.currentImageIndex]
      const totalImages = this.productImages.length

      let dotsHtml = ''
      if (totalImages > 1) {
        dotsHtml = this.productImages
          .map(
            (_, idx) => `
              <span class="dot ${idx === this.currentImageIndex ? 'active' : ''}"
                    onclick="window.currentModal.setCurrentImage(${idx})"></span>
            `,
          )
          .join('')
      }

      let thumbnailsHtml = ''
      if (totalImages > 1 && totalImages <= 8) {
        thumbnailsHtml = `
          <div class="thumbnails-container">
            ${this.productImages
              .map(
                (img, idx) => `
                  <div class="thumbnail ${idx === this.currentImageIndex ? 'active' : ''}"
                       onclick="window.currentModal.setCurrentImage(${idx})">
                    <img src="${img.url}" alt="Thumbnail ${idx + 1}"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/60x60?text=Thumb';">
                  </div>
                `,
              )
              .join('')}
          </div>
        `
      }

      return `
        <div class="image-slider-container">
          <div class="image-wrapper">
            <img src="${currentImage.url}"
                 alt="${currentImage.title}"
                 class="product-image"
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/400x400?text=Image+Not+Found';">

            ${
              totalImages > 1
                ? `
                  <div class="slider-nav">
                    <button class="nav-btn prev-btn ${this.currentImageIndex === 0 ? 'disabled' : ''}"
                            onclick="window.currentModal.prevImage()"
                            ${this.currentImageIndex === 0 ? 'disabled' : ''}>
                      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>

                    <button class="nav-btn next-btn ${this.currentImageIndex === totalImages - 1 ? 'disabled' : ''}"
                            onclick="window.currentModal.nextImage()"
                            ${this.currentImageIndex === totalImages - 1 ? 'disabled' : ''}>
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
                <div class="slider-controls">
                  <div class="slider-dots">${dotsHtml}</div>
                  <div class="image-counter">Gambar ${this.currentImageIndex + 1} dari ${totalImages}</div>
                </div>
                ${thumbnailsHtml}
              `
              : ''
          }
        </div>
      `
    },

    openModal(product) {
      this.open(product)
    },
  },
}
</script>

<style scoped>
.hidden {
  display: none;
}
</style>

<style>
.product-image-modal {
  z-index: 1060;
}

.product-image-popup {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.product-image-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
  padding: 0;
}

.product-image-content {
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.product-image-close {
  color: #666;
  font-size: 1.25rem;
  top: 8px;
  right: 8px;
}

.image-slider-container {
  width: 100%;
  margin: 0 auto;
  padding: 0.25rem;
}

.image-wrapper {
  position: relative;
  width: 100%;
  max-height: 400px; /* Reduced max height */
  aspect-ratio: 1/1;
  margin-bottom: 0.25rem;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f5f5f5;
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
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  pointer-events: auto;
  margin: 0 10px;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.95);
  transform: scale(1.05);
}

.nav-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-btn svg {
  width: 18px;
  height: 18px;
}

.slider-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0.25rem;
}

.slider-dots {
  display: flex;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ddd;
  margin: 0 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dot.active {
  background-color: #ef4444;
  transform: scale(1.2);
}

.image-counter {
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.thumbnails-container {
  display: flex;
  gap: 6px;
  padding: 6px 0;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #ddd transparent;
}

.thumbnails-container::-webkit-scrollbar {
  height: 4px;
}

.thumbnails-container::-webkit-scrollbar-track {
  background: transparent;
}

.thumbnails-container::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 4px;
}

.thumbnail {
  width: 50px;
  height: 50px;
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
  border-color: #ef4444;
  opacity: 1;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 640px) {
  .product-image-popup {
    width: 95% !important;
    max-width: 95% !important;
  }

  .image-wrapper {
    max-height: 300px; /* Smaller on mobile */
    aspect-ratio: 4/3;
  }

  .nav-btn {
    width: 32px;
    height: 32px;
    margin: 0 6px;
  }

  .thumbnail {
    width: 45px;
    height: 45px;
  }
}

@media (max-width: 480px) {
  .product-image-title {
    font-size: 1rem;
  }

  .image-wrapper {
    max-height: 250px;
    aspect-ratio: 1/1;
  }

  .nav-btn {
    width: 28px;
    height: 28px;
  }

  .thumbnail {
    width: 40px;
    height: 40px;
  }

  .dot {
    width: 6px;
    height: 6px;
    margin: 0 3px;
  }

  .image-counter {
    font-size: 0.7rem;
  }
}
</style>
