<template>
  <div class="flex flex-col min-h-screen">
    <!-- Content from your existing template -->
    <div
      id="overlay"
      :class="{ block: isSidebarActive && isMobile, hidden: !isSidebarActive || !isMobile }"
      @click="toggleSidebar"
      class="fixed inset-0 bg-opacity-20 z-20"
    ></div>

    <!-- Header -->
    <HeaderSeller @toggle-sidebar="toggleSidebar" :showSearch="true">
      <template #search>
        <div class="relative w-full">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari produk..."
            class="w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 bg-white text-black"
          />
          <div class="absolute left-4 top-3">
            <img
              src="/icon/magnifying-glass-solid.svg"
              alt="Search"
              class="h-4 w-4 text-gray-400"
            />
          </div>
        </div>
      </template>
    </HeaderSeller>

    <!-- Sidebar -->
    <SidebarSeller :isSidebarActive="isSidebarActive" />

    <!-- Content Wrapper -->
    <div
      class="content-wrapper bg-gray-100 flex-1 mt-32 sm:mt-32 md:mt-16"
      :class="{ 'lg:ml-64': isSidebarActive }"
    >
      <div class="p-4 md:p-6 lg:p-8">
        <h2 class="text-2xl md:text-3xl lg:text-3xl font-bold mb-6">Manajemen Produk</h2>

        <div class="flex justify-between items-center mb-4">
          <!-- Filter Dropdown -->
          <select
            v-model="statusFilter"
            class="block w-60 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">Semua</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <button
            @click="showAddProductModal"
            class="border-2 border-black px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <img src="/icon/add.svg" alt="Add Icon" class="w-4 h-4 mr-2" />
            <span>Produk</span>
          </button>
        </div>

        <!-- Entries per page -->
        <div class="mb-4">
          <label for="entriesPerPage" class="mr-2">Entries per page:</label>
          <select
            v-model="entriesPerPage"
            class="p-2 border border-gray-300 rounded-md"
            @change="changeEntriesPerPage"
          >
            <option value="10">10</option>
            <option value="25" selected>25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <!-- Responsive Table -->
        <div class="overflow-auto rounded-lg shadow-md">
          <table class="w-full table-auto border-collapse border border-gray-300">
            <thead class="bg-red-600 text-white">
              <tr>
                <th class="p-4 text-center border-r border-gray-300">Kategori</th>
                <th class="p-4 text-center border-r border-gray-300">Nama</th>
                <th class="p-4 text-center border-r border-gray-300">Deskripsi</th>
                <th class="p-4 text-center border-r border-gray-300">Stok</th>
                <th class="p-4 text-center border-r border-gray-300">Harga</th>
                <th class="p-4 text-center border-r border-gray-300">Gambar</th>
                <th class="p-4 text-center border-r border-gray-300">Status</th>
                <th class="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id" class="border-b border-gray-300">
                <td class="p-4 text-center border-r border-gray-300">{{ product.category }}</td>
                <td class="p-4 text-center border-r border-gray-300">{{ product.name }}</td>
                <td class="p-4 text-center border-r border-gray-300">{{ product.description }}</td>
                <td class="p-4 text-center border-r border-gray-300">{{ product.stock }}</td>
                <td class="p-4 text-center border-r border-gray-300">
                  {{ formatCurrency(product.price) }}
                </td>
                <td class="p-4 text-center border-r border-gray-300">
                  <div class="flex justify-center">
                    <img
                      :src="
                        product.images && product.images.length > 0
                          ? product.images[0]
                          : 'https://placehold.co/48x48'
                      "
                      alt="Gambar Produk"
                      @click="showImagePreviewModal(product)"
                      class="cursor-pointer w-12 h-12 object-cover"
                    />
                    <span
                      v-if="product.images && product.images.length > 1"
                      class="ml-1 bg-gray-200 text-gray-700 text-xs rounded-full px-1.5 py-0.5"
                    >
                      +{{ product.images.length - 1 }}
                    </span>
                  </div>
                </td>
                <td class="p-4 text-center border-r border-gray-300">
                  <select
                    :class="[
                      'status-dropdown w-40 text-white py-2 px-4 rounded-lg',
                      product.status === 'aktif' ? 'bg-green-500' : 'bg-red-500',
                    ]"
                    :value="product.status"
                    @change="showStatusChangeModal(product, $event.target.value)"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </td>
                <td class="p-4 text-center min-w-24">
                  <button class="text-blue-500 mr-2" @click="showEditProductModal(product)">
                    <img src="/icon/edit-btn.svg" alt="Edit Icon" class="w-6 h-6" />
                  </button>
                  <button @click="showDeleteConfirmationModal(product)">
                    <img src="/icon/delete-btn.svg" alt="Delete Icon" class="w-6 h-6" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <FooterSeller />
  </div>
</template>

<script>
import HeaderSeller from '@/components/HeaderSeller.vue'
import SidebarSeller from '@/components/SidebarSeller.vue'
import FooterSeller from '@/components/FooterSeller.vue'
import Swal from 'sweetalert2'

export default {
  components: { HeaderSeller, SidebarSeller, FooterSeller },
  data() {
    return {
      isSidebarActive: false,
      isMobile: window.innerWidth < 1024,
      statusFilter: 'all',
      entriesPerPage: 25,
      searchQuery: '',
      currentImageIndex: 0,

      // Product form data
      productForm: {
        id: null,
        category: 'Merchandise',
        name: '',
        description: '',
        stock: null,
        price: null,
        images: [],
        status: 'aktif',
      },

      // Products data array
      products: [
        {
          id: 1,
          category: 'Merchandise',
          name: 'PIN PENITI 58mm',
          description: 'Temukan solusi praktis untuk kebutuhan promosi.',
          stock: 250,
          price: 4500,
          images: [
            'https://placehold.co/400x400/red/white?text=PIN+1',
            'https://placehold.co/400x400/blue/white?text=PIN+2',
            'https://placehold.co/400x400/green/white?text=PIN+3',
          ],
          status: 'aktif',
        },
        {
          id: 2,
          category: 'T-Shirt',
          name: 'Kaos Premium',
          description: 'Kaos katun premium dengan bahan berkualitas.',
          stock: 100,
          price: 85000,
          images: [
            'https://placehold.co/400x400/orange/white?text=Kaos+1',
            'https://placehold.co/400x400/purple/white?text=Kaos+2',
          ],
          status: 'aktif',
        },
        {
          id: 3,
          category: 'Accessories',
          name: 'Gantungan Kunci',
          description: 'Gantungan kunci custom dengan desain menarik.',
          stock: 150,
          price: 12000,
          images: ['https://placehold.co/400x400/yellow/black?text=Gantungan+1'],
          status: 'nonaktif',
        },
      ],
    }
  },
  mounted() {
    this.isSidebarActive = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)
    this.addSweetAlertStyles()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    toggleSidebar() {
      if (this.isMobile) {
        this.isSidebarActive = !this.isSidebarActive
      }
    },
    handleResize() {
      this.isMobile = window.innerWidth < 1024
      this.isSidebarActive = !this.isMobile
    },
    changeEntriesPerPage() {
      // Logic for changing entries per page
    },
    formatCurrency(amount) {
      return `Rp${amount.toLocaleString('id-ID')}`
    },

    // Add custom SweetAlert2 styles
    addSweetAlertStyles() {
      const style = document.createElement('style')
      style.textContent = `
        .swal2-popup {
          width: 100% !important;
          max-width: 32rem !important;
          padding: 1.5rem;
          border-radius: 0.5rem;
        }
        .swal2-title {
          font-size: 1.25rem !important;
          font-weight: bold !important;
          margin-bottom: 1rem !important;
        }
        .swal2-html-container {
          margin: 0 !important;
        }
        .swal2-confirm {
          background-color: #dc2626 !important;
          color: white !important;
          border-radius: 0.375rem !important;
          font-weight: 500 !important;
          padding: 0.5rem 1rem !important;
          border: none !important;
          min-width: 8rem !important;
        }
        .swal2-cancel {
          background-color: #d1d5db !important;
          color: #1f2937 !important;
          border-radius: 0.375rem !important;
          font-weight: 500 !important;
          padding: 0.5rem 1rem !important;
          border: none !important;
          min-width: 6rem !important;
        }
        .swal2-image {
          margin: 0 auto !important;
        }
        .image-slider {
          position: relative;
          margin: 0 auto;
          width: 100%;
          max-width: 400px;
        }
        .image-slider img {
          width: 100%;
          height: auto;
          object-fit: contain;
        }
        .slider-nav {
          display: flex;
          justify-content: space-between;
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
        }
        .slider-nav button {
          background-color: rgba(0,0,0,0.5);
          color: white;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin: 0 10px;
        }
        .slider-dots {
          display: flex;
          justify-content: center;
          margin-top: 10px;
        }
        .slider-dots span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #d1d5db;
          margin: 0 5px;
          cursor: pointer;
        }
        .slider-dots span.active {
          background-color: #dc2626;
        }
        .form-compact label {
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }
        .form-compact input, .form-compact select, .form-compact textarea {
          padding: 0.5rem 0.75rem;
        }
        .form-compact .mb-4 {
          margin-bottom: 0.75rem;
        }
      `
      document.head.appendChild(style)
    },

    // Show Add Product Modal
    showAddProductModal() {
      // Reset form
      this.productForm = {
        id: null,
        category: 'Merchandise',
        name: '',
        description: '',
        stock: null,
        price: null,
        images: [],
        status: 'aktif',
      }

      this.showProductModal('Tambah Produk Baru')
    },

    // Show Edit Product Modal
    showEditProductModal(product) {
      // Copy product data to form
      this.productForm = { ...product }

      this.showProductModal('Edit Produk')
    },

    // Generic Product Modal (used for both Add and Edit)
    showProductModal(title) {
      Swal.fire({
        title: `<h3 class="text-lg font-bold">${title}</h3>`,
        html: `
          <form id="productForm" class="text-left form-compact">
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1">Kategori</label>
              <select id="category" class="w-full text-sm p-2 border border-gray-300 rounded-lg">
                <option value="Merchandise" ${this.productForm.category === 'Merchandise' ? 'selected' : ''}>Merchandise</option>
                <option value="T-Shirt" ${this.productForm.category === 'T-Shirt' ? 'selected' : ''}>T-Shirt</option>
                <option value="Accessories" ${this.productForm.category === 'Accessories' ? 'selected' : ''}>Accessories</option>
                <option value="Others" ${this.productForm.category === 'Others' ? 'selected' : ''}>Others</option>
              </select>
            </div>
            
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1">Nama Produk</label>
              <input 
                type="text" 
                id="productName" 
                placeholder="Masukkan Nama Produk" 
                class="w-full text-sm p-2 border border-gray-300 rounded-lg"
                value="${this.productForm.name || ''}"
              >
            </div>
            
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1">Deskripsi</label>
              <textarea 
                id="description" 
                rows="2" 
                placeholder="Masukkan deskripsi produk" 
                class="w-full text-sm p-2 border border-gray-300 rounded-lg"
              >${this.productForm.description || ''}</textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div class="mb-3">
                <label class="block text-gray-700 font-medium text-sm mb-1">Stok Produk</label>
                <input 
                  type="number" 
                  id="stock" 
                  placeholder="Masukkan Stok" 
                  class="w-full text-sm p-2 border border-gray-300 rounded-lg"
                  value="${this.productForm.stock || ''}"
                >
              </div>
              
              <div class="mb-3">
                <label class="block text-gray-700 font-medium text-sm mb-1">Harga Produk (Rp)</label>
                <input 
                  type="text" 
                  id="price" 
                  placeholder="Masukkan Harga" 
                  class="w-full text-sm p-2 border border-gray-300 rounded-lg"
                  value="${this.productForm.price || ''}"
                >
              </div>
            </div>
            
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1">Gambar Produk</label>
              <div class="custom-file-input">
                <input type="file" id="productImage" multiple class="hidden">
                <div class="flex items-center space-x-2">
                  <button type="button" onclick="document.getElementById('productImage').click()" class="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-1.5 px-3 rounded">
                    Choose Files
                  </button>
                  <span id="file-chosen" class="text-gray-500 text-sm">
                    ${
                      this.productForm.images && this.productForm.images.length > 0
                        ? `${this.productForm.images.length} ${this.productForm.images.length > 1 ? 'files' : 'file'} selected`
                        : 'No file chosen'
                    }
                  </span>
                </div>
              </div>
              <small class="text-gray-500 text-xs block mt-1">Dapat memilih lebih dari 1 file.</small>
            </div>
            
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1">Status</label>
              <select id="productStatus" class="w-full text-sm p-2 border border-gray-300 rounded-lg">
                <option value="aktif" ${this.productForm.status === 'aktif' ? 'selected' : ''}>Aktif</option>
                <option value="nonaktif" ${this.productForm.status === 'nonaktif' ? 'selected' : ''}>Nonaktif</option>
              </select>
            </div>
          </form>
        `,
        showCancelButton: true,
        cancelButtonText: 'Batal',
        confirmButtonText: title === 'Tambah Produk Baru' ? 'Tambah' : 'Simpan',
        focusConfirm: false,
        preConfirm: () => {
          // Get form values
          const category = document.getElementById('category').value
          const name = document.getElementById('productName').value
          const description = document.getElementById('description').value
          const stock = document.getElementById('stock').value
          const price = document.getElementById('price').value
          const status = document.getElementById('productStatus').value
          const productImage = document.getElementById('productImage').files

          // Validation
          if (!name || !description || !stock || !price) {
            Swal.showValidationMessage('Semua field harus diisi')
            return false
          }

          // Create array of image URLs
          let images = [...(this.productForm.images || [])]

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

          // Build product object
          const product = {
            id: this.productForm.id || Date.now(), // Use existing ID or create new one
            category,
            name,
            description,
            stock: parseInt(stock),
            price: parseInt(price),
            status,
            images,
          }

          return product
        },
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          if (this.productForm.id) {
            // Edit existing product
            const index = this.products.findIndex((p) => p.id === this.productForm.id)
            if (index !== -1) {
              this.products.splice(index, 1, result.value)
            }

            // Show success message
            this.showSuccessMessage('Produk berhasil diperbarui')
          } else {
            // Add new product
            this.products.push(result.value)

            // Show success message
            this.showSuccessMessage('Produk berhasil ditambahkan')
          }
        }
      })

      // Update file input display
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
                    ? `${fileCount} files selected`
                    : this.files[0].name
                  : 'No file chosen'
            }
          })
        }
      }, 100)
    },

    // Show Delete Confirmation Modal
    showDeleteConfirmationModal(product) {
      Swal.fire({
        title: 'Hapus Produk?',
        text: `Apakah Anda yakin ingin menghapus produk "${product.name}"?`,
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
      }).then((result) => {
        if (result.isConfirmed) {
          // Remove product from array
          this.products = this.products.filter((p) => p.id !== product.id)

          // Show success message
          this.showSuccessMessage('Produk berhasil dihapus')
        }
      })
    },

    // Show Status Change Confirmation Modal
    showStatusChangeModal(product, newStatus) {
      // Store original status in case user cancels
      const originalStatus = product.status

      Swal.fire({
        title: 'Ubah Status?',
        text: `Apakah Anda yakin ingin mengubah status produk "${product.name}" menjadi ${newStatus}?`,
        showCancelButton: true,
        confirmButtonText: 'Ya, Ubah',
        cancelButtonText: 'Batal',
      }).then((result) => {
        if (result.isConfirmed) {
          // Update product status
          product.status = newStatus

          // Show success message
          this.showSuccessMessage('Status produk berhasil diubah')
        } else {
          // Reset the select to original value
          setTimeout(() => {
            const selects = document.querySelectorAll('.status-dropdown')
            selects.forEach((select) => {
              if (select.parentNode.parentNode.getAttribute('data-id') === product.id) {
                select.value = originalStatus
              }
            })
          }, 100)
        }
      })
    },

    // Show Image Preview Modal with Slider for Multiple Images
    showImagePreviewModal(product) {
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

    // Show Success Message
    showSuccessMessage(message) {
      Swal.fire({
        title: 'Berhasil!',
        text: message,
        icon: 'success',
        confirmButtonText: 'OK',
      })
    },
  },
}
</script>

<style scoped></style>
