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
        @input="updateQuestion"
      />
    </div>
    <v-row
      v-for="(item, index) in question.choices.list"
      :key="index"
      class="question-layout-options"
      :class="status ? 'mb-6   question-options white': '  question-o' +
        'ptions'"
    >
      <v-col class="col-2">
        <v-row>
          <v-col :class="status ?'col-10' :'col-10'">
            <v-autocomplete
              v-model="item.answer"
              :items="mbti_value"
              label="انتخاب مقدار"
              dense
              outlined
              rounded
              :disabled="!status"
              @change="updateQuestion"
            />
          </v-col>
          <v-col class="col-1">
            {{ (index + 1) + ') ' }}
          </v-col>
        </v-row>
      </v-col>
      <v-col class="answer-editor col-10">
        <div>
          <question_field
            :ref="'choice' + (index + 1)"
            :key="'choices' + (index + 1) + domKey"
            v-model="item.title"
            :edit-status="status"
            :question-id="value.id ? value.id : 'null'"
            @input="updateQuestion"
          />
        </div>
      </v-col>
    </v-row>
  </div>
  <!-- ------------------------- answer -------------------------------  -->
</template>
<script>
import {Question} from '@/models/Question'
import question_field from '@/components/Question/questionField'

export default {
  name: 'MbtiQuestionLayout',
  components: {
    question_field,
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
      domKey: Date.now(),
      mbti_value: [
        {
          text: 'bartle-s',
          value: 'socializer'
        },
        {
          text: 'bartle-e',
          value: 'explorer'
        },
        {
          text: 'bartle-a',
          value: 'achiever'
        },
        {
          text: 'bartle-k',
          value: 'killer'
        },
        {
          text: 'mbti-I',
          value: 'introversion'
        },
        {
          text: 'mbti-E',
          value: 'extroversion'
        },
        {
          text: 'mbti-N',
          value: 'intuition'
        },
        {
          text: 'mbti-S',
          value: 'sensing'
        },
        {
          text: 'mbti-T',
          value: 'thinking'
        },
        {
          text: 'mbti-F',
          value: 'feeling'
        },
        {
          text: 'mbti-J',
          value: 'judging'
        },
        {
          text: 'mbti-P',
          value: 'perceiving'
        }
      ]
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
    getContent() {
      console.log('test', this.$refs)
      this.$refs.questionStatement.getContent()
      this.$refs.choice1[0].getContent()
      this.$refs.choice2[0].getContent()
      this.updateQuestion()
    },
    updateQuestion() {
      console.log('this.question', this.question)
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
.question-layout-options {
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

/*@media (max-width: 1077px) {*/
/*  .question-layout-options.mb-6.question-options.white {*/
/*    width: auto;*/
/*    position: relative;*/
/*  }*/
/*}*/
</style>
