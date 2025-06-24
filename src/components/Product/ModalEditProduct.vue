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
  methods: {
    open(product) {
      console.log('Opening Modal with Product:', JSON.stringify(product, null, 2)) // Debug: Detailed product data
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

      console.log('Product Form Initialized:', JSON.stringify(productForm, null, 2)) // Debug: Log form data
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
                  src="${productForm.thumbnail_url}"
                  alt="Thumbnail Preview"
                  class="w-20 h-20 object-cover rounded-lg"
                  onerror="this.src='https://placehold.co/1000x1000'"
                >
                <input
                  type="file"
                  id="thumbnail"
                  accept="image/*"
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
          const thumbnailInput = document.getElementById('thumbnail')
          const thumbnail = thumbnailInput.files[0]

          console.log('Thumbnail Input Files:', thumbnailInput.files) // Debug: Log thumbnail input
          console.log('Thumbnail Selected:', thumbnail ? thumbnail.name : 'None') // Debug: Log thumbnail file

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

          console.log('Images Collected:', JSON.stringify(images, null, 2)) // Debug: Log images

          if (!category_id) {
            Swal.showValidationMessage('Kategori harus dipilih')
            return false
          }

          const variationBoxes = document.querySelectorAll('.variation-box:not(.finishing-box)')
          let hasStock = false
          let hasDefaultVariation = false
          let invalidWeight = false
          let invalidMinQty = false

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
            const minQtyInput = box.querySelector('.variation-min-qty')
            const isDefault = box.querySelector('.variation-default')?.checked
            const id = box.dataset.id ? parseInt(box.dataset.id) : null

            if (nameInput && nameInput.value) {
              const stock = parseInt(stockInput.value) || 0
              const weight = parseFloat(weightInput.value) || 0
              const minQty = parseInt(minQtyInput.value) || 1

              if (stock > 0) hasStock = true
              if (isDefault) hasDefaultVariation = true
              if (weight <= 0) invalidWeight = true
              if (minQty <= 0) invalidMinQty = true

              variations.push({
                id: id,
                name: nameInput.value,
                price: parseFloat(priceInput.value) || 0,
                stock: stock,
                weight: weight,
                min_qty: minQty,
                is_default: isDefault ? 1 : 0,
              })
            }
          })

          console.log('Variations Collected:', JSON.stringify(variations, null, 2)) // Debug: Log variations

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

          if (invalidMinQty) {
            Swal.showValidationMessage('Jumlah minimum harus lebih dari 0 pada setiap variasi')
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

          console.log('Finishings Collected:', JSON.stringify(finishings, null, 2)) // Debug: Log finishings

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

          console.log('Final Product Data:', JSON.stringify(product, null, 2)) // Debug: Log final product
          return product
        },
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          this.$emit('save-product', result.value)
        }
      })
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
        min_qty: 1,
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
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-12 sm:gap-3">
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
            <div class="col-span-1 sm:col-span-2">
              <label class="block text-gray-700 text-xs mb-1">Jumlah Minimum</label>
              <input
                type="number"
                class="variation-min-qty w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="1"
                value="${variation.min_qty || 1}"
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
      window.handleDefaultVariationChange = this.handleDefaultVariationChange

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
    setupThumbnailPreview() {
      const thumbnailInput = document.getElementById('thumbnail')
      const thumbnailPreview = document.getElementById('thumbnailPreview')
      if (thumbnailInput && thumbnailPreview) {
        thumbnailInput.addEventListener('change', (event) => {
          const file = event.target.files[0]
          console.log('Thumbnail Input Changed:', {
            file: file ? { name: file.name, size: file.size, type: file.type } : null,
          }) // Debug: Detailed thumbnail info
          if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
              thumbnailPreview.src = e.target.result
              console.log('Thumbnail Preview Updated:', e.target.result.substring(0, 50)) // Debug: Log preview data
            }
            reader.readAsDataURL(file)
          }
        })
      } else {
        console.error('Thumbnail Input or Preview Element Missing:', {
          thumbnailInput: !!thumbnailInput,
          thumbnailPreview: !!thumbnailPreview,
        }) // Debug: Log missing elements
      }
    },
    setupImagePreviews() {
      const imageInputs = document.querySelectorAll('.image-file')
      imageInputs.forEach((input, index) => {
        input.addEventListener('change', (event) => {
          const file = event.target.files[0]
          console.log(`Image Input ${index + 1} Changed:`, {
            file: file ? { name: file.name, size: file.size, type: file.type } : null,
          }) // Debug: Detailed image info
          if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const imgElement = input.parentElement.querySelector('img')
              if (imgElement) {
                imgElement.src = e.target.result
                console.log(`Image Preview ${index + 1} Updated:`, e.target.result.substring(0, 50)) // Debug
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
            console.log('Removing Box:', {
              type: box.classList.contains('variation-box')
                ? 'variation'
                : box.classList.contains('finishing-box')
                  ? 'finishing'
                  : 'image',
              id: box.dataset.id || 'new',
              index: box.dataset.index,
            }) // Debug: Log removed box details
            const isDefault = box.querySelector('.variation-default')?.checked
            if (isDefault) {
              const otherVariations = document.querySelectorAll(
                '.variation-box:not(.finishing-box)',
              )
              if (otherVariations.length > 1) {
                for (let i = 0; i < otherVariations.length; i++) {
                  if (otherVariations[i] !== box) {
                    otherVariations[i].querySelector('.variation-default').checked = true
                    console.log('Set New Default Variation:', {
                      id: otherVariations[i].dataset.id,
                      index: otherVariations[i].dataset.index,
                    }) // Debug
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
    handleDefaultVariationChange(radio) {
      console.log('Default Variation Changed:', {
        checked: radio.checked,
        id: radio.closest('.variation-box')?.dataset.id || 'new',
      }) // Debug: Log radio change
      const allRadios = document.querySelectorAll('.variation-default')
      allRadios.forEach((r) => {
        if (r !== radio) r.checked = false
      })
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
