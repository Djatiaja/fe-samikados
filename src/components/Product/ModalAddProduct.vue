<template>
  <div></div>
</template>

<script>
import Swal from 'sweetalert2'

export default {
  name: 'ModalAddProduct',
  methods: {
    open() {
      const productForm = {
        id: null,
        category: 'Merchandise',
        name: '',
        description: '',
        stock: null,
        price: null,
        images: [],
        status: 'aktif',
        variations: [],
        additionalOptions: [],
      }

      this.showProductModal('Tambah Produk Baru', productForm)
    },

    showProductModal(title, productForm) {
      // Generate variation and option HTML
      let variationsHtml = this.generateVariationsHtml(productForm.variations)
      let optionsHtml = this.generateOptionsHtml(productForm.additionalOptions)

      Swal.fire({
        title: `<h3 class="text-lg font-bold">${title}</h3>`,
        html: `
          <form id="productForm" class="text-left form-compact">
            <div class="mb-4">
              <label class="block text-gray-700 font-medium text-sm mb-1">Kategori</label>
              <select id="category" class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all">
                <option value="Merchandise" ${productForm.category === 'Merchandise' ? 'selected' : ''}>Merchandise</option>
                <option value="T-Shirt" ${productForm.category === 'T-Shirt' ? 'selected' : ''}>T-Shirt</option>
                <option value="Accessories" ${productForm.category === 'Accessories' ? 'selected' : ''}>Accessories</option>
                <option value="Others" ${productForm.category === 'Others' ? 'selected' : ''}>Others</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 font-medium text-sm mb-1">Nama Produk</label>
              <input
                type="text"
                id="productName"
                placeholder="Masukkan Nama Produk"
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

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Harga Dasar (Rp)</label>
                <input
                  type="text"
                  id="basePrice"
                  placeholder="Masukkan Harga Dasar"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  value="${productForm.price || ''}"
                >
                <small class="text-gray-500 text-xs block mt-1">Harga dasar akan digunakan jika tidak ada variasi.</small>
              </div>

              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Stok Total</label>
                <input
                  type="number"
                  id="totalStock"
                  placeholder="Total Stok"
                  class="w-full text-sm p-2.5 border border-gray-300 rounded-lg bg-gray-100"
                  value="${this.calculateTotalStock(productForm.variations)}"
                  readonly
                >
                <small class="text-gray-500 text-xs block mt-1">Total stok dari semua variasi.</small>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 font-medium text-sm mb-1">Gambar Produk</label>
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="custom-file-input">
                  <input type="file" id="productImage" multiple class="hidden">
                  <div class="flex flex-wrap items-center gap-2">
                    <button type="button" onclick="document.getElementById('productImage').click()" class="bg-red-100 hover:bg-red-200 text-red-700 text-sm py-2 px-3 rounded-lg transition-all flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Pilih File
                    </button>
                    <span id="file-chosen" class="text-gray-500 text-sm">
                      ${
                        productForm.images && productForm.images.length > 0
                          ? `${productForm.images.length} ${productForm.images.length > 1 ? 'files' : 'file'} dipilih`
                          : 'Belum ada file dipilih'
                      }
                    </span>
                  </div>
                </div>
                <div class="mt-3 flex flex-wrap gap-2" id="image-preview">
                  ${
                    productForm.images && productForm.images.length > 0
                      ? productForm.images
                          .map(
                            (img, idx) => `
                          <div class="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                            <img src="${img}" class="w-full h-full object-cover" alt="Preview ${idx + 1}">
                            <button type="button" data-index="${idx}" class="remove-img absolute top-0 right-0 bg-red-500 text-white p-1 w-5 h-5 flex items-center justify-center rounded-bl-md">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        `,
                          )
                          .join('')
                      : ''
                  }
                </div>
                <small class="text-gray-500 text-xs block mt-2">Dapat memilih lebih dari 1 file. Format yang didukung: JPG, PNG, WEBP.</small>
              </div>
            </div>

            <!-- Variations Section -->
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
                <div id="variationsContainer" class="variations-container max-h-72 overflow-y-auto pr-1">
                  ${variationsHtml}
                </div>
                <small class="text-gray-600 text-xs block mt-2">Pilih satu variasi sebagai default. Variasi default akan menggunakan harga dasar.</small>
              </div>
            </div>

            <!-- Additional Options Section -->
            <div class="mb-4">
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-center mb-3">
                  <label class="block text-gray-700 font-medium text-sm">Opsi Tambahan</label>
                  <button
                    type="button"
                    id="addOptionBtn"
                    class="bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 px-3 rounded-lg flex items-center transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Opsi
                  </button>
                </div>
                <div id="optionsContainer" class="options-container max-h-56 overflow-y-auto pr-1">
                  ${optionsHtml}
                </div>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 font-medium text-sm mb-1">Status</label>
              <select id="productStatus" class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all">
                <option value="aktif" ${productForm.status === 'aktif' ? 'selected' : ''}>Aktif</option>
                <option value="nonaktif" ${productForm.status === 'nonaktif' ? 'selected' : ''}>Nonaktif</option>
              </select>
            </div>
          </form>
        `,
        showCancelButton: true,
        cancelButtonText: 'Batal',
        confirmButtonText: title === 'Tambah Produk Baru' ? 'Tambah' : 'Simpan',
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
          this.setupVariationAndOptionButtons()
          this.updateTotalStock()
          // Add custom scrollbar styles to the modal
          const modalContent = document.querySelector('.swal2-content')
          if (modalContent) {
            modalContent.style.maxHeight = '70vh'
            modalContent.style.overflowY = 'auto'
            modalContent.style.overflowX = 'hidden'
          }

          // Add custom scrollbar styles to the modal
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

            @media (max-width: 640px) {
              .swal2-popup {
                font-size: 0.875rem;
                padding: 0.5rem;
              }
              .swal2-title {
                font-size: 1.125rem;
              }
            }
          `
          document.head.appendChild(styleElement)
        },
        preConfirm: () => {
          // Get form values
          const category = document.getElementById('category').value
          const name = document.getElementById('productName').value
          const description = document.getElementById('description').value
          const basePrice = document.getElementById('basePrice').value
          const status = document.getElementById('productStatus').value
          const productImage = document.getElementById('productImage').files

          // Validation
          if (!name || !description || !basePrice) {
            Swal.showValidationMessage('Nama, deskripsi, dan harga dasar harus diisi')
            return false
          }

          // Check if at least one variation has stock and weight
          const variationBoxes = document.querySelectorAll('.variation-box:not(.option-box)')
          let hasStock = false
          let hasDefaultVariation = false
          let invalidWeight = false

          if (variationBoxes.length > 0) {
            variationBoxes.forEach((box) => {
              const stockInput = box.querySelector('.variation-stock')
              const weightInput = box.querySelector('.variation-weight')
              const isDefault = box.querySelector('.variation-default')?.checked

              if (stockInput && parseInt(stockInput.value) > 0) {
                hasStock = true
              }

              if (isDefault) {
                hasDefaultVariation = true
              }

              // Validate weight
              if (
                !weightInput.value ||
                isNaN(weightInput.value) ||
                parseInt(weightInput.value) <= 0
              ) {
                invalidWeight = true
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
              Swal.showValidationMessage(
                'Berat produk harus diisi dengan angka lebih dari 0 pada setiap variasi',
              )
              return false
            }
          } else {
            Swal.showValidationMessage('Produk harus memiliki minimal satu variasi')
            return false
          }

          // Create array of image URLs
          let images = [...(productForm.images || [])]

          // Add new images if selected
          if (productImage.length > 0) {
            for (let i = 0; i < productImage.length; i++) {
              images.push(URL.createObjectURL(productImage[i]))
            }
          }

          // If no images, add placeholder
          if (images.length === 0) {
            images = ['https://placehold.co/400x400']
          }

          // Get variations
          const variations = []
          variationBoxes.forEach((box, index) => {
            const nameInput = box.querySelector('.variation-name')
            const priceInput = box.querySelector('.variation-price')
            const stockInput = box.querySelector('.variation-stock')
            const weightInput = box.querySelector('.variation-weight')
            const isDefault = box.querySelector('.variation-default')?.checked

            if (nameInput && nameInput.value) {
              variations.push({
                id: productForm.variations[index]?.id || Date.now() + index,
                name: nameInput.value,
                price: parseInt(priceInput.value) || parseInt(basePrice), // Use base price if not specified
                stock: parseInt(stockInput.value) || 0,
                weight: parseInt(weightInput.value) || 0,
                isDefault: isDefault,
              })
            }
          })

          // Get additional options
          const additionalOptions = []
          const optionBoxes = document.querySelectorAll('.option-box')
          optionBoxes.forEach((box, index) => {
            const nameInput = box.querySelector('.option-name')
            const priceInput = box.querySelector('.option-price')
            if (nameInput && nameInput.value && priceInput && priceInput.value) {
              additionalOptions.push({
                id: productForm.additionalOptions[index]?.id || Date.now() + index,
                name: nameInput.value,
                price: parseInt(priceInput.value) || 0,
              })
            }
          })

          // Calculate total stock
          const totalStock = variations.reduce((sum, variation) => sum + (variation.stock || 0), 0)

          // Build product object
          const product = {
            id: productForm.id || Date.now(), // Use existing ID or create new one
            category,
            name,
            description,
            stock: totalStock,
            price: parseInt(basePrice),
            status,
            images,
            variations,
            additionalOptions,
          }

          return product
        },
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          this.$emit('save-product', result.value)
        }
      })

      // Update file input display and create preview thumbnails
      setTimeout(() => {
        const fileInput = document.getElementById('productImage')
        if (fileInput) {
          fileInput.addEventListener('change', function () {
            const fileCount = this.files.length
            const fileChosen = document.getElementById('file-chosen')
            if (fileChosen) {
              fileChosen.textContent =
                fileCount > 0
                  ? fileCount > 1
                    ? `${fileCount} files dipilih`
                    : this.files[0].name
                  : 'Belum ada file dipilih'
            }

            // Create thumbnails for preview
            const imagePreview = document.getElementById('image-preview')
            if (imagePreview && fileCount > 0) {
              for (let i = 0; i < fileCount; i++) {
                const file = this.files[i]
                const reader = new FileReader()

                reader.onload = function (e) {
                  const imgContainer = document.createElement('div')
                  imgContainer.className =
                    'relative w-16 h-16 rounded-md overflow-hidden border border-gray-200'
                  imgContainer.innerHTML = `
                    <img src="${e.target.result}" class="w-full h-full object-cover" alt="Preview">
                    <button type="button" class="remove-img absolute top-0 right-0 bg-red-500 text-white p-1 w-5 h-5 flex items-center justify-center rounded-bl-md">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  `
                  imagePreview.appendChild(imgContainer)

                  // Setup remove button
                  const removeBtn = imgContainer.querySelector('.remove-img')
                  if (removeBtn) {
                    removeBtn.addEventListener('click', function () {
                      imgContainer.remove()
                      // Update file count display
                      const remainingImages = imagePreview.querySelectorAll('img').length
                      if (fileChosen) {
                        fileChosen.textContent =
                          remainingImages > 0
                            ? `${remainingImages} ${remainingImages > 1 ? 'files' : 'file'} dipilih`
                            : 'Belum ada file dipilih'
                      }
                    })
                  }
                }

                reader.readAsDataURL(file)
              }
            }
          })

          // Setup initial image remove buttons
          const removeImgBtns = document.querySelectorAll('.remove-img')
          removeImgBtns.forEach((btn) => {
            btn.addEventListener('click', function () {
              const imgContainer = this.closest('div')
              const imgIndex = parseInt(this.dataset.index)

              if (imgContainer) {
                imgContainer.remove()

                // Update productForm images array
                if (productForm.images && imgIndex >= 0) {
                  productForm.images.splice(imgIndex, 1)
                }

                // Update file count display
                const imagePreview = document.getElementById('image-preview')
                const remainingImages = imagePreview.querySelectorAll('img').length
                const fileChosen = document.getElementById('file-chosen')

                if (fileChosen) {
                  fileChosen.textContent =
                    remainingImages > 0
                      ? `${remainingImages} ${remainingImages > 1 ? 'files' : 'file'} dipilih`
                      : 'Belum ada file dipilih'
                }
              }
            })
          })
        }
      }, 100)
    },

    // Calculate total stock from variations
    calculateTotalStock(variations = []) {
      if (!variations || variations.length === 0) {
        return 0
      }

      return variations.reduce((sum, variation) => sum + (variation.stock || 0), 0)
    },

    // Update total stock when individual variation stocks change
    updateTotalStock() {
      window.updateTotalStock = () => {
        const variationBoxes = document.querySelectorAll('.variation-box:not(.option-box)')
        let totalStock = 0

        if (variationBoxes.length > 0) {
          variationBoxes.forEach((box) => {
            const stockInput = box.querySelector('.variation-stock')
            totalStock += parseInt(stockInput.value) || 0
          })
        }

        const totalStockInput = document.getElementById('totalStock')
        if (totalStockInput) {
          totalStockInput.value = totalStock
        }
      }

      // Handle default variation radio buttons
      window.handleDefaultVariationChange = (radio) => {
        // Ensure only one variation is selected as default
        const allRadios = document.querySelectorAll('.variation-default')
        allRadios.forEach((r) => {
          if (r !== radio) r.checked = false
        })
      }

      // Initial calculation
      setTimeout(window.updateTotalStock, 100)
    },

    // Generate HTML for variations - updated to include weight per variation
    generateVariationsHtml(variations = []) {
      if (!variations || variations.length === 0) {
        return '<div class="text-grey-600 text-sm italic">Belum ada variasi. Klik tombol "Tambah Variasi" untuk menambahkan.</div>'
      }

      let html = ''
      variations.forEach((variation, index) => {
        html += this.generateVariationBox(variation, index)
      })

      return html
    },

    // Generate HTML for a single variation box - updated to include weight field
    generateVariationBox(
      variation = { name: '', price: '', stock: 0, weight: 0, isDefault: false },
      index,
    ) {
      return `
        <div class="variation-box bg-white shadow-sm border border-red-100 rounded-lg p-3 mb-3" data-index="${index}">
          <div class="close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-12 gap-2">
            <div class="col-span-2 md:col-span-3">
              <label class="block text-gray-700 text-xs mb-1">Nama Variasi</label>
              <input
                type="text"
                class="variation-name w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Contoh: Ukuran L"
                value="${variation.name || ''}"
              >
            </div>
            <div class="col-span-1 md:col-span-2">
              <label class="block text-gray-700 text-xs mb-1">Harga (Rp)</label>
              <input
                type="number"
                class="variation-price w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Harga variasi"
                value="${variation.price || ''}"
              >
            </div>
            <div class="col-span-1 md:col-span-2">
              <label class="block text-gray-700 text-xs mb-1">Stok</label>
              <input
                type="number"
                class="variation-stock w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Stok"
                value="${variation.stock || 0}"
                onchange="window.updateTotalStock()"
              >
            </div>
            <div class="col-span-1 md:col-span-3">
              <label class="block text-gray-700 text-xs mb-1">Berat (gram)</label>
              <input
                type="number"
                class="variation-weight w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Berat dalam gram"
                value="${variation.weight || 0}"
              >
            </div>
            <div class="col-span-1 md:col-span-2 flex items-end pb-2">
              <label class="inline-flex items-center">
                <input
                  type="radio"
                  name="default-variation"
                  class="variation-default form-radio text-red-600"
                  ${variation.isDefault ? 'checked' : ''}
                  onchange="window.handleDefaultVariationChange(this)"
                >
                <span class="ml-1 text-xs">Default</span>
              </label>
            </div>
          </div>
        </div>
      `
    },

    // Generate HTML for additional options
    generateOptionsHtml(options = []) {
      if (!options || options.length === 0) {
        return '<div class="text-grey-600 text-sm italic">Belum ada opsi tambahan. Klik tombol "Tambah Opsi" untuk menambahkan.</div>'
      }

      let html = ''
      options.forEach((option, index) => {
        html += this.generateOptionBox(option, index)
      })

      return html
    },

    // Generate HTML for a single option box
    generateOptionBox(option = { name: '', price: '' }, index) {
      return `
        <div class="variation-box option-box bg-white shadow-sm border border-blue-100 rounded-lg p-3 mb-3" data-index="${index}">
          <div class="close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div class="col-span-1 md:col-span-8">
              <label class="block text-gray-700 text-xs mb-1">Nama Opsi</label>
              <input
                type="text"
                class="option-name w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contoh: Gift Wrap, Ukir Nama"
                value="${option.name || ''}"
              >
            </div>
            <div class="col-span-1 md:col-span-4">
              <label class="block text-gray-700 text-xs mb-1">Harga Tambahan (Rp)</label>
              <input
                type="number"
                class="option-price w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Harga opsi"
                value="${option.price || ''}"
              >
            </div>
          </div>
        </div>
      `
    },

    // Setup event listeners for variation and option buttons
    setupVariationAndOptionButtons() {
      // Add variation button
      const addVariationBtn = document.getElementById('addVariationBtn')
      if (addVariationBtn) {
        addVariationBtn.addEventListener('click', () => {
          const container = document.getElementById('variationsContainer')
          const variationsCount = container.querySelectorAll('.variation-box').length

          // Remove empty state message if it exists
          if (variationsCount === 0) {
            container.innerHTML = ''
          }

          // Add new variation box
          const newBox = document.createElement('div')
          // Set as default if it's the first variation
          const isDefault = variationsCount === 0
          newBox.innerHTML = this.generateVariationBox({ isDefault }, variationsCount)
          container.appendChild(newBox.firstElementChild)

          // Setup close button for the new box
          this.setupCloseButtons()

          // Update total stock calculation
          window.updateTotalStock()
        })
      }

      // Add option button
      const addOptionBtn = document.getElementById('addOptionBtn')
      if (addOptionBtn) {
        addOptionBtn.addEventListener('click', () => {
          const container = document.getElementById('optionsContainer')
          const optionsCount = container.querySelectorAll('.option-box').length

          // Remove empty state message if it exists
          if (optionsCount === 0) {
            container.innerHTML = ''
          }

          // Add new option box
          const newBox = document.createElement('div')
          newBox.innerHTML = this.generateOptionBox({}, optionsCount)
          container.appendChild(newBox.firstElementChild)

          // Setup close button for the new box
          this.setupCloseButtons()
        })
      }

      // Setup close buttons for all variation and option boxes
      this.setupCloseButtons()
    },

    // Setup close buttons for all variation and option boxes
    setupCloseButtons() {
      document.querySelectorAll('.close-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const box = e.target.closest('.variation-box')
          if (box) {
            // Check if it's the last default variation
            const isDefault = box.querySelector('.variation-default')?.checked
            if (isDefault) {
              // If removing default variation, make another one default if possible
              const otherVariations = document.querySelectorAll('.variation-box:not(.option-box)')
              if (otherVariations.length > 1) {
                // Find another variation to make default
                for (let i = 0; i < otherVariations.length; i++) {
                  if (otherVariations[i] !== box) {
                    otherVariations[i].querySelector('.variation-default').checked = true
                    break
                  }
                }
              }
            }

            box.remove()

            // Update total stock
            window.updateTotalStock()

            // Check if variations container is empty
            const varContainer = document.getElementById('variationsContainer')
            if (varContainer && varContainer.children.length === 0) {
              varContainer.innerHTML =
                '<div class="text-grey-600 text-sm italic">Belum ada variasi. Klik tombol "Tambah Variasi" untuk menambahkan.</div>'
            }

            // Check if options container is empty
            const optContainer = document.getElementById('optionsContainer')
            if (optContainer && optContainer.children.length === 0) {
              optContainer.innerHTML =
                '<div class="text-grey-600 text-sm italic">Belum ada opsi tambahan. Klik tombol "Tambah Opsi" untuk menambahkan.</div>'
            }
          }
        })
      })
    },
  },
}
</script>

<style scoped>
.variation-box,
.option-box {
  position: relative;
  transition: all 0.2s;
}

.variation-box:hover,
.option-box:hover {
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

/* Custom scrollbar */
.variations-container::-webkit-scrollbar,
.options-container::-webkit-scrollbar {
  width: 6px;
}

.variations-container::-webkit-scrollbar-track,
.options-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.variations-container::-webkit-scrollbar-thumb,
.options-container::-webkit-scrollbar-thumb {
  background: #dc2626;
  border-radius: 10px;
}

.options-container::-webkit-scrollbar-thumb {
  background: #3b82f6;
}

.variations-container::-webkit-scrollbar-thumb:hover,
.options-container::-webkit-scrollbar-thumb:hover {
  background: #b91c1c;
}

.options-container::-webkit-scrollbar-thumb:hover {
  background: #2563eb;
}

@media (max-width: 640px) {
  .variation-box,
  .option-box {
    padding: 0.75rem 0.5rem;
  }

  .close-btn {
    top: 0.25rem;
    right: 0.25rem;
  }

  .swal2-popup {
    padding: 0.5rem;
  }

  .form-compact label {
    margin-bottom: 0.25rem;
  }

  .form-compact input,
  .form-compact select,
  .form-compact textarea {
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
  }
}
</style>
