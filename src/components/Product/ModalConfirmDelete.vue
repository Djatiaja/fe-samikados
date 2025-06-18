<template>
  <div></div>
</template>

<script>
import Swal from 'sweetalert2'

export default {
  name: 'ModalConfirmDelete',
  methods: {
    open(product) {
      Swal.fire({
        title: 'Hapus Produk?',
        text: `Apakah Anda yakin ingin menghapus produk "${product.name}"?`,
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        buttonsStyling: false,
        customClass: {
          confirmButton: 'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base',
          cancelButton: 'bg-gray-300 text-gray-700 px-4 py-2 w-40 rounded-lg text-sm sm:text-base',
          actions: 'flex justify-center space-x-6',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.$emit('confirm-delete')
        }
      })
    },
  },
}
</script>
