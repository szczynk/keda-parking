<template>
  <div class="card-body">
    <div class="row mb-2">
      <!-- Search -->
      <div class="my-1 col-12 col-md-2">
        <div id="tickets-table_filter" class="dataTables_filter">
          <b-form-input
            v-model="filter_.plat"
            type="search"
            placeholder="Plat..."
            class="form-control"
            debounce="1000"
          ></b-form-input>
        </div>
      </div>
      <div class="my-1 col-12 col-md-2">
        <div id="tickets-table_length" class="dataTables_length">
          <b-form-select
            v-model="filter_.tipe"
            :options="tipeOptions"
          ></b-form-select>
        </div>
      </div>
      <div class="my-1 col-12 col-md-2">
        <div id="tickets-table_filter" class="dataTables_filter">
          <b-form-input
            v-model="filter_.masuk"
            type="datetime-local"
            class="form-control"
            debounce="1000"
          ></b-form-input>
        </div>
      </div>
      <div class="my-1 col-12 col-md-2">
        <div id="tickets-table_filter" class="dataTables_filter">
          <b-form-input
            v-model="filter_.keluar"
            type="datetime-local"
            class="form-control"
            debounce="1000"
          ></b-form-input>
        </div>
      </div>
      <div class="my-1 col-12 col-md-2">
        <div id="tickets-table_filter" class="dataTables_filter">
          <b-form-input
            v-model="filter_.harga"
            type="search"
            placeholder="Harga..."
            class="form-control"
            debounce="1000"
          ></b-form-input>
        </div>
      </div>
      <!-- End search -->
      <div class="my-1 col-6 col-md-1">
        <div id="tickets-table_length" class="dataTables_length float-right">
          <label class="d-inline-flex align-items-center">
            <b-form-select
              v-model="perPage"
              :options="pageOptions"
            ></b-form-select>
          </label>
        </div>
      </div>
      <div class="my-1 col-6 col-md-1">
        <div class="float-right">
          <button type="button" class="btn mb-2 mb-sm-0" @click="reset">
            Reset
          </button>
        </div>
      </div>
    </div>

    <div class="table-responsive mb-0">
      <b-table
        ref="parkTable"
        table-class="table table-centered w-100"
        thead-tr-class="bg-light"
        responsive="sm"
        :busy.sync="isBusy"
        :items="parkData"
        :fields="fields"
        :per-page="perPage"
        :current-page="currentPage"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :filter="filter"
        :filter-included-fields="filterOn"
        show-empty
      >
        <template #cell(check)="data">
          <div class="custom-control custom-checkbox text-center">
            <input
              :id="`service-check-${data.item.id}`"
              type="checkbox"
              class="custom-control-input"
            />
            <label
              class="custom-control-label"
              :for="`service-check-${data.item.id}`"
            ></label>
          </div>
        </template>

        <template #cell(plat)="data">
          <h5 class="m-0 d-inline-block align-middle">
            {{ data.item.plat }}
          </h5>
        </template>

        <template #cell(tipe)="data">
          <h5 class="m-0 d-inline-block align-middle">
            {{ capitalizeFirstLetter(data.item.tipe) }}
          </h5>
        </template>

        <template #cell(masuk)="data">
          {{ $moment(data.item.masuk).format('ll') }}
          <small class="text-muted">{{
            $moment(data.item.masuk).format('LT')
          }}</small>
        </template>

        <template #cell(keluar)="data">
          {{ $moment(data.item.keluar).format('ll') }}
          <small class="text-muted">{{
            $moment(data.item.keluar).format('LT')
          }}</small>
        </template>

        <template #cell(harga)="data">
          Rp. {{ thousandSeparator(data.item.harga) }}
        </template>

        <template #cell(action)="data">
          <ul class="list-inline table-action m-0">
            <li class="list-inline-item">
              <nuxt-link
                :to="`/park/${data.item.id}/edit`"
                :event="''"
                class="action-icon"
                style="text-decoration: none !important"
              >
                Ubah
              </nuxt-link>
            </li>
            <li class="list-inline-item">
              <a
                href="javascript:void(0);"
                class="action-icon"
                style="text-decoration: none !important"
                @click.prevent="del(data.item.id)"
              >
                Hapus
              </a>
            </li>
          </ul>
        </template>
      </b-table>
    </div>
    <div class="row justify-content-end">
      <b-pagination
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        limit="4"
        class="pagination pagination-rounded my-0"
      ></b-pagination>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      isBusy: false,
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [1, 10, 25, 50, 100],
      filter_: {
        plat: null,
        tipe: null,
        masuk: null,
        keluar: null,
        harga: null,
      },
      filterOn: [],
      sortBy: 'createdAt',
      sortDesc: true,
      isLoading: false,
      tipeOptions: [
        { value: null, text: 'Tipe' },
        { value: 'mobil', text: 'Mobil' },
        { value: 'motor', text: 'Motor' },
      ],
      error: null,
    }
  },
  computed: {
    filter() {
      const { plat, tipe, masuk, keluar, harga } = this.filter_
      return {
        plat,
        tipe,
        masuk,
        keluar,
        harga,
      }
    },
    fields() {
      return [
        {
          key: 'check',
          label: '',
        },
        {
          key: 'plat',
          label: 'Plat',
          sortable: true,
        },
        {
          key: 'tipe',
          label: 'Tipe',
          sortable: true,
        },
        {
          key: 'masuk',
          label: 'Masuk',
          sortable: true,
        },
        {
          key: 'keluar',
          label: 'Keluar',
          sortable: true,
        },
        {
          key: 'harga',
          label: 'Harga',
          sortable: true,
        },
        'action',
      ]
    },
    queryKey() {
      let q = '&'

      const filterNotNull = Object.fromEntries(
        Object.entries(this.filter).filter(([_, v]) => v)
      )
      Object.keys(filterNotNull).forEach((key) => {
        const qKey = `${key}=${this.filter[key]}&`
        q += qKey
      })
      return q.slice(0, -1)
    },
  },
  methods: {
    async parkData(ctx) {
      this.isBusy = true
      try {
        const sortDesc = ctx.sortDesc ? 'desc' : 'asc'
        const sortBy = ctx.sortBy
          ? '&sortBy=' + ctx.sortBy + ':' + sortDesc
          : ''
        const response = await this.$axios.$get(
          `http://localhost:3001/api/parks?page=${ctx.currentPage}&limit=${ctx.perPage}${sortBy}${this.queryKey}`
        )
        this.isBusy = false
        this.totalRows = response.totalRows
        return response.rows
      } catch (error) {
        this.isBusy = false
        this.totalRows = 0
        return []
      }
    },
    reset() {
      this.sortBy = 'createdAt'
      this.sortDesc = true
      this.perPage = 10
      this.filter_ = {
        plat: null,
        tipe: null,
        masuk: null,
        keluar: null,
      }
      this.$refs.parkTable.refresh()
    },
    async del(id) {
      try {
        await this.$axios.$delete(`http://localhost:3001/api/parks/${id}`)
        this.$refs.parkTable.refresh()
      } catch (error) {
        this.error = error
      }
    },
    thousandSeparator(amount) {
      if (
        amount !== '' ||
        amount !== undefined ||
        amount !== 0 ||
        amount !== '0' ||
        amount !== null
      ) {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      } else {
        return amount
      }
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    },
  },
}
</script>
