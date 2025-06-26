```vue
<template>
  <div></div>
</template>

<script>
import Swal from 'sweetalert2'

export default {
  name: 'ModalEditProduct',
  props: {
    categories: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      thumbnailFile: null,
      thumbnailPreviewUrl: 'https://placehold.co/1000x1000',
    }
  },
  methods: {
    open(product) {
      if (!this.categories || this.categories.length === 0) {
        Swal.fire({
          title: 'Error!',
          text: 'Kategori belum tersedia. Silakan coba lagi.',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        })
        return
      }

      const productForm = {
        id: product.id,
        category_id: product.category_id || this.categories[0]?.id || 0,
        name: product.name || '',
        description: product.description || '',
        unit: product.unit || 'pack',
        is_publish: product.status === 'active' ? 1 : 0,
        thumbnail: null,
        thumbnail_url: product.thumbnail_url || 'https://placehold.co/1000x1000',
        images: product.images || [],
        product_variants: product.variations || [],
        product_finishing: product.additionalOptions || [],
      }

      this.thumbnailFile = null
      this.thumbnailPreviewUrl = productForm.thumbnail_url + `?t=${new Date().getTime()}`

      this.showProductModal('Edit Produk', productForm)
    },
    showProductModal(title, productForm) {
      let variationsHtml = this.generateVariationsHtml(productForm.product_variants)
      let finishingHtml = this.generateFinishingHtml(productForm.product_finishing)
      let imagesHtml = this.generateImagesHtml(productForm.images)

      Swal.fire({
        title: `<h3 class="text-lg font-bold">${title}</h3>`,
        html: `
          <form id="productForm" class="text-left form-compact">
            <div class="mb-4">
              <label class="block text-gray-700 font-medium text-sm mb-1">Kategori</label>
              <select id="category_id" class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all">
                ${
                  this.categories.length > 0
                    ? this.categories
                        .map(
                          (cat) =>
                            `<option value="${cat.id}" ${
                              productForm.category_id === cat.id ? 'selected' : ''
                            }>${cat.name}</option>`,
                        )
                        .join('')
                    : '<option value="">Tidak ada kategori tersedia</option>'
                }
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 font-medium text-sm mb-1">Nama Produk</label>
              <input
                type="text"
                id="productName"
                placeholder="Masukkan nama produk"
                class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                value="${productForm.name || ''}"
              >
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 font-medium text-sm mb-1">Deskripsi</label>
              <textarea
                id="description"
                rows="2"
                placeholder="Masukkan deskripsi produk"
                class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              >${productForm.description || ''}</textarea>
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 font-medium text-sm mb-1">Unit</label>
              <input
                type="text"
                id="unit"
                placeholder="Contoh: pack, unit"
                class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                value="${productForm.unit || 'pack'}"
              >
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 font-medium text-sm mb-1">Thumbnail Produk</label>
              <div class="flex items-center gap-4">
                <img
                  id="thumbnailPreview"
                  src="${this.thumbnailPreviewUrl}"
                  alt="Thumbnail Preview"
                  class="w-20 h-20 object-cover rounded-lg"
                  onerror="this.src='https://placehold.co/1000x1000'"
                >
                <input
                  type="file"
                  id="thumbnail"
                  accept="image/jpeg,image/png,image/jpg"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                >
              </div>
            </div>

            <div class="mb-5">
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-center mb-3">
                  <label class="block text-gray-700 font-medium text-sm">Gambar Produk</label>
                  <button
                    type="button"
                    id="addImageBtn"
                    class="bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 px-3 rounded-lg flex items-center transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Gambar
                  </button>
                </div>
                <div id="imagesContainer" class="images-container max-h-56 overflow-y-auto pr-2">
                  ${imagesHtml}
                </div>
                <small class="text-gray-600 text-xs block mt-2">Tambahkan atau edit gambar tambahan untuk produk.</small>
              </div>
            </div>

            <div class="mb-5">
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-center mb-3">
                  <label class="block text-gray-700 font-medium text-sm">Variasi Produk</label>
                  <button
                    type="button"
                    id="addVariationBtn"
                    class="bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 px-3 rounded-lg flex items-center transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Variasi
                  </button>
                </div>
                <div id="variationsContainer" class="variations-container max-h-72 overflow-y-auto pr-2">
                  ${variationsHtml}
                </div>
                <small class="text-gray-600 text-xs block mt-2">Pilih satu variasi sebagai default.</small>
              </div>
            </div>

            <div class="mb-4">
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-center mb-3">
                  <label class="block text-gray-700 font-medium text-sm">Opsi Finishing</label>
                  <button
                    type="button"
                    id="addFinishingBtn"
                    class="bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 px-3 rounded-lg flex items-center transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Finishing
                  </button>
                </div>
                <div id="finishingContainer" class="finishing-container max-h-56 overflow-y-auto pr-2">
                  ${finishingHtml}
                </div>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 font-medium text-sm mb-1">Status</label>
              <select id="is_publish" class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all">
                <option value="1" ${productForm.is_publish === 1 ? 'selected' : ''}>Aktif</option>
                <option value="0" ${productForm.is_publish === 0 ? 'selected' : ''}>Nonaktif</option>
              </select>
            </div>
          </form>
        `,
        showCancelButton: true,
        cancelButtonText: 'Batal',
        confirmButtonText: 'Simpan',
        focusConfirm: false,
        width: '650px',
        maxWidth: '750px',
        buttonsStyling: false,
        customClass: {
          container: 'swal-container',
          popup: 'swal-modal-popup rounded-lg',
          htmlContainer: 'pb-2 px-1',
          confirmButton:
            'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
          cancelButton:
            'bg-gray-300 text-gray-700 px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
          actions: 'flex justify-center space-x-6',
        },
        didOpen: () => {
          this.setupVariationAndFinishingButtons()
          this.setupImageButtons()
          this.setupThumbnailPreview()
          const modalContent = document.querySelector('.swal2-content')
          if (modalContent) {
            modalContent.style.maxHeight = '70vh'
            modalContent.style.overflowY = 'auto'
            modalContent.style.overflowX = 'hidden'
          }

          const styleElement = document.createElement('style')
          styleElement.textContent = `
            .swal2-content::-webkit-scrollbar {
              width: 6px;
            }
            .swal2-content::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 10px;
            }
            .swal2-content::-webkit-scrollbar-thumb {
              background: #dc2626;
              border-radius: 10px;
            }
            .swal2-content::-webkit-scrollbar-thumb:hover {
              background: #b91c1c;
            }
          `
          document.head.appendChild(styleElement)
        },
        preConfirm: () => {
          const category_id = parseInt(document.getElementById('category_id').value)
          const name = document.getElementById('productName').value
          const description = document.getElementById('description').value
          const unit = document.getElementById('unit').value
          const is_publish = parseInt(document.getElementById('is_publish').value)
          const thumbnail = this.thumbnailFile

          if (thumbnail) {
            if (thumbnail.size > 2 * 1024 * 1024) {
              Swal.showValidationMessage('Ukuran thumbnail tidak boleh melebihi 2MB')
              return false
            }
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(thumbnail.type)) {
              Swal.showValidationMessage('Hanya file JPEG, PNG, atau JPG yang diizinkan')
              return false
            }
          }

          const images = Array.from(
            document.getElementById('imagesContainer').querySelectorAll('.image-box'),
          )
            .map((box, index) => {
              const fileInput = box.querySelector('.image-file')
              const id = box.dataset.id ? parseInt(box.dataset.id) : null
              return {
                file: fileInput.files[0],
                id: id,
                alt_text: `Image ${index + 1}`,
                is_primary: index === 0 ? 1 : 0,
                sort_order: index + 1,
              }
            })
            .filter((item) => item.file || item.id)

          if (!category_id) {
            Swal.showValidationMessage('Kategori harus dipilih')
            return false
          }

          const variationBoxes = document.querySelectorAll('.variation-box:not(.finishing-box)')
          let hasStock = false
          let hasDefaultVariation = false
          let invalidWeight = false

          if (variationBoxes.length === 0) {
            Swal.showValidationMessage('Produk harus memiliki minimal satu variasi')
            return false
          }

          const variations = []
          variationBoxes.forEach((box, index) => {
            const nameInput = box.querySelector('.variation-name')
            const priceInput = box.querySelector('.variation-price')
            const stockInput = box.querySelector('.variation-stock')
            const weightInput = box.querySelector('.variation-weight')
            const isDefault = box.querySelector('.variation-default')?.checked
            const id = box.dataset.id ? parseInt(box.dataset.id) : null

            if (nameInput && nameInput.value) {
              const stock = parseInt(stockInput.value) || 0
              const weight = parseFloat(weightInput.value) || 0

              if (stock > 0) hasStock = true
              if (isDefault) hasDefaultVariation = true
              if (weight <= 0) invalidWeight = true

              console.log(`Variation ${nameInput.value} is_default: ${isDefault ? 1 : 0}`) // Debug log

              variations.push({
                id: id,
                name: nameInput.value,
                price: parseFloat(priceInput.value) || 0,
                stock: stock,
                weight: weight,
                is_default: isDefault ? 1 : 0,
              })
            }
          })

          if (!hasStock) {
            Swal.showValidationMessage('Setidaknya satu variasi harus memiliki stok')
            return false
          }

          if (!hasDefaultVariation) {
            Swal.showValidationMessage('Pilih satu variasi sebagai default')
            return false
          }

          if (invalidWeight) {
            Swal.showValidationMessage('Berat produk harus lebih dari 0 pada setiap variasi')
            return false
          }

          const finishings = []
          document.querySelectorAll('.finishing-box').forEach((box, index) => {
            const nameInput = box.querySelector('.finishing-name')
            const priceInput = box.querySelector('.finishing-price')
            const colorCodeInput = box.querySelector('.finishing-color-code')
            const id = box.dataset.id ? parseInt(box.dataset.id) : null
            if (nameInput && nameInput.value && priceInput && priceInput.value) {
              finishings.push({
                id: id,
                name: nameInput.value,
                price: parseFloat(priceInput.value) || 0,
                color_code: colorCodeInput.value || '#000000',
              })
            }
          })

          const product = {
            id: productForm.id,
            category_id,
            name,
            description,
            unit,
            status: is_publish ? 'active' : 'inactive',
            thumbnail,
            images,
            variations,
            product_finishing: finishings,
          }

          return product
        },
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          this.$emit('save-product', result.value)
        }
      })
    },
    setupThumbnailPreview() {
      const thumbnailInput = document.getElementById('thumbnail')
      const thumbnailPreview = document.getElementById('thumbnailPreview')
      if (thumbnailInput && thumbnailPreview) {
        thumbnailInput.addEventListener('change', (event) => {
          const file = event.target.files[0]
          if (file) {
            if (file.size > 2 * 1024 * 1024) {
              Swal.fire({
                title: 'Error!',
                text: 'Ukuran thumbnail tidak boleh melebihi 2MB',
                icon: 'error',
                timer: 1500,
                showConfirmButton: false,
              })
              thumbnailInput.value = ''
              this.thumbnailFile = null
              this.thumbnailPreviewUrl = 'https://placehold.co/1000x1000'
              thumbnailPreview.src = this.thumbnailPreviewUrl
              return
            }
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
              Swal.fire({
                title: 'Error!',
                text: 'Hanya file JPEG, PNG, atau JPG yang diizinkan',
                icon: 'error',
                timer: 1500,
                showConfirmButton: false,
              })
              thumbnailInput.value = ''
              this.thumbnailFile = null
              this.thumbnailPreviewUrl = 'https://placehold.co/1000x1000'
              thumbnailPreview.src = this.thumbnailPreviewUrl
              return
            }
            this.thumbnailFile = file
            const reader = new FileReader()
            reader.onload = (e) => {
              this.thumbnailPreviewUrl = e.target.result
              thumbnailPreview.src = e.target.result
              Swal.fire({
                title: 'Berhasil!',
                text: 'Thumbnail berhasil dipilih',
                icon: 'success',
                timer: 1000,
                showConfirmButton: false,
              })
            }
            reader.readAsDataURL(file)
          } else {
            this.thumbnailFile = null
            this.thumbnailPreviewUrl = productForm.thumbnail_url || 'https://placehold.co/1000x1000'
            thumbnailPreview.src = this.thumbnailPreviewUrl
          }
        })
      }
    },
    generateVariationsHtml(variations = []) {
      if (!variations || variations.length === 0) {
        return '<div class="text-gray-600 text-sm italic">Belum ada variasi. Klik tombol "Tambah Variasi" untuk menambahkan.</div>'
      }

      return variations
        .map((variation, index) => this.generateVariationBox(variation, index))
        .join('')
    },
    generateVariationBox(
      variation = {
        id: null,
        name: '',
        price: 0,
        stock: 0,
        weight: 0,
        is_default: false,
      },
      index,
    ) {
      return `
        <div class="variation-box bg-white shadow-sm border border-red-100 rounded-lg p-3 mb-3" data-index="${index}" data-id="${variation.id || ''}">
          <div class="close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-10 sm:gap-3">
            <div class="col-span-2 sm:col-span-4">
              <label class="block text-gray-700 text-xs mb-1">Nama Variasi</label>
              <input
                type="text"
                class="variation-name w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Contoh: 16GB RAM - 512GB SSD"
                value="${variation.name || ''}"
              >
            </div>
            <div class="col-span-1 sm:col-span-2">
              <label class="block text-gray-700 text-xs mb-1">Harga (Rp)</label>
              <input
                type="number"
                class="variation-price w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:ring-2 focus:border-red-500"
                placeholder="Harga variasi"
                value="${variation.price || ''}"
              >
            </div>
            <div class="col-span-1 sm:col-span-2">
              <label class="block text-gray-700 text-xs mb-1">Stok</label>
              <input
                type="number"
                class="variation-stock w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="0"
                value="${variation.stock || 0}"
              >
            </div>
            <div class="col-span-1 sm:col-span-2">
              <label class="block text-gray-700 text-xs mb-1">Berat (gram)</label>
              <input
                type="number"
                class="variation-weight w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="0"
                value="${variation.weight || 0}"
              >
            </div>
            <div class="col-span-2 sm:col-span-2 flex items-end pb-2">
              <label class="inline-flex items-center">
                <input
                  type="radio"
                  name="default-variation"
                  class="variation-default form-radio text-red-600"
                  ${variation.is_default ? 'checked' : ''}
                  onchange="window.handleDefaultVariationChange(this)"
                >
                <span class="ml-1 text-xs">Default</span>
              </label>
            </div>
          </div>
        </div>
      `
    },
    generateFinishingHtml(finishings = []) {
      if (!finishings || finishings.length === 0) {
        return '<div class="text-gray-600 text-sm italic">Belum ada finishing. Klik tombol "Tambah Finishing" untuk menambahkan.</div>'
      }

      return finishings.map((fin, index) => this.generateFinishingBox(fin, index)).join('')
    },
    generateFinishingBox(
      finishing = { id: null, name: '', price: 0, color_code: '#000000' },
      index,
    ) {
      return `
        <div class="finishing-box bg-white shadow-sm border border-blue-100 rounded-lg p-3 mb-3" data-index="${index}" data-id="${finishing.id || ''}">
          <div class="close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:gap-3">
            <div class="col-span-1 sm:col-span-4">
              <label class="block text-gray-700 text-xs mb-1">Nama Finishing</label>
              <input
                type="text"
                class="finishing-name w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contoh: Matte Black"
                value="${finishing.name || ''}"
              >
            </div>
            <div class="col-span-1 sm:col-span-4">
              <label class="block text-gray-700 text-xs mb-1">Harga Tambahan (Rp)</label>
              <input
                type="number"
                class="finishing-price w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                value="${finishing.price || ''}"
              >
            </div>
            <div class="col-span-1 sm:col-span-4">
              <label class="block text-gray-700 text-xs mb-1">Kode Warna</label>
              <input
                type="text"
                class="finishing-color-code w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contoh: #000000"
                value="${finishing.color_code || '#000000'}"
              >
            </div>
          </div>
        </div>
      `
    },
    generateImagesHtml(images = []) {
      if (!images || images.length === 0) {
        return '<div class="text-gray-600 text-sm italic">Belum ada gambar. Klik tombol "Tambah Gambar" untuk menambahkan.</div>'
      }

      return images.map((image, index) => this.generateImageBox(image, index)).join('')
    },
    generateImageBox(image = { id: null, image_url: 'https://placehold.co/1000x1000' }, index) {
      return `
        <div class="image-box bg-white shadow-sm border border-red-100 rounded-lg p-3 mb-3" data-index="${index}" data-id="${image.id || ''}">
          <div class="close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div class="grid grid-cols-1 gap-2">
            <div class="col-span-1 flex items-center gap-4">
              <img
                src="${image.image_url}"
                alt="Image Preview ${index + 1}"
                class="w-20 h-20 object-cover rounded-lg"
                onerror="this.src='https://placehold.co/1000x1000'"
              >
              <input
                type="file"
                class="image-file w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                accept="image/*"
              >
            </div>
          </div>
        </div>
      `
    },
    setupVariationAndFinishingButtons() {
      window.handleDefaultVariationChange = (radio) => {
        const allRadios = document.querySelectorAll('.variation-default')
        allRadios.forEach((r) => {
          if (r !== radio) r.checked = false
        })
        console.log(
          'Default changed to:',
          radio.closest('.variation-box').querySelector('.variation-name').value,
        )
      }

      const addVariationBtn = document.getElementById('addVariationBtn')
      if (addVariationBtn) {
        addVariationBtn.addEventListener('click', () => {
          const container = document.getElementById('variationsContainer')
          const variationsCount = container.querySelectorAll('.variation-box').length

          if (variationsCount === 0) {
            container.innerHTML = ''
          }

          const newBox = document.createElement('div')
          const isDefault = variationsCount === 0
          newBox.innerHTML = this.generateVariationBox({ is_default: isDefault }, variationsCount)
          container.appendChild(newBox.firstElementChild)

          this.setupCloseButtons()

          document.querySelectorAll('.variation-default').forEach((radio) => {
            radio.addEventListener('change', () => window.handleDefaultVariationChange(radio))
          })
        })
      }

      const addFinishingBtn = document.getElementById('addFinishingBtn')
      if (addFinishingBtn) {
        addFinishingBtn.addEventListener('click', () => {
          const container = document.getElementById('finishingContainer')
          const finishingCount = container.querySelectorAll('.finishing-box').length

          if (finishingCount === 0) {
            container.innerHTML = ''
          }

          const newBox = document.createElement('div')
          newBox.innerHTML = this.generateFinishingBox({}, finishingCount)
          container.appendChild(newBox.firstElementChild)

          this.setupCloseButtons()
        })
      }

      this.setupCloseButtons()
    },
    setupImageButtons() {
      const addImageBtn = document.getElementById('addImageBtn')
      if (addImageBtn) {
        addImageBtn.addEventListener('click', () => {
          const container = document.getElementById('imagesContainer')
          const imagesCount = container.querySelectorAll('.image-box').length

          if (imagesCount === 0) {
            container.innerHTML = ''
          }

          const newBox = document.createElement('div')
          newBox.innerHTML = this.generateImageBox({}, imagesCount)
          container.appendChild(newBox.firstElementChild)

          this.setupCloseButtons()
        })
      }

      this.setupImagePreviews()
    },
    setupImagePreviews() {
      const imageInputs = document.querySelectorAll('.image-file')
      imageInputs.forEach((input, index) => {
        input.addEventListener('change', (event) => {
          const file = event.target.files[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const imgElement = input.parentElement.querySelector('img')
              if (imgElement) {
                imgElement.src = e.target.result
              }
            }
            reader.readAsDataURL(file)
          }
        })
      })
    },
    setupCloseButtons() {
      document.querySelectorAll('.close-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const box = e.target.closest('.variation-box, .finishing-box, .image-box')
          if (box) {
            const isDefault = box.querySelector('.variation-default')?.checked
            if (isDefault) {
              const otherVariations = document.querySelectorAll(
                '.variation-box:not(.finishing-box)',
              )
              if (otherVariations.length > 1) {
                for (let i = 0; i < otherVariations.length; i++) {
                  if (otherVariations[i] !== box) {
                    otherVariations[i].querySelector('.variation-default').checked = true
                    break
                  }
                }
              }
            }

            box.remove()

            const varContainer = document.getElementById('variationsContainer')
            if (varContainer && varContainer.children.length === 0) {
              varContainer.innerHTML =
                '<div class="text-gray-600 text-sm italic">Belum ada variasi. Klik tombol "Tambah Variasi" untuk menambahkan.</div>'
            }

            const finContainer = document.getElementById('finishingContainer')
            if (finContainer && finContainer.children.length === 0) {
              finContainer.innerHTML =
                '<div class="text-gray-600 text-sm italic">Belum ada finishing. Klik tombol "Tambah Finishing" untuk menambahkan.</div>'
            }

            const imgContainer = document.getElementById('imagesContainer')
            if (imgContainer && imgContainer.children.length === 0) {
              imgContainer.innerHTML =
                '<div class="text-gray-600 text-sm italic">Belum ada gambar. Klik tombol "Tambah Gambar" untuk menambahkan.</div>'
            }
          }
        })
      })
    },
    async handleUpdateProduct(updatedProduct) {
      this.isLoading = true
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Authentication token is missing')
        }
        const originalProduct = this.products.find((p) => p.id === updatedProduct.id)
        if (!originalProduct) {
          throw new Error('Original product not found')
        }
        const formData = new FormData()
        // Product data
        formData.append('product[id]', updatedProduct.id)
        formData.append('product[name]', updatedProduct.name?.trim() || originalProduct.name)
        formData.append(
          'product[description]',
          updatedProduct.description?.trim() || originalProduct.description,
        )
        formData.append('product[unit]', updatedProduct.unit || originalProduct.unit || 'pack')
        formData.append('product[is_publish]', updatedProduct.status === 'active' ? 1 : 0)
        formData.append(
          'product[category_id]',
          updatedProduct.category_id || originalProduct.category_id,
        )
        // Thumbnail
        if (updatedProduct.thumbnail instanceof File) {
          console.log(
            'Appending thumbnail:',
            updatedProduct.thumbnail.name,
            updatedProduct.thumbnail.size,
          )
          formData.append('thumbnail', updatedProduct.thumbnail)
        } else {
          console.log('No new thumbnail provided')
        }
        // Variants
        const originalVariants = originalProduct.variations || []
        const updatedVariants = updatedProduct.variations || []
        // Validate exactly one default variant
        const defaultVariants = updatedVariants.filter((v) => v.is_default)
        if (defaultVariants.length !== 1) {
          throw new Error('Exactly one variant must be set as default')
        }
        // Add new variants
        updatedVariants
          .filter((v) => !v.id)
          .forEach((variant, index) => {
            formData.append(`variants[add][${index}][name]`, variant.name?.trim() || '')
            formData.append(`variants[add][${index}][price]`, parseFloat(variant.price) || 0)
            formData.append(`variants[add][${index}][weight]`, parseFloat(variant.weight) || 0)
            formData.append(`variants[add][${index}][stock]`, parseInt(variant.stock) || 0)
            formData.append(`variants[add][${index}][is_default]`, variant.is_default ? 1 : 0)
            console.log(`Adding variant ${index}: is_default=${variant.is_default ? 1 : 0}`)
          })
        // Update existing variants
        updatedVariants
          .filter((variant) => variant.id)
          .forEach((variant, index) => {
            const originalVariant = originalVariants.find((v) => v.id === variant.id) || {}
            formData.append(`variants[update][${index}][id]`, variant.id)
            formData.append(
              `variants[update][${index}][name]`,
              variant.name?.trim() || originalVariant.name || '',
            )
            formData.append(
              `variants[update][${index}][price]`,
              parseFloat(variant.price) || originalVariant.price || 0,
            )
            formData.append(
              `variants[update][${index}][weight]`,
              parseFloat(variant.weight) || originalVariant.weight || 0,
            )
            formData.append(
              `variants[update][${index}][stock]`,
              parseInt(variant.stock) || originalVariant.stock || 0,
            )
            formData.append(`variants[update][${index}][is_default]`, variant.is_default ? 1 : 0)
            console.log(`Updating variant ${index}: is_default=${variant.is_default ? 1 : 0}`)
          })
        // Delete variants
        const deletedVariantIds = originalVariants
          .filter((original) => !updatedVariants.some((v) => v.id === original.id))
          .map((variant) => variant.id)
        deletedVariantIds.forEach((id) => {
          formData.append('variants[delete][]', id)
        })
        // Finishings
        const originalFinishings = originalProduct.additionalOptions || []
        const updatedFinishings = updatedProduct.product_finishing || []
        // Add new finishings
        updatedFinishings
          .filter((f) => !f.id)
          .forEach((finishing, index) => {
            if (finishing.name) {
              formData.append(`finishings[add][${index}][name]`, finishing.name?.trim())
              formData.append(`finishings[add][${index}][price]`, parseFloat(finishing.price) || 0)
              if (finishing.color_code) {
                formData.append(`finishings[add][${index}][color_code]`, finishing.color_code)
              }
            }
          })
        // Update existing finishings
        updatedFinishings
          .filter((finishing) => finishing.id)
          .forEach((finishing, index) => {
            const originalFinishing = originalFinishings.find((f) => f.id === finishing.id) || {}
            formData.append(`finishings[update][${index}][id]`, finishing.id)
            formData.append(
              `finishings[update][${index}][name]`,
              finishing.name?.trim() || originalFinishing.name || '',
            )
            formData.append(
              `finishings[update][${index}][price]`,
              parseFloat(finishing.price) || originalFinishing.price || 0,
            )
            if (finishing.color_code) {
              formData.append(
                `finishings[update][${index}][color_code]`,
                finishing.color_code || originalFinishing.color_code || '#000000',
              )
            }
          })
        // Delete finishings
        const deletedFinishingIds = originalFinishings
          .filter((original) => !updatedFinishings.some((f) => f.id === original.id))
          .map((finishing) => finishing.id)
        deletedFinishingIds.forEach((id) => {
          formData.append('finishings[delete][]', id)
        })
        // Images
        const originalImages = originalProduct.images || []
        const newImages = updatedProduct.images || []
        // Add new images
        newImages
          .filter((img) => img.file instanceof File)
          .forEach((image, index) => {
            formData.append(`images[add][${index}][image]`, image.file)
            formData.append(
              `images[add][${index}][alt_text]`,
              image.alt_text || `Image ${index + 1}`,
            )
            formData.append(`images[add][${index}][is_primary]`, image.is_primary ? 1 : 0)
            formData.append(`images[add][${index}][sort_order]`, image.sort_order || index + 1)
          })
        // Update existing images
        newImages
          .filter((img) => img.id)
          .forEach((img, index) => {
            formData.append(`images[update][${index}][id]`, img.id)
            formData.append(`images[update][${index}][is_primary]`, img.is_primary ? 1 : 0)
            formData.append(`images[update][${index}][sort_order]`, img.sort_order || index + 1)
            if (img.file instanceof File) {
              formData.append(`images[update][${index}][image]`, img.file)
            }
          })
        // Delete images
        const deletedImageIds = originalImages
          .filter((originalImg) => !newImages.some((img) => img.id === originalImg.id))
          .map((image) => image.id)
        deletedImageIds.forEach((id) => {
          formData.append('images[delete][]', id)
        })
        // Validation
        if (!updatedProduct.name || !updatedProduct.description || !updatedProduct.unit) {
          throw new Error('Nama, deskripsi, dan unit wajib diisi')
        }
        if (updatedVariants.length === 0) {
          throw new Error('Produk harus memiliki minimal satu variasi')
        }
        // Debug FormData
        for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value instanceof File ? value.name : value}`)
        }
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/seller/product/update/bulk`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          },
        )
        console.log('Backend thumbnail_url:', response.data.data.product.thumbnail_url)
        // Update local state
        const index = this.products.findIndex((p) => p.id === updatedProduct.id)
        if (index !== -1) {
          this.products.splice(index, 1, {
            ...response.data.data.product,
            category: this.getCategoryName(response.data.data.product.category_id),
            category_id: response.data.data.product.category_id,
            status: response.data.data.product.is_publish ? 'active' : 'inactive',
            stock_total: parseInt(response.data.data.product.stock_total) || 0,
            unit: response.data.data.product.unit || 'pack',
            weight: parseFloat(response.data.data.product.weight) || 0,
            thumbnail_url:
              (response.data.data.product.thumbnail_url || 'https://placehold.co/1000x1000') +
              `?t=${new Date().getTime()}`,
            images:
              response.data.data.images?.map((img) => ({
                id: img.id,
                image_url: img.image_url,
                alt_text: img.alt_text,
                is_primary: img.is_primary,
                sort_order: img.sort_order,
              })) || [],
            variant_count: response.data.data.variants?.length || 0,
            finishing_count: response.data.data.finishings?.length || 0,
            variations:
              response.data.data.variants?.map((v) => ({
                id: v.id,
                name: v.name,
                price: parseFloat(v.price) || 0,
                stock: parseInt(v.stock) || 0,
                weight: parseFloat(v.weight) || 0,
                is_default: v.is_default || 0,
              })) || [],
            additionalOptions:
              response.data.data.finishings?.map((f) => ({
                id: f.id,
                name: f.name,
                price: parseFloat(f.price) || 0,
                color_code: f.color_code || '#000000',
              })) || [],
          })
          this.showSuccessMessage('Produk berhasil diperbarui')
        }
      } catch (error) {
        console.error('Update Product Error:', error.response?.data)
        const message = error.response?.data?.message || error.message || 'Gagal memperbarui produk'
        Swal.fire({
          title: 'Error!',
          text: message.includes('thumbnail') ? 'Gagal mengunggah thumbnail: ' + message : message,
          icon: 'error',
          timer: 2000,
          showConfirmButton: false,
        })
      } finally {
        this.isLoading = false
        this.fetchProducts()
      }
    },
    showSuccessMessage(message) {
      Swal.fire({
        title: 'Berhasil!',
        text: message,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    },
    getCategoryName(categoryId) {
      const category = this.categories.find((cat) => cat.id === categoryId)
      return category ? category.name : ''
    },
  },
}
</script>

<style scoped>
.variation-box,
.finishing-box,
.image-box {
  position: relative;
  transition: all 0.2s;
}

.variation-box:hover,
.finishing-box:hover,
.image-box:hover {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  background-color: #f3f4f6;
  border-radius: 50%;
  padding: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #ef4444;
  background-color: #fee2e2;
  transform: scale(1.1);
}

.variations-container::-webkit-scrollbar,
.finishing-container::-webkit-scrollbar,
.images-container::-webkit-scrollbar {
  width: 6px;
}

.variations-container::-webkit-scrollbar-track,
.finishing-container::-webkit-scrollbar-track,
.images-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.variations-container::-webkit-scrollbar-thumb {
  background: #dc2626;
  border-radius: 10px;
}

.finishing-container::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 10px;
}

.images-container::-webkit-scrollbar-thumb {
  background: #dc2626;
  border-radius: 10px;
}

.variations-container::-webkit-scrollbar-thumb:hover {
  background: #b91c1c;
}

.finishing-container::-webkit-scrollbar-thumb:hover {
  background: #2563eb;
}

.images-container::-webkit-scrollbar-thumb:hover {
  background: #b91c1c;
}

.form-compact input,
.form-compact select,
.form-compact textarea {
  font-size: 0.875rem;
  padding: 0.5rem;
}

.form-compact label {
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}
</style>
