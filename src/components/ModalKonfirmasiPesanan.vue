<template>
  <Transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-[9999] overflow-y-auto">
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black/30 bg-opacity-50 transition-opacity"
      @click.self="handleClose"
    ></div>

    <!-- Modal Content -->
    <div class="flex min-h-screen items-center justify-center p-4" @click.self="handleClose">
      <div
        class="relative w-full max-w-4xl bg-white rounded-lg shadow-xl transform transition-all"
        @click.stop
      >
        <!-- Header -->
        <div class="bg-red-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h3 class="text-xl md:text-2xl font-bold">
            Konfirmasi Pesanan #{{ orderId }}
          </h3>
          <button
            @click="handleClose"
            class="text-white hover:text-gray-200 text-2xl font-bold"
            type="button"
          >
            &times;
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-6 text-center py-20">
          <div class="text-red-600 mb-4">
            <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <button
            @click="$emit('close')"
            class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md"
          >
            Tutup
          </button>
        </div>

        <!-- Content -->
        <div v-else-if="orderDetail" class="p-6 max-h-[70vh] overflow-y-auto">
          <!-- Customer Information -->
          <div class="mb-6 bg-gray-50 p-4 rounded-lg">
            <h4 class="font-semibold text-lg mb-3 pb-2 border-b border-gray-300">
              Informasi Pembeli
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Nama</label>
                <p class="mt-1 text-base">{{ orderDetail.user.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <p class="mt-1 text-base">{{ orderDetail.user.email }}</p>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Alamat</label>
                <p class="mt-1 text-base">{{ orderDetail.address }}</p>
              </div>
            </div>
          </div>

          <!-- Product Details -->
          <div class="mb-6">
            <h4 class="font-semibold text-lg mb-3 pb-2 border-b border-gray-300">
              Detail Produk ({{ orderDetail.order_detail.length }})
            </h4>

            <div
              v-for="item in orderDetail.order_detail"
              :key="item.id"
              class="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                <!-- Product Image & Info -->
                <div class="md:col-span-7">
                  <div class="flex gap-4">
                    <!-- Image -->
                    <div class="flex-shrink-0">
                      <img
                        v-if="item.product.thumbnail_url"
                        :src="item.product.thumbnail_url"
                        :alt="item.product.name"
                        class="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                      />
                      <div
                        v-else
                        class="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-lg flex items-center justify-center"
                      >
                        <span class="text-gray-400 text-xs">No Image</span>
                      </div>
                    </div>

                    <!-- Product Info -->
                    <div class="flex-1">
                      <h5 class="font-semibold text-base mb-2">{{ item.product.name }}</h5>
                      <div class="text-sm text-gray-600 space-y-1">
                        <p v-if="item.product_variant">
                          <span class="font-medium">Variasi:</span>
                          {{ item.product_variant.name }}
                        </p>
                        <p v-if="item.product_finishing">
                          <span class="font-medium">Finishing:</span>
                          {{ item.product_finishing.finishing.name }}
                        </p>
                        <p>
                          <span class="font-medium">Jumlah:</span> {{ item.quantity }}
                        </p>
                      </div>

                      <!-- File Attachments -->
                      <div v-if="item.files && item.files.length > 0" class="mt-3">
                        <p class="text-sm font-medium text-gray-700 mb-2">File Lampiran:</p>
                        <div class="space-y-2">
                          <div
                            v-for="file in item.files"
                            :key="file.id"
                            class="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200"
                          >
                            <div class="flex items-center space-x-2 flex-1 min-w-0">
                              <!-- Link Icon -->
                              <svg
                                v-if="file.link"
                                class="w-6 h-6 text-blue-600 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                                  clip-rule="evenodd"
                                />
                              </svg>
                              <!-- PDF Icon -->
                              <svg
                                v-else-if="file.file_type && file.file_type.includes('pdf')"
                                class="w-6 h-6 text-red-600 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                  clip-rule="evenodd"
                                />
                              </svg>
                              <!-- Image Icon -->
                              <svg
                                v-else-if="file.file_type && file.file_type.includes('image')"
                                class="w-6 h-6 text-green-600 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                  clip-rule="evenodd"
                                />
                              </svg>
                              <!-- Generic File Icon -->
                              <svg
                                v-else
                                class="w-6 h-6 text-gray-600 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                  clip-rule="evenodd"
                                />
                              </svg>
                              <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-900 truncate">
                                  {{ file.link ? (file.link.length > 40 ? file.link.substring(0, 40) + '...' : file.link) : file.file_name }}
                                </p>
                                <p v-if="file.file_type" class="text-xs text-gray-500">{{ file.file_type }}</p>
                                <p v-else-if="file.link" class="text-xs text-blue-600">Link URL</p>
                              </div>
                            </div>
                            <a
                              v-if="file.link"
                              :href="file.link"
                              target="_blank"
                              class="flex-shrink-0 text-blue-600 hover:text-blue-700 text-sm font-semibold ml-2"
                            >
                              Buka Link
                            </a>
                            <a
                              v-else
                              :href="getFileUrl(file)"
                              target="_blank"
                              :download="file.file_name"
                              class="flex-shrink-0 text-red-600 hover:text-red-700 text-sm font-semibold ml-2"
                            >
                              Lihat
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Price Editing -->
                <div class="md:col-span-5">
                  <div class="bg-white p-3 rounded-lg border border-gray-200">
                    <div class="mb-3">
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Harga Awal
                      </label>
                      <p class="text-base text-gray-600">
                        {{ formatCurrency(item.subtotal_buy_price) }}
                      </p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Harga Final
                        <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        v-model.number="editedPrices[item.id]"
                        @input="validatePrice(item.id)"
                        min="0"
                        step="1000"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                        :class="{
                          'border-red-500': priceErrors[item.id],
                          'border-green-500':
                            !priceErrors[item.id] &&
                            editedPrices[item.id] !== item.subtotal_price,
                        }"
                      />
                      <p v-if="priceErrors[item.id]" class="text-red-500 text-xs mt-1">
                        {{ priceErrors[item.id] }}
                      </p>
                      <p class="text-sm text-gray-500 mt-1">
                        {{ formatCurrency(editedPrices[item.id] || 0) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-300">
            <h4 class="font-semibold text-lg mb-3">Ringkasan Pesanan</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-base">
                <span>Subtotal:</span>
                <span class="font-medium">{{ formatCurrency(calculatedSubtotal) }}</span>
              </div>
              <div class="flex justify-between text-base">
                <span>Biaya Aplikasi:</span>
                <span class="font-medium">{{ formatCurrency(orderDetail.application_fee) }}</span>
              </div>
              <div class="border-t border-gray-300 pt-2 mt-2">
                <div class="flex justify-between text-lg font-bold">
                  <span>Grand Total:</span>
                  <span class="text-red-600">{{ formatCurrency(calculatedGrandTotal) }}</span>
                </div>
              </div>
            </div>

            <!-- Show price change indicator -->
            <div
              v-if="hasChanges"
              class="mt-3 p-2 bg-yellow-50 border border-yellow-300 rounded text-sm text-yellow-800"
            >
              <span class="font-medium">⚠️ Perhatian:</span> Harga telah dimodifikasi dari harga
              awal
            </div>
          </div>

          <!-- Additional Info -->
          <div v-if="orderDetail.additional_info" class="mt-4 bg-blue-50 p-4 rounded-lg">
            <h5 class="font-semibold text-sm mb-2">Informasi Tambahan:</h5>
            <p class="text-sm text-gray-700">{{ orderDetail.additional_info }}</p>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-col sm:flex-row justify-end gap-3"
        >
          <button
            @click="handleClose"
            type="button"
            class="w-full sm:w-auto px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors"
            :disabled="loading"
          >
            Batal
          </button>
          <button
            @click="handleConfirm"
            type="button"
            class="w-full sm:w-auto px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading">Memproses...</span>
            <span v-else>Konfirmasi Pesanan</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  </Transition>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  name: 'ModalKonfirmasiPesanan',
  props: {
    orderId: {
      type: Number,
      required: true,
    },
    isOpen: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      orderDetail: null,
      editedPrices: {}, // Track edited prices { order_detail_id: price }
      priceErrors: {}, // Track validation errors { order_detail_id: error_message }
      error: null, // Track fetch errors
    }
  },
  computed: {
    /**
     * Calculate subtotal from all edited prices
     */
    calculatedSubtotal() {
      if (!this.orderDetail) return 0
      return Object.values(this.editedPrices).reduce((sum, price) => sum + (price || 0), 0)
    },

    /**
     * Calculate grand total (subtotal + application fee)
     */
    calculatedGrandTotal() {
      if (!this.orderDetail) return 0
      return this.calculatedSubtotal + (this.orderDetail.application_fee || 0)
    },

    /**
     * Check if any price has been changed
     */
    hasChanges() {
      if (!this.orderDetail) return false
      return this.orderDetail.order_detail.some(
        (item) => this.editedPrices[item.id] !== item.subtotal_price,
      )
    },

    /**
     * Validate form before submission
     */
    isFormValid() {
      // Check if there are any validation errors
      if (Object.keys(this.priceErrors).length > 0) {
        return Object.values(this.priceErrors).every((error) => !error)
      }
      // Check if all prices are valid (> 0)
      return Object.values(this.editedPrices).every((price) => price > 0)
    },
  },
  watch: {
    /**
     * Fetch order detail when modal is opened
     */
    isOpen: {
      immediate: true,
      handler(newVal) {
        console.log('Modal isOpen changed:', newVal, 'orderId:', this.orderId)
        if (newVal && this.orderId) {
          console.log('Fetching order detail...')
          this.fetchOrderDetail()
        }
      },
    },
  },
  methods: {
    /**
     * Fetch order detail from API
     */
    async fetchOrderDetail() {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Token autentikasi tidak ditemukan. Silakan login kembali.')
        }

        console.log('Fetching order detail for ID:', this.orderId)
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/v2/seller/orders/${this.orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        console.log('Order detail response:', response.data)

        if (response.data.status === 'success') {
          this.orderDetail = response.data.data

          // Initialize edited prices with current prices
          this.editedPrices = {}
          this.priceErrors = {}
          this.orderDetail.order_detail.forEach((item) => {
            this.editedPrices[item.id] = item.subtotal_price
          })
        } else {
          throw new Error('Gagal memuat detail pesanan')
        }
      } catch (error) {
        console.error('Error fetching order detail:', error)
        this.error = error.response?.data?.message || error.message || 'Gagal memuat detail pesanan'

        // Don't close modal, show error state instead
        // this.$emit('close')
      } finally {
        this.loading = false
      }
    },

    /**
     * Validate price input
     */
    validatePrice(orderDetailId) {
      const price = this.editedPrices[orderDetailId]

      if (!price || price <= 0) {
        this.priceErrors[orderDetailId] = 'Harga harus lebih dari 0'
      } else {
        this.priceErrors[orderDetailId] = null
      }
    },

    /**
     * Handle confirm button click
     */
    async handleConfirm() {
      // Final validation
      if (!this.isFormValid) {
        this.showErrorMessage('Mohon periksa kembali harga yang diinput.')
        return
      }

      // Prepare changed items
      const changedItems = []
      this.orderDetail.order_detail.forEach((item) => {
        if (this.editedPrices[item.id] !== item.subtotal_price) {
          changedItems.push({
            order_detail_id: item.id,
            subtotal_price: this.editedPrices[item.id],
          })
        }
      })

      // Show confirmation dialog
      const confirmMessage =
        changedItems.length > 0
          ? `<p>Pesanan akan dikonfirmasi dan status berubah menjadi <strong>"Diproses"</strong>.</p>
             <p class="text-yellow-600 mt-2">⚠️ Harga akan diperbarui.</p>
             <p class="mt-2">Lanjutkan?</p>`
          : `<p>Pesanan akan dikonfirmasi dan status berubah menjadi <strong>"Diproses"</strong>.</p>
             <p class="mt-2">Lanjutkan?</p>`

      const result = await Swal.fire({
        title: '<span class="text-xl font-bold">Konfirmasi</span>',
        html: confirmMessage,
        showCancelButton: true,
        confirmButtonText: 'Ya, Konfirmasi',
        cancelButtonText: 'Batal',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-md mr-2',
          cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-md',
          popup: 'swal-high-z-index',
        },
      })

      if (!result.isConfirmed) return

      this.loading = true
      try {
        // Step 1: Update prices if changed
        if (changedItems.length > 0) {
          await this.updatePrice(changedItems)
        }

        // Step 2: Update status to 2 (Diproses)
        await this.updateStatus()

        // Step 3: Show success message
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Pesanan berhasil dikonfirmasi.',
          confirmButtonText: 'OK',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white py-2 px-6 rounded-md',
          },
        })

        // Step 4: Emit success and close modal
        this.$emit('confirmed', this.orderId)
        this.$emit('close')
      } catch (error) {
        console.error('Error confirming order:', error)
        this.showErrorMessage('Gagal mengkonfirmasi pesanan. Silakan coba lagi.')
      } finally {
        this.loading = false
      }
    },

    /**
     * Update order prices via API
     */
    async updatePrice(orderDetails) {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/v2/seller/orders/${this.orderId}/update-price`,
        { order_details: orderDetails },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.status !== 'success') {
        throw new Error('Failed to update price')
      }
    },

    /**
     * Update order status to "Diproses" (ID: 5)
     */
    async updateStatus() {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/v2/seller/orders/${this.orderId}/status`,
        { order_status_id: 5 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.status !== 'success') {
        throw new Error('Failed to update status')
      }
    },

    /**
     * Handle modal close
     */
    handleClose() {
      if (this.hasChanges && !this.loading) {
        Swal.fire({
          title: 'Perubahan Belum Disimpan',
          text: 'Anda memiliki perubahan yang belum disimpan. Yakin ingin menutup?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Ya, Tutup',
          cancelButtonText: 'Batal',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md mr-2',
            cancelButton: 'bg-gray-200 text-gray-800 py-2 px-4 rounded-md',
          },
        }).then((result) => {
          if (result.isConfirmed) {
            this.$emit('close')
          }
        })
      } else {
        this.$emit('close')
      }
    },



    /**
     * Get full file URL or link
     */
    getFileUrl(file) {
      // If it's a link, return the link directly
      if (file.link) {
        return file.link
      }
      // Use file_url from API response
      if (file.file_url) {
        return file.file_url
      }
      return '#'
    },

    /**
     * Format number to Indonesian Rupiah
     */
    formatCurrency(amount) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount || 0)
    },

    /**
     * Show error message
     */
    showErrorMessage(message) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'OK',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md',
        },
      })
    },
  },
}
</script>

<style scoped>
/* Ensure modal is above all other elements */
.fixed {
  z-index: 9999 !important;
}

/* Modal container should be above overlay */
.flex.min-h-screen {
  position: relative;
  z-index: 10000;
}

/* Smooth transitions */
.transition-opacity {
  transition: opacity 0.3s ease-in-out;
}

.transform {
  transition: transform 0.3s ease-in-out;
}

/* Custom scrollbar for modal content */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .max-w-4xl {
    max-width: 95%;
  }
}

/* Vue Transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative {
  transform: scale(0.9);
}
</style>

<style>
/* Global style for SweetAlert to appear above modal */
.swal-high-z-index {
  z-index: 20000 !important;
}

.swal2-container {
  z-index: 20000 !important;
}
</style>
