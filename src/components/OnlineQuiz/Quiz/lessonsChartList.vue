<template>
  <v-row>
    <v-col cols="12 ">
      <div class="tableSize">
        <span>{{ $route.params.quizTitle }}</span>
        <v-btn
          class="mx-2 backBtnPosition"
          fab
          x-small
          color="white"
          @click="goBack"
        >
          <v-icon dark>
            mdi-chevron-left
          </v-icon>
        </v-btn>
      </div>
    </v-col>
    <v-col cols="12">
      <v-simple-table class="tableSize">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-right">
                عنوان
              </th>
              <th class="text-right">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in lessonsList.list"
              :key="item.id"
            >
              <td>{{ item.title }}</td>
              <td class="actionsColumn">
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-if="item.permissions.view"
                      class="mx-2"
                      fab
                      dark
                      x-small
                      color="green"
                      :to="{ name: 'onlineQuiz.exams.lessons.Karnama', params: { quizId: $route.params.quizId, lessonId: item.id}}"
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon
                        small
                      >
                        mdi-notebook-outline
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>مشاهده سوالات درس</span>
                </v-tooltip>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-col>
  </v-row>
</template>

<script>
import axios from "axios";
import API_ADDRESS from "@/api/Addresses";
import {QuestSubcategoryList} from "@/models/QuestSubcategory";

export default {
  name: 'LessonsChartList',
  data: () => ({
    lessonsList: new QuestSubcategoryList()
  }),
  created() {
    this.$store.commit('AppLayout/updateDrawer', true)
  },
  mounted() {
    this.getLessons()
  },
  methods: {
    goBack() {
      this.$router.push('/onlineQuiz/exams')
    },
    getLessons() {
      this.lessonsList.loading = true
      axios.get(API_ADDRESS.exam.getSubCategoriesWithPermissions(this.$route.params.quizId))
          .then((response) => {
            this.lessonsList.loading = false
            this.lessonsList = new QuestSubcategoryList(response.data.data, {
              meta: response.data.meta,
              links: response.data.links
            })
          })
          .catch(() => {
            this.lessonsList.loading = false
            this.lessonsList = new QuestSubcategoryList()
          })
    }
  }
}
</script>

<style scoped>
.actionsColumn {
  width: 50%;
}

.tableSize {
  width: 40%;
  margin: auto
}

.backBtnPosition {
  float: left
}
</style>
