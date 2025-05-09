<template>
  <div></div>
</template>

<script>
import ModalAddProduct from './ModalAddProduct.vue'

export default {
  name: 'ModalEditProduct',
  extends: ModalAddProduct,
  methods: {
    open(product) {
      this.showProductModal('Edit Produk', JSON.parse(JSON.stringify(product)))
    },
  },
}
</script>
