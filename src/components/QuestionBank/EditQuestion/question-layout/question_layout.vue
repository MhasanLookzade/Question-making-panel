<template>
  <!-- ------------------------- question -------------------------------  -->
  <div class=" ma-4 question-layout">
    <div class="question ">
      <div
        v-if="status"
        class="mb-5 "
      >
        تایپ سوال
      </div>
      <question_field
        ref="questionStatement"
        :key="'statement' + domKey"
        v-model="question.statement"
        class="mb-10"
        :edit-status="status"
        placeholder="صورت سوال"
        :question-id="value.id ? value.id : 'null'"
      />
    </div>

    <v-btn
        v-if="question.choices.list.length > 0 && status"
        dark
        block
        color="pink"
        @click="removeAllChoice"
    >
      حذف تمام گزینه ها
    </v-btn>
    <br>

    <v-row
      v-for="(item, index) in question.choices.list"
      :key="item.order"
      class="question-layout-options"
      :class="status ? 'mb-6   question-options white': '  question-options'"
    >
      <v-col class="col-1">
        <v-row>
          <v-col :class="status ?'px-6 pb-2 col-8' :'px-5 pb-2 col-8'">
            <div
              v-if="item.answer"
              @click="clicked(item.order)"
            >
              <v-icon
                color="green"
                :size="!status? 28 : 36"
              >
                mdi-checkbox-marked-circle
              </v-icon>
            </div>
            <div
              v-else-if="status"
              @click="clicked(item.order)"
            >
              <v-btn
                fab
                depressed
                width="36"
                height="36"
              />
            </div>
          </v-col>
          <v-col class="col-1">
            {{ (index + 1) + ') ' }}
          </v-col>
        </v-row>
      </v-col>
      <v-col class="answer-editor col-11">
        <div>
          <question_field
              :ref="'choice' + (item.order)"
              :key="'choices' + (item.order) + domKey"
              v-model="item.title"
              :edit-status="status"
              :question-id="value.id ? value.id : 'null'"
          />
        </div>
      </v-col>

      <v-btn
          v-if="status"
          fab
          dark
          small
          color="pink"
          class="btn-delete-choice"
          @click="removeChoice(item.order)"
      >
        <v-icon dark>
          mdi-close
        </v-icon>
      </v-btn>

    </v-row>

    <v-btn
        v-if="status && canShowChoices"
        dark
        block
        color="success"
        @click="addChoice"
    >
      افزودن گزینه جدید
    </v-btn>
    <!-- ------------------------- answer -------------------------------  -->
    <div class="mb-5 question-answer ">
      <div class="mb-5">
        پاسخ تشریحی
      </div>
      <div>
        <question_field
          ref="descriptive"
          :key="'descriptive_answer' + domKey"
          v-model="question.descriptive_answer"
          :question-id="value.id ? value.id : 'null'"
          :edit-status="status"
          placeholder="پاسخ تشریحی"
          class="mb-16"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {Question} from '@/models/Question'
import question_field from '@/components/Question/questionField'

export default {
  name: 'QuestionLayout',
  components: {
    question_field,
  },
  computed: {
    canShowChoices () {
      return this.question.type.value === 'konkur' || this.question.type.value === 'psychometric' || this.question.type.value === null
    }
  },
  props: {
    value: {
      type: Question,
      default: new Question()
    },
    status: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      question: new Question(),
      domKey: Date.now()
    }
  },
  watch: {
    value: function () {
      this.question = this.value
    }
  },
  created() {
    this.question = this.value
    let that = this
    setTimeout(() => {
      that.domKey = Date.now()
    }, 100)
  },
  methods: {
    addChoice() {
      this.question.choices.addEmptyChoice()
      this.updateQuestion()
    },
    removeAllChoice() {
      this.question.choices.list = []
      this.updateQuestion()
    },
    removeChoice(order) {
      const index = this.question.choices.list.findIndex( item => item.order === order)
      this.question.choices.list.splice(index, 1)
      this.updateQuestion()
    },
    getContent() {
      this.$refs.questionStatement.getContent()
      this.$refs.descriptive.getContent()
      this.question.choices.list.forEach( choice => {
        this.$refs['choice'+choice.order][0].getContent()
      })
      // this.$refs.choice1[0].getContent()
      // this.$refs.choice2[0].getContent()
      // this.$refs.choice3[0].getContent()
      // this.$refs.choice4[0].getContent()
      this.updateQuestion()
    },
    updateQuestion() {
      this.$emit('input', this.question)
    },
    clicked(order) {
      this.question.choices.list.forEach(item => {
        item.answer = item.order === order;
      })
      this.updateQuestion()
    }
  },
}
</script>

<style scoped>
.btn-delete-choice {
  position: absolute;
  left: -10px;
  top: -10px;
}
.question-layout-options {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.question-options {
  display: flex;
  align-items: center;
  border-radius: 10px;
}

.background-color-test {
  background-color: white;

}

.question-answer {
  padding: 10px;
}

.question-options .answer-editor {
  width: 100%;
}

</style>
<style>
.question-layout .tiptap-plus.v-card {
  box-shadow: none !important;
}

</style>
