<template>
  <!-- Sweet ALert Custom Modal -->
</template>

<script>
import Swal from 'sweetalert2'

export default {
  name: 'OrderDetailModal',
  props: {
    orderNumber: {
      type: String,
      required: true,
    },
    kategori: {
      type: String,
    },
    namaProduk: {
      type: String,
    },
    catatan: {
      type: String,
    },
    ukuran: {
      type: String,
    },
    finishing: {
      type: String,
    },
    jumlah: {
      type: [String, Number],
    },
  },
  methods: {
    show() {
      return Swal.fire({
        title: `<span class='text-xl sm:text-2xl font-bold'>Detail Pesanan ${this.orderNumber}</span>`,
        html: `
            <div class="grid grid-cols-[120px_10px_auto] gap-y-2 sm:gap-y-4 text-left text-lg px-4 sm:px-6">
              <div class="font-semibold">Kategori</div> <div class="text-center">:</div> <div class="ml-4">${this.kategori}</div>
              <div class="font-semibold">Nama Produk</div> <div class="text-center">:</div> <div class="ml-4">${this.namaProduk}</div>
              <div class="font-semibold">Catatan</div> <div class="text-center">:</div> <div class="ml-4">${this.catatan}</div>
              <div class="font-semibold">Ukuran</div> <div class="text-center">:</div> <div class="ml-4">${this.ukuran}</div>
              <div class="font-semibold">Finishing</div> <div class="text-center">:</div> <div class="ml-4">${this.finishing}</div>
              <div class="font-semibold">Jumlah</div> <div class="text-center">:</div> <div class="ml-4">${this.jumlah}</div>
            </div>
          `,
        confirmButtonText: 'Tutup',
        buttonsStyling: false,
        customClass: {
          confirmButton:
            'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
        },
      })
    },
  },
}
</script>
