<!-- components/Product/ModalEditProduct.vue -->
<template>
  <div></div>
</template>

<script>
import Swal from 'sweetalert2';
import axios from 'axios';

export default {
  name: 'ModalEditProduct',
  methods: {
    open(product, categories) {
      // Ensure product and categories are valid
      if (!product || !categories) {
        console.error('Invalid product or categories:', product, categories);
        Swal.fire({
          title: 'Error!',
          text: 'Data produk atau kategori tidak valid',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        });
        return;
      }

      const productForm = {
        id: product.id,
        category: categories.find(cat => cat.id === product.category_id)?.name || 'Merchandise Custom',
        name: product.name || '',
        description: product.description || '',
        stock: product.stock_total || 0,
        unit: product.unit || '',
        images: product.images || [],
        status: product.status || 'aktif',
        variations: product.variations?.map(v => ({
          id: v.id,
          name: v.name || '',
          price: v.price || 0,
          stock: v.stock || 0,
          weight: v.weight || 0,
          is_default: v.is_default || false,
        })) || [],
        additionalOptions: product.additionalOptions?.map(o => ({
          id: o.id,
          name: o.name || '',
          price: o.price || 0,
          finishing_id: o.finishing_id || 1,
        })) || [],
      };

      this.showProductModal('Edit Produk', productForm, categories);
    },
    generateVariationsHtml(variations) {
      return variations
        .map(
          (v, index) => `
            <div class="variation-box mb-3 p-3 bg-white border border-gray-200 rounded-lg relative" data-index="${index}">
              <button type="button" class="remove-variation absolute top-2 right-2 text-red-500 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-gray-600 text-xs mb-1">Nama Variasi</label>
                  <input type="text" class="variation-name w-full text-sm p-2 border border-gray-300 rounded-lg" value="${v.name}" placeholder="Nama Variasi">
                </div>
                <div>
                  <label class="block text-gray-600 text-xs mb-1">Harga</label>
                  <input type="number" class="variation-price w-full text-sm p-2 border border-gray-300 rounded-lg" value="${v.price}" placeholder="Harga">
                </div>
                <div>
                  <label class="block text-gray-600 text-xs mb-1">Stok</label>
                  <input type="number" class="variation-stock w-full text-sm p-2 border border-gray-300 rounded-lg" value="${v.stock}" placeholder="Stok">
                </div>
                <div>
                  <label class="block text-gray-600 text-xs mb-1">Berat (gram)</label>
                  <input type="number" class="variation-weight w-full text-sm p-2 border border-gray-300 rounded-lg" value="${v.weight}" placeholder="Berat">
                </div>
              </div>
              <div class="mt-2">
                <label class="flex items-center text-sm">
                  <input type="radio" class="variation-default mr-2" name="default-variation" ${v.is_default ? 'checked' : ''}>
                  Jadikan Default
                </label>
              </div>
            </div>
          `
        )
        .join('');
    },
    generateOptionsHtml(options) {
      return options
        .map(
          (o, index) => `
            <div class="option-box mb-3 p-3 bg-white border border-gray-200 rounded-lg relative" data-index="${index}">
              <button type="button" class="remove-option absolute top-2 right-2 text-red-500 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-gray-600 text-xs mb-1">Nama Opsi</label>
                  <input type="text" class="option-name w-full text-sm p-2 border border-gray-300 rounded-lg" value="${o.name}" placeholder="Nama Opsi">
                </div>
                <div>
                  <label class="block text-gray-600 text-xs mb-1">Harga</label>
                  <input type="number" class="option-price w-full text-sm p-2 border border-gray-300 rounded-lg" value="${o.price}" placeholder="Harga">
                </div>
              </div>
            </div>
          `
        )
        .join('');
    },
    calculateTotalStock(variations) {
      return variations.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
    },
    setupVariationAndOptionButtons() {
      const addVariationBtn = document.getElementById('addVariationBtn');
      const addOptionBtn = document.getElementById('addOptionBtn');
      const variationsContainer = document.getElementById('variationsContainer');
      const optionsContainer = document.getElementById('optionsContainer');

      if (addVariationBtn && variationsContainer) {
        addVariationBtn.addEventListener('click', () => {
          const newVariation = `
            <div class="variation-box mb-3 p-3 bg-white border border-gray-200 rounded-lg relative">
              <button type="button" class="remove-variation absolute top-2 right-2 text-red-500 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-gray-600 text-xs mb-1">Nama Variasi</label>
                  <input type="text" class="variation-name w-full text-sm p-2 border border-gray-300 rounded-lg" placeholder="Nama Variasi">
                </div>
                <div>
                  <label class="block text-gray-600 text-xs mb-1">Harga</label>
                  <input type="number" class="variation-price w-full text-sm p-2 border border-gray-300 rounded-lg" placeholder="Harga">
                </div>
                <div>
                  <label class="block text-gray-600 text-xs mb-1">Stok</label>
                  <input type="number" class="variation-stock w-full text-sm p-2 border border-gray-300 rounded-lg" placeholder="Stok">
                </div>
                <div>
                  <label class="block text-gray-600 text-xs mb-1">Berat (gram)</label>
                  <input type="number" class="variation-weight w-full text-sm p-2 border border-gray-300 rounded-lg" placeholder="Berat">
                </div>
              </div>
              <div class="mt-2">
                <label class="flex items-center text-sm">
                  <input type="radio" class="variation-default mr-2" name="default-variation">
                  Jadikan Default
                </label>
              </div>
            </div>
          `;
          variationsContainer.insertAdjacentHTML('beforeend', newVariation);
          this.updateTotalStock();
          this.setupRemoveButtons();
        });
      }

      if (addOptionBtn && optionsContainer) {
        addOptionBtn.addEventListener('click', () => {
          const newOption = `
            <div class="option-box mb-3 p-3 bg-white border border-gray-200 rounded-lg relative">
              <button type="button" class="remove-option absolute top-2 right-2 text-red-500 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-gray-600 text-xs mb-1">Nama Opsi</label>
                  <input type="text" class="option-name w-full text-sm p-2 border border-gray-300 rounded-lg" placeholder="Nama Opsi">
                </div>
                <div>
                  <label class="block text-gray-600 text-xs mb-1">Harga</label>
                  <input type="number" class="option-price w-full text-sm p-2 border border-gray-300 rounded-lg" placeholder="Harga">
                </div>
              </div>
            </div>
          `;
          optionsContainer.insertAdjacentHTML('beforeend', newOption);
          this.setupRemoveButtons();
        });
      }

      this.setupRemoveButtons();
    },
    setupRemoveButtons() {
      const removeVariationButtons = document.querySelectorAll('.remove-variation');
      const removeOptionButtons = document.querySelectorAll('.remove-option');

      removeVariationButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          btn.closest('.variation-box').remove();
          this.updateTotalStock();
        });
      });

      removeOptionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          btn.closest('.option-box').remove();
        });
      });
    },
    updateTotalStock() {
      const variationBoxes = document.querySelectorAll('.variation-box:not(.option-box)');
      let totalStock = 0;
      variationBoxes.forEach(box => {
        const stockInput = box.querySelector('.variation-stock');
        if (stockInput && stockInput.value) {
          totalStock += parseInt(stockInput.value) || 0;
        }
      });
      const totalStockInput = document.getElementById('totalStock');
      if (totalStockInput) {
        totalStockInput.value = totalStock;
      }
    },
    async showProductModal(title, productForm, categories) {
      try {
        const categoryOptions = categories
          .map(
            cat => `
              <option value="${cat.name}" ${productForm.category === cat.name ? 'selected' : ''}>
                ${cat.name}
              </option>
            `
          )
          .join('');

        const variationsHtml = this.generateVariationsHtml(productForm.variations);
        const optionsHtml = this.generateOptionsHtml(productForm.additionalOptions);

        const result = await Swal.fire({
          title: `<h3 class="text-lg font-bold">${title}</h3>`,
          html: `
            <form id="productForm" class="text-left form-compact">
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Kategori</label>
                <select id="category" class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  ${categoryOptions}
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Nama Produk</label>
                <input type="text" id="productName" class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" value="${productForm.name}">
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Deskripsi</label>
                <textarea id="description" rows="2" class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">${productForm.description}</textarea>
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Unit</label>
                <input type="text" id="unit" class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" value="${productForm.unit}">
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Stok Total</label>
                <input type="number" id="totalStock" class="w-full text-sm p-2.5 border border-gray-300 rounded-lg bg-gray-100" value="${this.calculateTotalStock(productForm.variations)}" readonly>
                <small class="text-gray-500 text-xs block mt-1">Total stok dari semua variasi.</small>
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 font-medium text-sm mb-1">Gambar Produk</label>
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <input type="file" id="productImage" multiple class="hidden">
                  <div class="flex flex-wrap items-center gap-2">
                    <button type="button" onclick="document.getElementById('productImage').click()" class="bg-red-100 hover:bg-red-200 text-red-700 text-sm py-2 px-3 rounded-lg flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Pilih File
                    </button>
                    <span id="file-chosen" class="text-gray-500 text-sm">
                      ${productForm.images.length > 0 ? `${productForm.images.length} file${productForm.images.length > 1 ? 's' : ''} dipilih` : 'Belum ada file dipilih'}
                    </span>
                  </div>
                  <div class="mt-3 flex flex-wrap gap-2" id="image-preview">
                    ${productForm.images.map((img, idx) => `
                      <div class="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                        <img src="${img}" class="w-full h-full object-cover" alt="Preview ${idx + 1}">
                        <button type="button" data-index="${idx}" class="remove-img absolute top-0 right-0 bg-red-500 text-white p-1 w-5 h-5 flex items-center justify-center rounded-bl-md">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    `).join('')}
                  </div>
                  <small class="text-gray-500 text-xs block mt-2">Dapat memilih lebih dari 1 file. Format yang didukung: JPG, PNG, WEBP.</small>
                </div>
              </div>
              <div class="mb-5">
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div class="flex justify-between items-center mb-3">
                    <label class="block text-gray-700 font-medium text-sm">Variasi Produk</label>
                    <button type="button" id="addVariationBtn" class="bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 px-3 rounded-lg flex items-center">
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
                    <button type="button" id="addOptionBtn" class="bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 px-3 rounded-lg flex items-center">
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
                <select id="productStatus" class="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
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
          buttonsStyling: false,
          customClass: {
            popup: 'rounded-lg',
            confirmButton: 'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm',
            cancelButton: 'bg-gray-300 text-gray-700 px-4 py-2 w-40 rounded-lg text-sm',
            actions: 'flex justify-center space-x-6',
          },
          didOpen: () => {
            this.setupVariationAndOptionButtons();
            this.updateTotalStock();
            const modalContent = document.querySelector('.swal2-html-container');
            if (modalContent) {
              modalContent.style.maxHeight = '70vh';
              modalContent.style.overflowY = 'auto';
              modalContent.style.overflowX = 'hidden';
            }
          },
          preConfirm: async () => {
  try {
    const token = localStorage.getItem('token');
    const category = document.getElementById('category').value;
    const name = document.getElementById('productName').value;
    const description = document.getElementById('description').value;
    const unit = document.getElementById('unit').value;
    const status = document.getElementById('productStatus').value;
    const productImage = document.getElementById('productImage').files;

    // Collect variations
    const variationBoxes = document.querySelectorAll('.variation-box:not(.option-box)');
    const variations = [];
    let hasDefaultVariation = false;

    variationBoxes.forEach((box, index) => {
      const nameInput = box.querySelector('.variation-name');
      const priceInput = box.querySelector('.variation-price');
      const stockInput = box.querySelector('.variation-stock');
      const weightInput = box.querySelector('.variation-weight');
      const is_default = box.querySelector('.variation-default')?.checked;

      if (nameInput && nameInput.value) {
        variations.push({
          id: productForm.variations[index]?.id || null,
          name: nameInput.value,
          price: parseInt(priceInput.value) || 0,
          stock: parseInt(stockInput.value) || 0,
          weight: parseInt(weightInput.value) || 0,
          is_default: is_default || false,
        });

        if (is_default) hasDefaultVariation = true;
      }
    });

    // Validate default variation if variations exist
    if (variations.length > 0 && !hasDefaultVariation) {
      Swal.showValidationMessage('Pilih satu variasi sebagai default jika ada variasi');
      return false;
    }

    // Collect additional options
    const additionalOptions = [];
    const optionBoxes = document.querySelectorAll('.option-box');
    optionBoxes.forEach((box, index) => {
      const nameInput = box.querySelector('.option-name');
      const priceInput = box.querySelector('.option-price');
      if (nameInput && nameInput.value && priceInput) {
        additionalOptions.push({
          id: productForm.additionalOptions[index]?.id || null,
          name: nameInput.value,
          price: parseInt(priceInput.value) || 0,
          finishing_id: productForm.additionalOptions[index]?.finishing_id || 1,
        });
      }
    });

    // Handle images
    let images = [...productForm.images];
    if (productImage.length > 0) {
      for (let i = 0; i < productImage.length; i++) {
        images.push(URL.createObjectURL(productImage[i]));
      }
    }

    // Calculate total stock
    const totalStock = variations.reduce((sum, v) => sum + (v.stock || 0), 0);

    // Prepare product object with only changed fields
    const product = { id: productForm.id };
    if (category !== productForm.category) product.category = category;
    if (name !== productForm.name) product.name = name;
    if (description !== productForm.description) product.description = description;
    if (unit !== productForm.unit) product.unit = unit;
    if (status !== productForm.status) product.status = status;
    if (totalStock !== productForm.stock) product.stock = totalStock;
    if (JSON.stringify(images) !== JSON.stringify(productForm.images)) product.images = images;
    if (JSON.stringify(variations) !== JSON.stringify(productForm.variations)) product.variations = variations;
    if (JSON.stringify(additionalOptions) !== JSON.stringify(productForm.additionalOptions)) {
      product.additionalOptions = additionalOptions;
    }

    // Handle API calls for changed variants and options
    const changedVariations = variations.filter((v, i) => {
      const original = productForm.variations[i];
      return (
        !original ||
        v.name !== original.name ||
        v.price !== original.price ||
        v.stock !== original.stock ||
        v.weight !== original.weight ||
        v.is_default !== original.is_default
      );
    });

    const changedOptions = additionalOptions.filter((o, i) => {
      const original = productForm.additionalOptions[i];
      return (
        !original ||
        o.name !== original.name ||
        o.price !== original.price ||
        o.finishing_id !== original.finishing_id
      );
    });

    const variantPromises = changedVariations.map(async v => {
      const variantPayload = { product_id: productForm.id };
      if (v.name) variantPayload.name = v.name;
      if (v.price) variantPayload.price = v.price;
      if (v.stock) variantPayload.stock = v.stock;
      if (v.weight) variantPayload.weight = v.weight;
      variantPayload.is_default = v.is_default ? 1 : 0;

      if (v.id) {
        return axios.post(
          'http://127.0.0.1:8000/api/seller/product/variant/update',
          { id: v.id, ...variantPayload },
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

    const finishingPromises = changedOptions.map(async o => {
      const finishingPayload = { product_id: productForm.id };
      if (o.name) finishingPayload.name = o.name;
      if (o.price) finishingPayload.price = o.price;

      if (o.id) {
        return axios.post(
          'http://127.0.0.1:8000/api/seller/product/finishing/update',
          { id: o.id, ...finishingPayload },
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

    const deletedVariants = productForm.variations.filter(
      original => !variations.some(v => v.id === original.id)
    );
    const deletedFinishing = productForm.additionalOptions.filter(
      original => !additionalOptions.some(o => o.id === original.id)
    );

    const deleteVariantPromises = deletedVariants.map(v =>
      axios.delete(`http://127.0.0.1:8000/api/seller/product/variant/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { id: v.id },
      })
    );

    const deleteFinishingPromises = deletedFinishing.map(o =>
      axios.delete(`http://127.0.0.1:8000/api/seller/product/finishing/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { id: o.id },
      })
    );

    await Promise.all([
      ...variantPromises,
      ...finishingPromises,
      ...deleteVariantPromises,
      ...deleteFinishingPromises,
    ]);

    return product;
  } catch (error) {
    console.error('Error in preConfirm:', error);
    Swal.showValidationMessage('Gagal menyimpan produk');
    return false;
  }
},
        });

        if (result.isConfirmed && result.value) {
          this.$emit('save-product', result.value);
        }
      } catch (error) {
        console.error('Error showing modal:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Gagal membuka modal edit produk',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    },
  },
};
</script>
