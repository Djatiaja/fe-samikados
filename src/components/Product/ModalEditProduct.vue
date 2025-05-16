<template>
  <div></div>
</template>

<script>
import ModalAddProduct from './ModalAddProduct.vue';
import Swal from 'sweetalert2';
import axios from 'axios';

export default {
  name: 'ModalEditProduct',
  extends: ModalAddProduct,
  methods: {
    open(product, categories) {
      const productForm = {
        id: product.id,
        category: categories.find(cat => cat.id === product.category_id)?.name || 'Merchandise Custom',
        name: product.name,
        description: product.description,
        stock: product.stock,
        unit: product.unit || '', // Changed default to empty string
        images: product.images || [],
        status: product.status,
        variations: product.variations.map(v => ({
          id: v.id,
          name: v.name,
          price: v.price,
          stock: v.stock,
          weight: v.weight,
          isDefault: v.is_default,
        })),
        additionalOptions: product.additionalOptions.map(o => ({
          id: o.id,
          name: o.name,
          price: o.price,
          finishing_id: o.finishing_id,
        })),
      };
      this.showProductModal('Edit Produk', productForm, categories);
    },
    async showProductModal(title, productForm, categories) {
      const categoryOptions = categories
        .map(
          cat => `
            <option value="${cat.name}" ${productForm.category === cat.name ? 'selected' : ''}>
              ${cat.name}
            </option>
          `
        )
        .join('');

      let variationsHtml = this.generateVariationsHtml(productForm.variations);
      let optionsHtml = this.generateOptionsHtml(productForm.additionalOptions);

      Swal.fire({
        title: `<h3 class="text-lg font-bold">${title}</h3>`,
        html: `
          <form id="productForm" class="text-left form-compact">
            <div class="mb-4">
              <label class="block text-gray-700 font-medium text-sm mb-1">Kategori</label>
              <select id="category" class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all">
                ${categoryOptions}
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

            <div class="mb-4">
              <label class="block text-gray-700 font-medium text-sm mb-1">Unit</label>
              <input
                type="text"
                id="unit"
                placeholder="Masukkan unit"
                class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                value="${productForm.unit || ''}"
              >
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
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </button>
                          </div>
                        `
                          )
                          .join('')
                      : ''
                  }
                </div>
                <small class="text-gray-500 text-xs block mt-2">Dapat memilih lebih dari 1 file. Format yang didukung: JPG, PNG, WEBP.</small>
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
                <div id="variationsContainer" class="variations-container max-h-72 overflow-y-auto pr-1">
                  ${variationsHtml}
                </div>
                <small class="text-gray-600 text-xs block mt-2">Pilih satu variasi sebagai default.</small>
              </div>
            </div>

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
        confirmButtonText: 'Simpan',
        focusConfirm: false,
        width: '650px',
        maxWidth: '750px',
        buttonsStyling: false,
        customClass: {
          container: 'swal-container',
          popup: 'swal-modal-popup rounded-lg',
          htmlContainer: 'pb-2 px-1',
          confirmButton: 'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
          cancelButton: 'bg-gray-300 text-gray-700 px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
          actions: 'flex justify-center space-x-6',
        },
        didOpen: () => {
          this.setupVariationAndOptionButtons();
          this.updateTotalStock();
          const modalContent = document.querySelector('.swal2-content');
          if (modalContent) {
            modalContent.style.maxHeight = '70vh';
            modalContent.style.overflowY = 'auto';
            modalContent.style.overflowX = 'hidden';
          }

          const styleElement = document.createElement('style');
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
          `;
          document.head.appendChild(styleElement);
        },
        preConfirm: async () => {
          const token = localStorage.getItem('token');
          const category = document.getElementById('category').value;
          const name = document.getElementById('productName').value;
          const description = document.getElementById('description').value;
          const unit = document.getElementById('unit').value;
          const status = document.getElementById('productStatus').value;
          const productImage = document.getElementById('productImage').files;

          // Validate variations
          const variationBoxes = document.querySelectorAll('.variation-box:not(.option-box)');
          let hasStock = false;
          let hasDefaultVariation = false;
          let invalidWeight = false;

          if (variationBoxes.length > 0) {
            variationBoxes.forEach(box => {
              const stockInput = box.querySelector('.variation-stock');
              const weightInput = box.querySelector('.variation-weight');
              const isDefault = box.querySelector('.variation-default')?.checked;

              if (stockInput && parseInt(stockInput.value) > 0) {
                hasStock = true;
              }
              if (isDefault) {
                hasDefaultVariation = true;
              }
              if (
                !weightInput.value ||
                isNaN(weightInput.value) ||
                parseInt(weightInput.value) <= 0
              ) {
                invalidWeight = true;
              }
            });

            if (!hasStock) {
              Swal.showValidationMessage('Setidaknya satu variasi harus memiliki stok');
              return false;
            }
            if (!hasDefaultVariation) {
              Swal.showValidationMessage('Pilih satu variasi sebagai default');
              return false;
            }
            if (invalidWeight) {
              Swal.showValidationMessage(
                'Berat produk harus diisi dengan angka lebih dari 0 pada setiap variasi'
              );
              return false;
            }
          } else {
            Swal.showValidationMessage('Produk harus memiliki minimal satu variasi');
            return false;
          }

          // Handle images
          let images = [...(productForm.images || [])];
          if (productImage.length > 0) {
            for (let i = 0; i < productImage.length; i++) {
              images.push(URL.createObjectURL(productImage[i]));
            }
          }
          if (images.length === 0) {
            images = ['https://placehold.co/400x400'];
          }

          // Get variations
          const variations = [];
          variationBoxes.forEach((box, index) => {
            const nameInput = box.querySelector('.variation-name');
            const priceInput = box.querySelector('.variation-price');
            const stockInput = box.querySelector('.variation-stock');
            const weightInput = box.querySelector('.variation-weight');
            const isDefault = box.querySelector('.variation-default')?.checked;

            if (nameInput && nameInput.value) {
              variations.push({
                id: productForm.variations[index]?.id || null,
                name: nameInput.value,
                price: parseInt(priceInput.value) || 0,
                stock: parseInt(stockInput.value) || 0,
                weight: parseInt(weightInput.value) || 0,
                isDefault: isDefault,
              });
            }
          });

          // Get additional options
          const additionalOptions = [];
          const optionBoxes = document.querySelectorAll('.option-box');
          optionBoxes.forEach((box, index) => {
            const nameInput = box.querySelector('.option-name');
            const priceInput = box.querySelector('.option-price');
            if (nameInput && nameInput.value && priceInput && priceInput.value) {
              additionalOptions.push({
                id: productForm.additionalOptions[index]?.id || null,
                name: nameInput.value,
                price: parseInt(priceInput.value) || 0,
                finishing_id: productForm.additionalOptions[index]?.finishing_id || 1,
              });
            }
          });

          // Calculate total stock
          const totalStock = variations.reduce((sum, variation) => sum + (variation.stock || 0), 0);

          // Compare with original to detect changes
          const changedVariations = variations.filter((variant, index) => {
            const original = productForm.variations[index];
            return !original ||
              variant.name !== original.name ||
              variant.price !== original.price ||
              variant.stock !== original.stock ||
              variant.weight !== original.weight ||
              variant.isDefault !== original.isDefault;
          });

          const changedOptions = additionalOptions.filter((option, index) => {
            const original = productForm.additionalOptions[index];
            return !original ||
              option.name !== original.name ||
              option.price !== original.price ||
              option.finishing_id !== original.finishing_id;
          });

          // API Calls for changed variants and options only
          try {
            const variantPromises = changedVariations.map(async variant => {
              const variantPayload = {
                product_id: productForm.id,
                name: variant.name,
                price: variant.price,
                stock: variant.stock,
                weight: variant.weight,
                is_default: variant.isDefault ? 1 : 0,
              };
              if (variant.id) {
                return axios.post(
                  'http://127.0.0.1:8000/api/seller/product/variant/update',
                  { id: variant.id, ...variantPayload },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              } else {
                return axios.post(
                  'http://127.0.0.1:8000/api/seller/product/variant',
                  variantPayload,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              }
            });

            const finishingPromises = changedOptions.map(async option => {
              const finishingPayload = {
                product_id: productForm.id,
                name: option.name,
                price: option.price,
              };
              if (option.id) {
                return axios.post(
                  'http://127.0.0.1:8000/api/seller/product/finishing/update',
                  { id: option.id, ...finishingPayload },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              } else {
                return axios.post(
                  'http://127.0.0.1:8000/api/seller/product/finishing',
                  finishingPayload,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              }
            });

            // Handle deletions
            const deletedVariants = productForm.variations.filter(
              original => !variations.some(v => v.id === original.id)
            );
            const deletedFinishing = productForm.additionalOptions.filter(
              original => !additionalOptions.some(o => o.id === original.id)
            );

            const deleteVariantPromises = deletedVariants.map(variant =>
              axios.delete(`http://127.0.0.1:8000/api/seller/product/variant/delete`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { id: variant.id },
              })
            );

            const deleteFinishingPromises = deletedFinishing.map(option =>
              axios.delete(`http://127.0.0.1:8000/api/seller/product/finishing/delete`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { id: option.id },
              })
            );

            await Promise.all([
              ...variantPromises,
              ...finishingPromises,
              ...deleteVariantPromises,
              ...deleteFinishingPromises,
            ]);

            // Build product object for emission
            const product = {
              id: productForm.id,
              category,
              name,
              description,
              stock: totalStock,
              unit,
              status,
              images,
              variations,
              additionalOptions,
            };

            return product;
          } catch (error) {
            Swal.showValidationMessage('Gagal menyimpan variasi atau opsi tambahan');
            return false;
          }
        },
      }).then(result => {
        if (result.isConfirmed && result.value) {
          this.$emit('save-product', result.value);
        }
      });

      // Setup file input and image preview
      setTimeout(() => {
        const fileInput = document.getElementById('productImage');
        if (fileInput) {
          fileInput.addEventListener('change', function () {
            const fileCount = this.files.length;
            const fileChosen = document.getElementById('file-chosen');
            if (fileChosen) {
              fileChosen.textContent =
                fileCount > 0
                  ? fileCount > 1
                    ? `${fileCount} files dipilih`
                    : this.files[0].name
                  : 'Belum ada file dipilih';
            }

            const imagePreview = document.getElementById('image-preview');
            if (imagePreview && fileCount > 0) {
              for (let i = 0; i < fileCount; i++) {
                const file = this.files[i];
                const reader = new FileReader();
                reader.onload = e => {
                  const imgContainer = document.createElement('div');
                  imgContainer.className =
                    'relative w-16 h-16 rounded-md overflow-hidden border border-gray-200';
                  imgContainer.innerHTML = `
                    <img src="${e.target.result}" class="w-full h-full object-cover" alt="Preview">
                    <button type="button" class="remove-img absolute top-0 right-0 bg-red-500 text-white p-1 w-5 h-5 flex items-center justify-center rounded-bl-md">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  `;
                  imagePreview.appendChild(imgContainer);

                  const removeBtn = imgContainer.querySelector('.remove-img');
                  if (removeBtn) {
                    removeBtn.addEventListener('click', () => {
                      imgContainer.remove();
                      const remainingImages = imagePreview.querySelectorAll('img').length;
                      if (fileChosen) {
                        fileChosen.textContent =
                          remainingImages > 0
                            ? `${remainingImages} ${remainingImages > 1 ? 'files' : 'file'} dipilih`
                            : 'Belum ada file dipilih';
                      }
                    });
                  }
                };
                reader.readAsDataURL(file);
              }
            }
          });

          // Setup initial image remove buttons
          const removeImgBtns = document.querySelectorAll('.remove-img');
          removeImgBtns.forEach(btn => {
            btn.addEventListener('click', function () {
              const imgContainer = this.closest('div');
              const imgIndex = parseInt(this.dataset.index);
              if (imgContainer) {
                imgContainer.remove();
                if (productForm.images && imgIndex >= 0) {
                  productForm.images.splice(imgIndex, 1);
                }
                const imagePreview = document.getElementById('image-preview');
                const remainingImages = imagePreview.querySelectorAll('img').length;
                const fileChosen = document.getElementById('file-chosen');
                if (fileChosen) {
                  fileChosen.textContent =
                    remainingImages > 0
                      ? `${remainingImages} ${remainingImages > 1 ? 'files' : 'file'} dipilih`
                      : 'Belum ada file dipilih';
                }
              }
            });
          });
        }
      }, 100);
    },
  },
};
</script>
