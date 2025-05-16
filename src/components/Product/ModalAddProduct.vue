<template>
  <div></div>
</template>

<script>
import Swal from 'sweetalert2';

export default {
  name: 'ModalAddProduct',
  props: {
    categories: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    open() {
      const productForm = {
        id: null,
        category_id: this.categories[0]?.id || 1,
        name: '',
        description: '',
        unit: 'unit',
        is_publish: 1,
        variations: [],
        finishing: [],
      };

      this.showProductModal('Tambah Produk Baru', productForm);
    },

    showProductModal(title, productForm) {
      let variationsHtml = this.generateVariationsHtml(productForm.variations);
      let finishingHtml = this.generateFinishingHtml(productForm.finishing);

      Swal.fire({
        title: `<h3 class="text-lg font-bold">${title}</h3>`,
        html: `
          <form id="productForm" class="text-left form-compact">
            <div class="mb-4">
              <label class="block text-gray-700 font-medium text-sm mb-1">Kategori</label>
              <select id="category_id" class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all">
                ${this.categories
                  .map(
                    (cat) =>
                      `<option value="${cat.id}" ${
                        productForm.category_id === cat.id ? 'selected' : ''
                      }>${cat.name}</option>`,
                  )
                  .join('')}
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
                placeholder="Contoh: unit, pack"
                class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                value="${productForm.unit || 'unit'}"
              >
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
                <small class="text-gray-600 text-xs block mt-2">Pilih satu variasi sebagai default.</small>
              </div>
            </div>

            <!-- Finishing Section -->
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
                <div id="finishingContainer" class="finishing-container max-h-56 overflow-y-auto pr-1">
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
        confirmButtonText: 'Tambah',
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
          this.setupVariationAndFinishingButtons();
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
          `;
          document.head.appendChild(styleElement);
        },
        preConfirm: () => {
          const category_id = parseInt(document.getElementById('category_id').value);
          const name = document.getElementById('productName').value;
          const description = document.getElementById('description').value;
          const unit = document.getElementById('unit').value;
          const is_publish = parseInt(document.getElementById('is_publish').value);

          if (!name || !description || !unit) {
            Swal.showValidationMessage('Nama, deskripsi, dan unit harus diisi');
            return false;
          }

          const variationBoxes = document.querySelectorAll('.variation-box:not(.finishing-box)');
          let hasStock = false;
          let hasDefaultVariation = false;
          let invalidWeight = false;
          let invalidMinQty = false;

          if (variationBoxes.length === 0) {
            Swal.showValidationMessage('Produk harus memiliki minimal satu variasi');
            return false;
          }

          const variations = [];
          variationBoxes.forEach((box, index) => {
            const nameInput = box.querySelector('.variation-name');
            const priceInput = box.querySelector('.variation-price');
            const stockInput = box.querySelector('.variation-stock');
            const weightInput = box.querySelector('.variation-weight');
            const minQtyInput = box.querySelector('.variation-min-qty');
            const isDefault = box.querySelector('.variation-default')?.checked;

            if (nameInput && nameInput.value) {
              const stock = parseInt(stockInput.value) || 0;
              const weight = parseInt(weightInput.value) || 0;
              const minQty = parseInt(minQtyInput.value) || 1;

              if (stock > 0) hasStock = true;
              if (isDefault) hasDefaultVariation = true;
              if (weight <= 0) invalidWeight = true;
              if (minQty <= 0) invalidMinQty = true;

              variations.push({
                id: productForm.variations[index]?.id || Date.now() + index,
                name: nameInput.value,
                price: parseInt(priceInput.value) || 0,
                stock: stock,
                weight: weight,
                min_qty: minQty,
                is_default: isDefault ? 1 : 0,
              });
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
            Swal.showValidationMessage('Berat produk harus lebih dari 0 pada setiap variasi');
            return false;
          }

          if (invalidMinQty) {
            Swal.showValidationMessage('Jumlah minimum harus lebih dari 0 pada setiap variasi');
            return false;
          }

          const finishing = [];
          const finishingBoxes = document.querySelectorAll('.finishing-box');
          finishingBoxes.forEach((box, index) => {
            const nameInput = box.querySelector('.finishing-name');
            const priceInput = box.querySelector('.finishing-price');
            const colorCodeInput = box.querySelector('.finishing-color-code');
            if (nameInput && nameInput.value && priceInput && priceInput.value) {
              finishing.push({
                id: productForm.finishing[index]?.id || Date.now() + index,
                name: nameInput.value,
                price: parseInt(priceInput.value) || 0,
                color_code: colorCodeInput.value || '#000000',
              });
            }
          });

          const product = {
            id: productForm.id || Date.now(),
            category_id,
            name,
            description,
            unit,
            is_publish,
            product_variants: variations,
            product_finishing: finishing,
          };

          return product;
        },
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          this.$emit('save-product', result.value);
        }
      });
    },

    generateVariationsHtml(variations = []) {
      if (!variations || variations.length === 0) {
        return '<div class="text-grey-600 text-sm italic">Belum ada variasi. Klik tombol "Tambah Variasi" untuk menambahkan.</div>';
      }

      return variations
        .map((variation, index) => this.generateVariationBox(variation, index))
        .join('');
    },

    generateVariationBox(
      variation = { name: '', price: 0, stock: 0, weight: 0, min_qty: 1, is_default: false },
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
                placeholder="Contoh: 16GB RAM - 512GB SSD"
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
              >
            </div>
            <div class="col-span-1 md:col-span-2">
              <label class="block text-gray-700 text-xs mb-1">Berat (gram)</label>
              <input
                type="number"
                class="variation-weight w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Berat dalam gram"
                value="${variation.weight || 0}"
              >
            </div>
            <div class="col-span-1 md:col-span-2">
              <label class="block text-gray-700 text-xs mb-1">Jumlah Minimum</label>
              <input
                type="number"
                class="variation-min-qty w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Min. Qty"
                value="${variation.min_qty || 1}"
              >
            </div>
            <div class="col-span-1 md:col-span-1 flex items-end pb-2">
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
      `;
    },

    generateFinishingHtml(finishing = []) {
      if (!finishing || finishing.length === 0) {
        return '<div class="text-grey-600 text-sm italic">Belum ada finishing. Klik tombol "Tambah Finishing" untuk menambahkan.</div>';
      }

      return finishing
        .map((fin, index) => this.generateFinishingBox(fin, index))
        .join('');
    },

    generateFinishingBox(finishing = { name: '', price: 0, color_code: '#000000' }, index) {
      return `
        <div class="finishing-box bg-white shadow-sm border border-blue-100 rounded-lg p-3 mb-3" data-index="${index}">
          <div class="close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div class="col-span-1 md:col-span-4">
              <label class="block text-gray-700 text-xs mb-1">Nama Finishing</label>
              <input
                type="text"
                class="finishing-name w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contoh: Matte Black"
                value="${finishing.name || ''}"
              >
            </div>
            <div class="col-span-1 md:col-span-4">
              <label class="block text-gray-700 text-xs mb-1">Harga Tambahan (Rp)</label>
              <input
                type="number"
                class="finishing-price w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Harga finishing"
                value="${finishing.price || ''}"
              >
            </div>
            <div class="col-span-1 md:col-span-4">
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
      `;
    },

    setupVariationAndFinishingButtons() {
      const addVariationBtn = document.getElementById('addVariationBtn');
      if (addVariationBtn) {
        addVariationBtn.addEventListener('click', () => {
          const container = document.getElementById('variationsContainer');
          const variationsCount = container.querySelectorAll('.variation-box').length;

          if (variationsCount === 0) {
            container.innerHTML = '';
          }

          const newBox = document.createElement('div');
          const isDefault = variationsCount === 0;
          newBox.innerHTML = this.generateVariationBox({ is_default: isDefault }, variationsCount);
          container.appendChild(newBox.firstElementChild);

          this.setupCloseButtons();
        });
      }

      const addFinishingBtn = document.getElementById('addFinishingBtn');
      if (addFinishingBtn) {
        addFinishingBtn.addEventListener('click', () => {
          const container = document.getElementById('finishingContainer');
          const finishingCount = container.querySelectorAll('.finishing-box').length;

          if (finishingCount === 0) {
            container.innerHTML = '';
          }

          const newBox = document.createElement('div');
          newBox.innerHTML = this.generateFinishingBox({}, finishingCount);
          container.appendChild(newBox.firstElementChild);

          this.setupCloseButtons();
        });
      }

      this.setupCloseButtons();
    },

    setupCloseButtons() {
      document.querySelectorAll('.close-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const box = e.target.closest('.variation-box, .finishing-box');
          if (box) {
            const isDefault = box.querySelector('.variation-default')?.checked;
            if (isDefault) {
              const otherVariations = document.querySelectorAll('.variation-box:not(.finishing-box)');
              if (otherVariations.length > 1) {
                for (let i = 0; i < otherVariations.length; i++) {
                  if (otherVariations[i] !== box) {
                    otherVariations[i].querySelector('.variation-default').checked = true;
                    break;
                  }
                }
              }
            }

            box.remove();

            const varContainer = document.getElementById('variationsContainer');
            if (varContainer && varContainer.children.length === 0) {
              varContainer.innerHTML =
                '<div class="text-grey-600 text-sm italic">Belum ada variasi. Klik tombol "Tambah Variasi" untuk menambahkan.</div>';
            }

            const finContainer = document.getElementById('finishingContainer');
            if (finContainer && finContainer.children.length === 0) {
              finContainer.innerHTML =
                '<div class="text-grey-600 text-sm italic">Belum ada finishing. Klik tombol "Tambah Finishing" untuk menambahkan.</div>';
            }
          }
        });
      });
    },

    handleDefaultVariationChange(radio) {
      const allRadios = document.querySelectorAll('.variation-default');
      allRadios.forEach((r) => {
        if (r !== radio) r.checked = false;
      });
    },
  },
};
</script>

<style scoped>
.variation-box,
.finishing-box {
  position: relative;
  transition: all 0.2s;
}

.variation-box:hover,
.finishing-box:hover {
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
.finishing-container::-webkit-scrollbar {
  width: 6px;
}

.variations-container::-webkit-scrollbar-track,
.finishing-container::-webkit-scrollbar-track {
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

.variations-container::-webkit-scrollbar-thumb:hover {
  background: #b91c1c;
}

.finishing-container::-webkit-scrollbar-thumb:hover {
  background: #2563eb;
}
</style>
