<template>
  <v-row class="my-3">
    <v-col
      md="12"
      class="not-visible-in-print toolbox"
    >
      <v-row>
        <v-col
          md="1"
          class="mr-5"
        >
          <v-text-field
            v-model="fontSize"
            dense
            outlined
            label="text font size"
            type="number"
            @input="updateFontSize"
          />
        </v-col>
        <v-col
          md="1"
        >
          <v-text-field
            v-model="formulaFontSize"
            dense
            outlined
            label="formula font size"
            type="number"
            @input="updateFontSize"
          />
        </v-col>
      </v-row>
    </v-col>
    <v-col
      md="12"
      class="print-page"
    >
      <v-row
        v-for="(question) in quizData.questions.list"
        :key="question.id"
        class="question-parent"
        :class="{ 'ltr': question.ltr, 'rtl': !question.ltr }"
      >
        <div class="vertical-choice not-visible-in-print">
          <v-text-field
            v-model="question.verticalChoice"
            type="number"
            outlined
            label="فاصله"
            @input="changeVertical(question.id, $event)"
          />
        </div>
        <div class="question-box">
          <div class="statement">
            <v-btn
              icon
              color="blue"
              class="edit-button"
              @click="toggleEditMode(question)"
            >
              <v-icon color="blue">
                mdi-pencil
              </v-icon>
            </v-btn>
            <vue-katex
              v-if="!question.editMode"
              :input="question.statement"
            />
            <vue-tiptap-katex
              v-else
              v-model="question.statement"
              class="vue-tiptap-katex"
              :options="{
                bubbleMenu: false,
                floatingMenu: false,
                poem: true,
                reading: true,
                persianKeyboard: true,
                mathliveOptions: { smartFence: false },
                uploadServer: {
                  url: imageUrl,
                  instantUpload: true,
                  headers: { Authorization: 'Bearer ' + $store.getters['Auth/accessToken'] }
                }
              }"
            />
          </div>
          <div
            :id="`question${question.id}`"
            class="choice-parent"
          >
            <div
              v-for="(choice, cIndex) in question.choices.list"
              :key="cIndex"
              class="choice"
            >
              <v-btn
                icon
                color="blue"
                class="edit-button"
                @click="toggleEditMode(choice)"
              >
                <v-icon color="blue">
                  mdi-pencil
                </v-icon>
              </v-btn>
              <vue-katex
                v-if="!choice.editMode"
                :input="choice.title"
              />
              <vue-tiptap-katex
                v-else
                v-model="choice.title"
                class="vue-tiptap-katex"
                :options="{
                  bubbleMenu: false,
                  floatingMenu: false,
                  poem: true,
                  reading: true,
                  persianKeyboard: true,
                  mathliveOptions: { smartFence: false },
                  uploadServer: {
                    url: imageUrl,
                    instantUpload: true,
                    headers: { Authorization: 'Bearer ' + $store.getters['Auth/accessToken'] }
                  }
                }"
              />
            </div>
          </div>
        </div>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import API_ADDRESS from "@/api/Addresses";
import {QuestionList} from "@/models/Question";
import axios from "axios";
import {Exam} from "@/models/Exam";
import {QuestSubcategoryList} from "@/models/QuestSubcategory";
import { mixinAuth, mixinQuiz, mixinDrawer } from '@/mixin/Mixins'
import VueKatex from "@/components/VueKatex";
import VueTiptapKatex from "vue-tiptap-katex";


export default {
  name: "QuestionPreview",
  components: {VueKatex, VueTiptapKatex},
  mixins: [mixinAuth, mixinQuiz, mixinDrawer],
  data () {
    return {
      quizData: new Exam(),
      subCategoriesList: new QuestSubcategoryList(),
      pages: [],
      fontSize: 16,
      formulaFontSize: 20
    }
  },
  computed: {
    imageUrl () {
      return API_ADDRESS.question.uploadImage(this.questionId)
    },
    // tiptapOptions: {
    //   bubbleMenu: false,
    //   floatingMenu: false,
    //   poem: true,
    //   reading: true,
    //   persianKeyboard: true,
    //   onResizeEnd: this.onResizeEnd,
    //   mathliveOptions: { smartFence: false },
    //   uploadServer: {
    //     url: this.imageUrl,
    //     instantUpload: true,
    //     headers: { Authorization: 'Bearer ' + this.$store.getters['Auth/accessToken'] }
    //   }
    // }
  },
  created () {
    this.loadQuizDataAndSubCategories()
    this.drawer = false
  },
  methods: {
    changeVertical (id, value) {
      console.log(id, value)
      document.querySelector('#question' + id).style.top = value + 'px'
    },
    updateFontSize () {
      document.querySelectorAll('.katex').forEach(el => {
        el.style.fontSize = this.formulaFontSize + 'px'
      })
      document.querySelectorAll('p').forEach(el => {
        el.style.fontSize = this.fontSize + 'px'
      })
    },
    onResizeEnd (url, width, height) {
      return url.split('?w=')[0] + '?w=' + width + '&h=' + height
    },
    toggleEditMode (object) {
      object.editMode = !object.editMode
    },
    loadPages () {

    },
    loadSubCategories (quizResponse, reload) {
      const that = this
      this.subCategoriesList.fetch().then((response) => {
        if (reload) {
          this.$notify({
            group: 'notifs',
            title: 'توجه!',
            text: 'اطلاعات بروزرسانی شد',
            type: 'success'
          })
        }
        // that.quiz.sub_categories = new QuestSubcategoryList(response.data)
        that.quizData.sub_categories = new QuestSubcategoryList(response.data.data)
        let questions = quizResponse.data.data
        that.sortQuestions (questions)
        that.quizData.questions = new QuestionList(questions)
        // that.quiz = new Exam(that.quizData)
        that.QuIzDaTa = new Exam(that.quizData)
        const regexP = /<p[^>]*>/
        const persianRegex = /[\u0600-\u06FF]/
        that.quizData.questions.list.forEach((question, index) => {
          question.verticalChoice = 0
          question.statement = question.statement.replace(regexP, match => match + (index + 1) + ') ')
          question.ltr = !question.statement.match(persianRegex);
          question.editMode = false
          question.statement = question.statement.replace(/<p[^>]*>/g, match => {
            let el = document.createElement('div')
            el.innerHTML = match
            el.children[0].setAttribute('dir', question.ltr ? 'ltr' : 'rtl')
            return el.innerHTML.split('</p>')[0]
          })
          question.choices.list.forEach((choice, cIndex) => {
            choice.title = choice.title.replace(/<p[^>]*>/g, match => {
              let el = document.createElement('div')
              el.innerHTML = match
              el.children[0].setAttribute('dir', question.ltr ? 'ltr' : 'rtl')
              return el.innerHTML.split('</p>')[0]
            })
            choice.editMode = false
            choice.title = choice.title.replace(regexP, match => match + (cIndex + 1) + ') ')
          })
        })
      })
    },
    loadQuizDataAndSubCategories (reload = false) {
      const that = this
      axios.post(API_ADDRESS.exam.examQuestion(this.$route.params.quizId), {
        sub_categories: [this.$route.params.lessonId]
      })
          .then((response) => {
            if (response.data.data.length) {
              that.loadSubCategories(response, reload)
            } else {
              this.$router.push({ name: 'onlineQuiz.exams' })
            }

          })

    },
    downLoadQuestions () {
      this.loading = true
      let fileUrl = ''
      const questionsList = this.quizData.questions.list
      const questionsIdList = []

      questionsList.map((question) => {
        questionsIdList.push(question.id)
      })

      axios.post(API_ADDRESS.question.printQuestions, {
        questions: questionsIdList
      })
          .then( response => {
            fileUrl = response.data.data
            this.download('questions-list', fileUrl)
            this.loading = false
          }).catch(err => {
        this.loading = false
        console.log(err)
      })
    },

    download(fileName, url) {
      let element = document.createElement('a')
      element.setAttribute('href', url)
      element.setAttribute('download', fileName)
      element.setAttribute('target', '_blank')
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    },
    updateLtr() {
      setTimeout(() => {
        document.querySelectorAll('.katex:not([dir="ltr"])').forEach(item => {
          item.setAttribute('dir', 'ltr')
        })
      }, 1000)
    }
  }
}
</script>

<style scoped>
.choice-parent {
  position: relative;
}

.vue-tiptap-katex {
  border: 1px solid black;
}

.vertical-choice {
  width: 200px;
  margin-left: 100px;
  position: absolute;
  top: 85px;
  direction: rtl;
  left: 0px;
}

.toolbox {
  position: fixed;
  background: #fff;
  left: 0;
  right: 0;
  top: 0;
  z-index: 5;
}

.statement,
.choice {
  position: relative;
}

.statement:hover .edit-button,
.choice:hover .edit-button {
  visibility: visible;
}

.edit-button {
  position: absolute;
  top: -35px;
  visibility: hidden;
}

.question-parent {
  position: relative;
}

.question-box {
  background-image: url('http://neo-server.ir/d/printTemplate-questions.jpg');
  width: 1920px;
  height: 1080px;
  background-repeat: no-repeat;
  background-size: cover;
  padding: 190px 80px 100px 80px;
}

.rtl p {
  direction: rtl;
}

.ltr p {
  direction: ltr;
}

</style>

<style>
@media print {
  .not-visible-in-print {
    display: none;
  }

  .rtl p {
    direction: rtl;
  }

  .ltr p {
    direction: ltr;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  .question-parent {
    page-break-after: always;
    position: relative;
  }

  .question-box {
    background-image: url('http://neo-server.ir/d/printTemplate-questions.jpg');
    width: 1920px;
    height: 1080px;
    background-repeat: no-repeat;
    background-size: cover;
    padding: 190px 80px 100px 80px;
  }

  .print-page {
    /*position: fixed;*/
    /*top: 0;*/
    display: block !important;
    z-index: 100;
    background: white;
    width: 1920px;
    /*right: 0;*/
    /*left: 0;*/
  }

  html, body {
    width: 1920px !important;
    height: 1080px !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .v-app-bar {
    display: none !important;
  }

  .v-main {
    padding: 0 !important;
  }

  /*@page {*/
  /*  size: 1920px 1130px;*/
  /*}*/

  .row {
    padding: 0 !important;
  }

  .col {
    margin: 0 !important;
  }
}
</style>
