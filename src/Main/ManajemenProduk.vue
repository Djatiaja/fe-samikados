<template>
  <div class="flex flex-col min-h-screen">
    <!-- Overlay -->
    <div
      v-if="isSidebarActive && isMobile"
      class="fixed inset-0 bg-opacity-20 z-20"
      @click="toggleSidebar"
    ></div>

    <!-- Header -->
    <HeaderSeller @toggle-sidebar="toggleSidebar" :showSearch="true">
      <template #search>
        <div class="relative w-full">
          <input
            v-model="searchQuery"
            placeholder="Cari nama produk atau SKU..."
            class="w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 bg-white text-black"
            @input="debouncedSearch"
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
        <h2 class="text-2xl md:text-3xl lg:text-3xl font-bold mb-6 mt-12 lg:mt-3">
          Manajemen Produk
        </h2>

        <div class="flex justify-between items-center mb-4">
          <!-- Filter Dropdown -->
          <select
            v-model="statusFilter"
            @change="fetchProducts"
            class="block w-60 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">Semua</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <button
            @click="showAddProductModal"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <span class="mr-2">+</span> Tambah Produk
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

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center">
          <div class="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
        </div>

        <!-- Product Table Component -->
        <ProductTable
          v-else
          :products="filteredProducts"
          @edit-product="handleEditProduct"
          @delete-product="handleDeleteProduct"
          @change-status="handleStatusChange"
          @preview-image="handleImagePreview"
        />

        <!-- Pagination Controls -->
        <div class="flex justify-between items-center mt-4">
          <button
            :disabled="pagination.page === 1"
            @click="pagination.page--; fetchProducts()"
            class="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {{ pagination.page }} of {{ Math.ceil(pagination.total / pagination.limit) }}</span>
          <button
            :disabled="pagination.page * pagination.limit >= pagination.total"
            @click="pagination.page++; fetchProducts()"
            class="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <FooterSeller />

    <!-- Modal Components -->
    <ModalAddProduct ref="addProductModal" @save-product="handleSaveProduct" />
    <ModalEditProduct ref="editProductModal" @save-product="handleUpdateProduct" />
    <ModalProductImage ref="imagePreviewModal" />
    <ModalConfirmStatus
      ref="confirmStatusModal"
      @confirm-status-change="handleConfirmStatusChange"
    />
    <ModalConfirmDelete ref="confirmDeleteModal" @confirm-delete="handleConfirmDelete" />
  </div>
</template>

<script>
import { debounce } from 'lodash';
import HeaderSeller from '@/components/HeaderSeller.vue';
import SidebarSeller from '@/components/SidebarSeller.vue';
import FooterSeller from '@/components/FooterSeller.vue';
import ProductTable from '../components/Product/ProductTable.vue';
import ModalAddProduct from '../components/Product/ModalAddProduct.vue';
import ModalEditProduct from '../components/Product/ModalEditProduct.vue';
import ModalProductImage from '../components/Product/ModalProductImage.vue';
import ModalConfirmStatus from '../components/Product/ModalConfirmStatus.vue';
import ModalConfirmDelete from '../components/Product/ModalConfirmDelete.vue';
import Swal from 'sweetalert2';
import axios from 'axios';

export default {
  components: {
    HeaderSeller,
    SidebarSeller,
    FooterSeller,
    ProductTable,
    ModalAddProduct,
    ModalEditProduct,
    ModalProductImage,
    ModalConfirmStatus,
    ModalConfirmDelete,
  },
  data() {
    return {
      isSidebarActive: false,
      isMobile: window.innerWidth < 1024,
      statusFilter: 'all',
      entriesPerPage: 25,
      searchQuery: '',
      currentProduct: null,
      products: [],
      categories: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 25,
      },
      isLoading: false,
    };
  },
  computed: {
    filteredProducts() {
      let filtered = this.products;
      if (this.statusFilter !== 'all') {
        filtered = filtered.filter(p => p.status === this.statusFilter);
      }
      if (this.searchQuery) {
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          p.sku?.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      return filtered;
    },
  },
  mounted() {
    this.isSidebarActive = window.innerWidth >= 1024;
    window.addEventListener('resize', this.handleResize);
    this.fetchCategories();
    this.fetchProducts();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    debouncedSearch: debounce(function () {
      this.pagination.page = 1;
      this.fetchProducts();
    }, 300),
    async fetchCategories() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/seller/category', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        this.categories = response.data.data;
        localStorage.setItem('categories', JSON.stringify(this.categories));
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Gagal mengambil kategori',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        });
      } finally {
        this.isLoading = false;
      }
    },
    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId);
      return category ? category.name : 'Tidak Diketahui';
    },
    async fetchVariants(productId) {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/seller/product/variant', {
          params: { product_id: productId },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        return response.data.data.map(variant => ({
          id: variant.id,
          name: variant.name,
          price: variant.price,
          stock: variant.stock,
          weight: variant.weight,
          is_default: variant.is_default,
        }));
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Gagal mengambil varian',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        });
        return [];
      }
    },
    async fetchFinishing(productId) {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/seller/product/finishing', {
          params: { product_id: productId },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        return response.data.data.map(finishing => ({
          id: finishing.id,
          name: finishing.finishing.name,
          price: finishing.price,
          finishing_id: finishing.finishing_id,
        }));
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Gagal mengambil opsi finishing',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        });
        return [];
      }
    },
    async fetchProducts() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/seller/products', {
          params: {
            status: this.statusFilter === 'all' ? undefined : this.statusFilter === 'active' ? 1 : 0,
            search: this.searchQuery,
            limit: this.entriesPerPage,
            page: this.pagination.page,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        const { data: { products }, meta } = response.data.data;
        this.products = await Promise.all(products.map(async product => {
          const [variants, finishing] = await Promise.all([
            this.fetchVariants(product.id),
            this.fetchFinishing(product.id),
          ]);
          return {
            id: product.id,
            sku: product.sku,
            category: this.getCategoryName(product.category_id),
            category_id: product.category_id,
            name: product.name,
            description: product.description,
            stock_total: parseInt(product.stock_total, 10) || 0, // Use stock_total instead of unit
            unit: product.unit || 'pack',
            price: product.price || 0,
            weight: product.weight || 0,
            min_qty: product.min_qty || null,
            images: [product.thumbnail_url || 'https://placehold.co/1000x1000'],
            status: product.is_publish ? 'aktif' : 'nonaktif',
            variant_count: variants.length, // Number of variants
            finishing_count: finishing.length, // Number of finishing options
            variations: variants,
            additionalOptions: finishing,
          };
        }));
        this.pagination = {
          total: meta.total,
          page: meta.page,
          limit: meta.limit,
        };
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Gagal mengambil produk',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        });
      } finally {
        this.isLoading = false;
      }
    },
    toggleSidebar() {
      if (this.isMobile) {
        this.isSidebarActive = !this.isSidebarActive;
      }
    },
    handleResize() {
      this.isMobile = window.innerWidth < 1024;
      this.isSidebarActive = !this.isMobile;
    },
    changeEntriesPerPage() {
      this.pagination.limit = parseInt(this.entriesPerPage);
      this.pagination.page = 1;
      this.fetchProducts();
    },
    showAddProductModal() {
      this.$refs.addProductModal.open({ categories: this.categories });
    },
    async handleEditProduct(product) {
      this.currentProduct = product;
      this.isLoading = true;
      try {
        const [variations, additionalOptions] = await Promise.all([
          this.fetchVariants(product.id),
          this.fetchFinishing(product.id),
        ]);
        const updatedProduct = { ...product, variations, additionalOptions };
        this.$refs.editProductModal.open(updatedProduct, this.categories);
      } finally {
        this.isLoading = false;
      }
    },
    handleDeleteProduct(product) {
      this.currentProduct = product;
      this.$refs.confirmDeleteModal.open(product);
    },
    handleStatusChange(product, newStatus) {
      this.currentProduct = product;
      this.$refs.confirmStatusModal.open(product, newStatus);
    },
    async handleImagePreview(product) {
      this.isLoading = true;
      try {
        const [variations, additionalOptions] = await Promise.all([
          this.fetchVariants(product.id),
          this.fetchFinishing(product.id),
        ]);
        const updatedProduct = { ...product, variations, additionalOptions };
        this.$refs.imagePreviewModal.open(updatedProduct);
      } finally {
        this.isLoading = false;
      }
    },
    async handleSaveProduct(newProduct) {
  if (!newProduct.name || !newProduct.description || !newProduct.unit) {
    Swal.fire({
      title: 'Error!',
      text: 'Nama, deskripsi, dan unit wajib diisi',
      icon: 'error',
      timer: 1500,
      showConfirmButton: false,
    });
    return;
  }

  this.isLoading = true;
  try {
    const payload = {
      category_id: newProduct.category_id,
      name: newProduct.name,
      description: newProduct.description,
      unit: newProduct.unit,
      is_publish: newProduct.is_publish,
      product_variants: newProduct.product_variants.map((variant) => ({
        name: variant.name,
        price: variant.price,
        stock: variant.stock,
        weight: variant.weight,
        min_qty: variant.min_qty,
        is_default: variant.is_default,
      })),
      product_finishing: newProduct.product_finishing.map((finishing) => ({
        name: finishing.name,
        price: finishing.price,
        color_code: finishing.color_code,
      })),
    };

    const response = await axios.post(
      'http://127.0.0.1:8000/api/seller/products',
      payload,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      },
    );

    const product = response.data.data;
    thisI8n(this.products, {
      id: product.id,
      sku: product.sku,
      category: this.getCategoryName(product.category_id),
      category_id: product.category_id,
      name: product.name,
      description: product.description,
      unit: product.unit,
      stock_total: parseInt(product.stock_total, 10) || 0,
      is_publish: product.is_publish ? 1 : 0,
      images: [product.thumbnail || 'https://placehold.co/1000x1000'],
      status: product.is_publish ? 'aktif' : 'nonaktif',
      variant_count: newProduct.product_variants.length,
      finishing_count: newProduct.product_finishing.length,
      variations: newProduct.product_variants,
      additionalOptions: newProduct.product_finishing,
    });

    this.showSuccessMessage('Produk berhasil ditambahkan');
    this.fetchProducts(); // Refresh product list
  } catch (error) {
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.message || 'Gagal menambah produk',
      icon: 'error',
      timer: 1500,
      showConfirmButton: false,
    });
  } finally {
    this.isLoading = false;
  }
},
    async handleUpdateProduct(updatedProduct) {
      if (!updatedProduct.name || !updatedProduct.price) {
        Swal.fire({
          title: 'Error!',
          text: 'Nama dan harga produk wajib diisi',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        });
        return;
      }

      this.isLoading = true;
      try {
        const token = localStorage.getItem('token');
        const originalProduct = this.products.find(p => p.id === updatedProduct.id);

        const productPayload = {
          id: updatedProduct.id,
        };

        if (updatedProduct.category !== originalProduct.category) {
          productPayload.category_id = this.categories.find(cat => cat.name === updatedProduct.category)?.id || 1;
        }
        if (updatedProduct.name !== originalProduct.name) {
          productPayload.name = updatedProduct.name;
        }
        if (updatedProduct.description !== originalProduct.description) {
          productPayload.description = updatedProduct.description;
        }
        if (updatedProduct.unit !== originalProduct.unit) {
          productPayload.unit = updatedProduct.unit || 'pack';
        }
        if (updatedProduct.stock_total !== originalProduct.stock_total) { // Use stock_total
          productPayload.stock_total = updatedProduct.stock_total || 0;
        }
        if (updatedProduct.status !== originalProduct.status) {
          productPayload.is_publish = updatedProduct.status === 'active' ? 1 : 0;
        }
        if (updatedProduct.images[0] !== originalProduct.images[0]) {
          productPayload.thumbnail = updatedProduct.images[0] || 'https://placehold.co/1000x1000';
        }

        if (Object.keys(productPayload).length > 1 || updatedProduct.variations.length || updatedProduct.additionalOptions.length) {
          const productResponse = await axios.post(
            `http://127.0.0.1:8000/api/seller/product/update`,
            productPayload,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const variantPromises = updatedProduct.variations.map(variant => {
            const originalVariant = originalProduct.variations.find(v => v.id === variant.id) || {};
            const variantPayload = {
              product_id: updatedProduct.id,
              name: variant.name,
              price: variant.price,
              stock: variant.stock,
              weight: variant.weight,
              is_default: variant.isDefault ? 1 : 0,
            };

            if (
              variant.id &&
              (variant.name !== originalVariant.name ||
                variant.price !== originalVariant.price ||
                variant.stock !== originalVariant.stock ||
                variant.weight !== originalVariant.weight ||
                variant.isDefault !== originalVariant.isDefault)
            ) {
              return axios.post(
                'http://127.0.0.1:8000/api/seller/product/variant/update',
                { id: variant.id, ...variantPayload },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            } else if (!variant.id) {
              return axios.post(
                'http://127.0.0.1:8000/api/seller/product/variant',
                variantPayload,
                { headers: { Authorization: `Bearer ${token}` } }
              );
            }
            return Promise.resolve();
          });

          const finishingPromises = updatedProduct.additionalOptions.map(option => {
            const originalOption = originalProduct.additionalOptions.find(o => o.id === option.id) || {};
            const finishingPayload = {
              product_id: updatedProduct.id,
              name: option.name,
              price: option.price,
            };

            if (
              option.id &&
              (option.name !== originalOption.name ||
                option.price !== originalOption.price)
            ) {
              return axios.post(
                'http://127.0.0.1:8000/api/seller/product/finishing/update',
                { id: option.id, ...finishingPayload },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            } else if (!option.id) {
              return axios.post(
                'http://127.0.0.1:8000/api/seller/product/finishing',
                finishingPayload,
                { headers: { Authorization: `Bearer ${token}` } }
              );
            }
            return Promise.resolve();
          });

          const deletedVariants = originalProduct.variations.filter(
            original => !updatedProduct.variations.some(v => v.id === original.id)
          );
          const deletedFinishing = originalProduct.additionalOptions.filter(
            original => !updatedProduct.additionalOptions.some(o => o.id === original.id)
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

          const index = this.products.findIndex(p => p.id === updatedProduct.id);
          if (index !== -1) {
            this.products.splice(index, 1, {
              ...productResponse.data.data,
              category: this.getCategoryName(productResponse.data.data.category_id),
              category_id: productResponse.data.data.category_id,
              status: productResponse.data.data.is_publish ? 'active' : 'inactive',
              stock_total: parseInt(productResponse.data.data.stock_total, 10), // Use stock_total
              unit: productResponse.data.data.unit,
              images: [productResponse.data.data.thumbnail],
              variant_count: updatedProduct.variations.length, // Update variant_count
              finishing_count: updatedProduct.additionalOptions.length, // Update finishing_count
              variations: updatedProduct.variations,
              additionalOptions: updatedProduct.additionalOptions,
            });
            this.showSuccessMessage('Produk berhasil diperbarui');
          }
        } else {
          this.showSuccessMessage('Tidak ada perubahan pada produk');
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Gagal memperbarui produk',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        });
      } finally {
        this.isLoading = false;
      }
    },
    async handleConfirmDelete() {
      this.isLoading = true;
      try {
        await axios.delete(`http://127.0.0.1:8000/api/seller/products/${this.currentProduct.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        this.products = this.products.filter(p => p.id !== this.currentProduct.id);
        this.showSuccessMessage('Produk berhasil dihapus');
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Gagal menghapus produk',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        });
      } finally {
        this.isLoading = false;
      }
    },
    async handleConfirmStatusChange(newStatus) {
      this.isLoading = true;
      try {
        const isPublish = newStatus === 'active' ? 1 : 0;
        await axios.patch(
          `http://127.0.0.1:8000/api/seller/products/${this.currentProduct.id}/status`,
          { is_publish: isPublish },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        const product = this.products.find(p => p.id === this.currentProduct.id);
        if (product) {
          product.status = newStatus;
          this.showSuccessMessage('Status produk berhasil diubah');
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Gagal memperbarui status',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
        });
      } finally {
        this.isLoading = false;
      }
    },
    showSuccessMessage(message) {
      Swal.fire({
        title: 'Berhasil!',
        text: message,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    },
  },
};
</script>
