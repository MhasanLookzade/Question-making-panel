<template>
  <v-container class="register-video">
    <v-card
      max-width="800px"
      class="mx-auto"
    >
      <v-overlay
        v-if="loading"
        absolute
      >
        <v-progress-circular indeterminate />
      </v-overlay>
      <v-toolbar
        color="light-blue px-2"
        dark
      >
        <v-toolbar-title v-if="selectedSubCategory">
          {{ $route.params.exam_title + ': ' + selectedSubCategory.title }}
        </v-toolbar-title>

        <v-spacer />

        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              @click="addVideo"
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          <span>لینک جدید</span>
        </v-tooltip>
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              @click="saveVideos"
              v-on="on"
            >
              <v-icon>mdi-check</v-icon>
            </v-btn>
          </template>
          <span>ثبت</span>
        </v-tooltip>
      </v-toolbar>
      <v-list
        subheader
        two-line
      >
        <!--        <v-subheader inset>Folders</v-subheader>-->

        <v-list-item
          v-for="(item, index) in videos"
          :key="index"
        >
          <v-list-item-content>
            <v-text-field
              v-model="videos[index]"
              dir="ltr"
              outlined
              dense
              :style="{ 'max-width': '650px' }"
            />
          </v-list-item-content>

          <v-list-item-action>
            <div>
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    v-bind="attrs"
                    v-on="on"
                  >
                    <a
                      :href="item"
                      target="_blank"
                    >
                      <v-icon color="primary">
                        mdi-play-box-outline
                      </v-icon>
                    </a>
                  </v-btn>
                </template>
                <span>مشاهده کانتنت</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    v-bind="attrs"
                    @click="removeVideo(index)"
                    v-on="on"
                  >
                    <v-icon color="red">
                      mdi-close
                    </v-icon>
                  </v-btn>
                </template>
                <span>حذف لینک</span>
              </v-tooltip>
            </div>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>


    import {QuestSubcategoryList} from "@/models/QuestSubcategory";
    import API_ADDRESS from "@/api/Addresses";
    import axios from "axios";

    export default {
        name: 'SetVideo',
        data: () => {
            return {
              subCategoriesList: new QuestSubcategoryList(),
              loading: true,
              selectedSubCategory: null,
              videos: []
            }
        },
        watch: {

        },
        mounted() {
          this.selectedSubCategory = this.subCategoriesList.list.find(item => item.id === this.$route.params.subcategory_id)
          this.loadSubcategories()
          this.getCurrentVideos()
        },
        created() {
          this.loading = true
        },
        methods: {
          getCurrentVideos() {
            axios.get(API_ADDRESS.exam.getAnalysisVideo(this.$route.params.exam_id))
            .then(response => {
              this.selectedSubCategory = this.subCategoriesList.list.find(item => item.id === this.$route.params.subcategory_id)
              if (response.data.data.find(item => item.sub_category.id === this.selectedSubCategory.id).videos) {
                this.videos = response.data.data.find(item => item.sub_category.id === this.selectedSubCategory.id).videos
              }
            })
          },
          saveVideos() {
            axios.post(API_ADDRESS.exam.analysisVideo, {
              video: this.videos,
              sub_category_id: this.selectedSubCategory.id,
              exams: [{ exam_id: this.$route.params.exam_id }]
            })
            .then(() => {
              this.$notify({
                group: 'notifs',
                text: 'اطلاعات ثبت شد.',
                type: 'success'
              })
            })
          },
          addVideo() {
            this.videos.push('')
          },
          removeVideo(index) {
            this.videos.splice(index, 1)
          },
          loadSubcategories() {
            this.subCategoriesList.fetch()
              .then((response) => {
                this.selectedSubCategory = this.subCategoriesList.list.find(item => item.id === this.$route.params.subcategory_id)
                this.subCategoriesList = new QuestSubcategoryList(response.data.data)
                this.loading = false
              })
          }

        }
    }
</script>

<style>
.register-video .v-text-field__details {
  display: none;
}
</style>

<style scoped>

</style>
