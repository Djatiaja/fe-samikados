// StatusChangeModal.vue
<template>
  <!-- SweetAlert Custom Modal -->
</template>

<script>
import Swal from 'sweetalert2'

export default {
  name: 'StatusChangeModal',
  props: {
    orderNumber: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      default: '',
    },
    currentStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
    },
    confirmButtonText: {
      type: String,
      default: 'Ya',
    },
    cancelButtonText: {
      type: String,
      default: 'Batal',
    },
    additionalInfo: {
      type: String,
      default: '',
    },
  },
  methods: {
    show() {
      let modalHtml = `
        <p class='text-lg'>Apakah Anda yakin ingin mengubah status pesanan ${this.orderNumber} menjadi <span class="font-semibold">${this.newStatus}</span>?</p>
      `

      if (this.customerName) {
        modalHtml += `<p class='text-md mt-2'>Pesanan untuk: <span class="font-semibold">${this.customerName}</span></p>`
      }

      if (this.currentStatus) {
        modalHtml += `<p class='text-md mt-2'>Status saat ini: <span class="font-semibold">${this.currentStatus}</span></p>`
      }

      if (this.additionalInfo) {
        modalHtml += `<p class='text-sm mt-3'>${this.additionalInfo}</p>`
      }

      return Swal.fire({
        title: `<span class='text-xl font-bold'>Konfirmasi Perubahan Status</span>`,
        html: modalHtml,
        showCancelButton: true,
        confirmButtonText: this.confirmButtonText,
        cancelButtonText: this.cancelButtonText,
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white py-2 px-4 rounded-md mr-4',
          cancelButton: 'bg-gray-200 text-black py-2 px-4 rounded-md',
        },
      })
    },
  },
}
</script>
