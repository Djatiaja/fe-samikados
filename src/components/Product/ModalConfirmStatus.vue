<template>
  <div></div>
</template>

<script>
import Swal from 'sweetalert2'

export default {
  name: 'ModalConfirmStatus',
  methods: {
    open(product, newStatus) {
      Swal.fire({
        title: 'Ubah Status?',
        text: `Apakah Anda yakin ingin mengubah status produk "${product.name}" menjadi ${newStatus}?`,
        showCancelButton: true,
        confirmButtonText: 'Ya, Ubah',
        cancelButtonText: 'Batal',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base',
          cancelButton: 'bg-gray-300 text-gray-700 px-4 py-2 w-40 rounded-lg text-sm sm:text-base',
          actions: 'flex justify-center space-x-6',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.$emit('confirm-status-change', newStatus)
        } else {
          this.$emit('cancel-status-change')
        }
      })
    },
  },
}
</script>
