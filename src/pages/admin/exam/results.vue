<template>
  <v-container>
    <v-row>
      <v-col
        md="4"
        sm="4"
        cols="12"
      >
        <div class="form-group m-form__group ">
          <v-select
            v-model="selectedGender"
            :items="genders"
            label="جنسیت"
            item-text="title"
            item-value="title"
          />
        </div>
      </v-col>
      <v-col
        md="4"
        sm="4"
        cols="12"
      >
        <div class="form-group m-form__group ">
          <v-autocomplete
            v-model="selectedProvince"
            label="استان"
            :items="provinces"
            item-text="title"
            item-value="title"
            no-data-text="داده ای یافت نشد"
          />
        </div>
      </v-col>
      <v-col
        md="4"
        sm="4"
        cols="12"
      >
        <div class="form-group m-form__group">
          <v-autocomplete
            v-model="selectedCity"
            label="شهر"
            :items="citiesForSelectedProvince"
            item-text="title"
            item-value="title"
            no-data-text="داده ای یافت نشد"
          />
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        md="4"
        sm="4"
        cols="12"
        class="filter-btn"
      >
        <v-btn
          color="primary"
          block
          class="my-5"
          @click="DoFilter"
        >
          فیلتر
        </v-btn>
      </v-col>
      <v-col
        md="4"
        sm="4"
        cols="12"
        class="filter-btn"
      >
        <v-btn
          color="orange"
          dark
          block
          class="my-5"
          :loading="fileLoading"
          @click="getExcel"
        >
          تولید Excel
        </v-btn>
      </v-col>
      <v-col
        md="4"
        sm="4"
        cols="12"
        class="filter-btn"
      >
        <v-btn
          color="yellow"
          block
          class="my-5"
          :disabled="!file_url"
        >
          <a
            :href="file_url"
            :style="{ 'text-decoration': 'none', color: '#000', width: '100%' }"
            target="_blank"
            :disabled="!file_url"
          >
            دانلود Excel
          </a>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card>
          <v-tabs
            v-model="tabs"
            background-color="deep-purple accent-4"
            centered
            dark
          >
            <v-tabs-slider />
            <v-tab href="#tab-1">
              کارنامه رتبه محور
            </v-tab>
            <v-tab href="#tab-2">
              کارنامه درس محور
            </v-tab>
            <v-tabs-items v-model="tabs">
              <v-tab-item value="tab-1">
                <v-col>
                  <v-simple-table
                    dense
                    fixed-header
                    height="calc( 100vh - 100px )"
                  >
                    <template v-slot:default>
                      <thead v-if="results[0]">
                        <tr>
                          <th colspan="5" />
                          <th
                            v-for="(item, index) in results[0].sub_category"
                            :key="'headTitle_'+item.sub_category_order+'_'+index"
                            colspan="3"
                            class="text-center"
                          >
                            {{ item.sub_category }}
                          </th>
                        </tr>
                        <tr>
                          <th>
                            رتبه کشوری
                          </th>
                          <th>
                            نام و نام خانوادگی
                          </th>
                          <th>
                            شماره همراه
                          </th>
                          <th>
                            استان
                          </th>
                          <th>
                            شهر
                          </th>
                          <th>
                            مشاهده کارنامه
                          </th>
                          <template
                            v-for="(item, index) in results[0].sub_category"
                          >
                            <th
                              :key="'headColumns_percent_'+item.sub_category_order + '-' + index"
                              class="bordered-right"
                            >
                              درصد
                            </th>
                            <th :key="'headColumns_taraz_'+item.sub_category_order + '-' + index">
                              تراز
                            </th>
                            <th
                              :key="'headColumns_rank_'+item.sub_category_order + '-' + index"
                              class="bordered-left"
                            >
                              رتبه
                            </th>
                          </template>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="item in results"
                          :key="item.name"
                        >
                          <td>{{ item.main.rank_country }}</td>
                          <td>
                            <span v-if="item.user">
                              {{ item.user.first_name }} {{ item.user.last_name }}
                            </span>
                            <span v-else> - </span>
                          </td>
                          <td>{{ item.user.mobile }}</td>
                          <td>{{ item.location.province }}</td>
                          <td>{{ item.location.city }}</td>
                          <td>
                            <v-tooltip top>
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                  icon
                                  :to="{name: 'user.exam.results', params: {exam_id: item.exam_id, user_exam_id: item.exam_user_id}}"
                                  color="cyan"
                                  v-bind="attrs"
                                  v-on="on"
                                >
                                  <v-icon>mdi-eye-circle-outline</v-icon>
                                </v-btn>
                              </template>
                              <span>مشاهده کارنامه</span>
                            </v-tooltip>
                          </td>
                          <template
                            v-for="(sub_categoryItem, sub_categoryIndex) in item.sub_category"
                          >
                            <td
                              :key="'bodyColumns_percent_'+sub_categoryItem.sub_category_order+sub_categoryIndex+'_'+item.exam_user_id"
                              class="bordered-right"
                            >
                              {{ sub_categoryItem.percent }}
                            </td>
                            <td :key="'bodyColumns_taraz_'+sub_categoryItem.sub_category_order+sub_categoryIndex+'_'+item.exam_user_id">
                              {{ sub_categoryItem.taraaz }}
                            </td>
                            <td
                              :key="'bodyColumns_rank_'+sub_categoryItem.sub_category_order+sub_categoryIndex+'_'+item.exam_user_id"
                              class="bordered-left"
                            >
                              {{ sub_categoryItem.rank_country }}
                            </td>
                          </template>
                        </tr>
                      </tbody>
                      <infinite-loading
                        :key="lastLoadTime"
                        @infinite="getData"
                      />
                    </template>
                  </v-simple-table>
                </v-col>
              </v-tab-item>
              <v-tab-item value="tab-2">
                <v-data-table
                  :headers="lessonsResultsHeaders"
                  :items="lessonsResults"
                  :items-per-page="9999"
                  hide-default-footer
                />
              </v-tab-item>
            </v-tabs-items>
          </v-tabs>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import API_ADDRESS from '@/api/Addresses'
  import InfiniteLoading from 'vue-infinite-loading'

  export default {
    name: 'Results',
    components: {
      InfiniteLoading,
    },
    data: () => {
      return {
        selectedProvince: null,
        selectedCity: null,
        selectedGender :null,
        provinces: [],
        genders: [],
        cities: [],
        results: [],
        lessonsResults: [],
        lessonsResultsHeaders: [
              { text: 'نام درس', value: 'sub_category'},
              { text: 'میانگین درصد', value: 'mean'},
              { text: 'میانگین درصد نفرات برتر', value: 'top_sub_category_participants_mean'},
              { text: 'بالاترین درصد', value: 'best_percent'},
              { text: 'کمترین درصد در میان نفرات برتر', value: 'worst_percent'},
              // { text: 'میانگین تراز', value: ''},
          ],
        lastLoadTime: Date.now(),
        nextPage: '',
        tabs: 'tab-1',
        file_url: '',
        fileLoading: false,
      }
    },
    computed:{
      citiesForSelectedProvince() {
        if (this.selectedProvince) {
          return this.cities.filter(item => item.province.title === this.selectedProvince)
        }
        return []
      }
    },
    mounted: function () {
      this.getFiltersData()
      // this.getData()
    },
    methods: {
      getParams () {
        let params = {
          ...(this.selectedCity && {"city": [this.selectedCity]}),
          ...(this.selectedProvince&& {"province": [this.selectedProvince]}),
          ...(this.selectedGender && {"gender": [this.selectedGender]}),
          exam_id: this.$route.params.examId
        }

        return params
      },
      getExcel () {
        let that = this
        this.fileLoading = true
        let params = this.getParams()
        params.excel_export = 1
        this.$notify({
          group: 'notifs',
          title: 'توجه!',
          text: 'فایل Excel در حال تولید است.',
          type: 'success'
        })
        axios.get(API_ADDRESS.exam.examReportIndex('participants'), {
          params: params
        })
            .then( response => {
              that.file_url = response.data.data.export_file_url
              that.fileLoading = false
            })
      },
      getFiltersData() {
        this.showLoading()
        axios.get(API_ADDRESS.user.formData)
            .then((resp) => {
              this.genders = resp.data.data.genders
              this.provinces = resp.data.data.provinces
              this.cities = resp.data.data.cities
              this.hideLoading()
            })
            .catch(() => {
                  this.$notify({
                    group: 'notifs',
                    title: 'توجه!',
                    text: 'مشکلی در گرفتن اطلاعات رخ داده است. لطفا دوباره امتحان کنید.',
                    type: 'error'
                  })
                  this.hideLoading()
                }
            )
      },
      getData ($state) {
        this.showLoading()
        let that = this
        axios.get(API_ADDRESS.exam.examReportIndex('participants') + that.nextPage, {
          params:{
            ...(that.selectedCity && {"city": [that.selectedCity]}),
            ...(that.selectedProvince&& {"province": [that.selectedProvince]}),
            ...(this.selectedGender && {"gender": [that.selectedGender]}),
            exam_id: that.$route.params.examId
          }
        })
        .then( response => {
          that.hideLoading()
          if (response.data.data){
            that.results = that.results.concat(response.data.data)
          }

          if(typeof response.data.links === 'undefined' || response.data.links.next === null) {
            that.nextPage = ''
           if($state) $state.complete()
            return
          }
          that.nextPage = response.data.links.next.replace(response.data.meta.path, '')
          that.lastLoadTime = Date.now()

        })
        .catch(error => {
          that.lastLoadTime = Date.now()
          that.hideLoading()
          console.log('error', error)
        })
        that.getLessonResultData ()
      },

      getLessonResultData (){
        if (!this.lessonsResults.length) {
          axios.get(API_ADDRESS.exam.examReportIndex('lessons'), {
            params: {
              exam_id: this.$route.params.examId
            }
          })
            .then((response) => {
              if (response.data.data){
              this.lessonsResults = response.data.data
              }
            })
        }
      },

      DoFilter (){
        this.results = []
        this.nextPage =''
        this.getData()
      },

      showLoading () {
        this.$store.commit('AppLayout/updateOverlay', { show: true, loading: true, text: ''})
      },

      hideLoading () {
        this.$store.commit('AppLayout/updateOverlay', { show: false, loading: false, text: ''})
      }
    }
  }
</script>


<style scoped>
.bordered-right {
    border-right: solid 1px #d7d7d7;
}
.bordered-left {
    border-left: solid 1px #d7d7d7;
}
.filter-btn{
  margin: auto;
}
</style>
