<template>
  <div class="participate-mbti-bartle">
    <v-container
      fluid
      class="header-container"
    >
      <v-row>
        <v-col class="d-flex flex-row justify-space-between">
          <a href="https://alaatv.com">
            <v-img
              src="https://nodes.alaatv.com/upload/mbti-bartle-alaa-logo.png"
              width="27"
              height="40"
              :style="{ 'margin-top': '15px' }"
            />
          </a>
          <a href="https://alaatv.com">
            <v-img
              src="https://nodes.alaatv.com/upload/mbti-bartle-alaa-text.png"
              width="134"
              height="40"
              :style="{ 'margin-top': '15px' }"
            />
          </a>
          <div :style="{ width: '27px' }" />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex flex-row justify-space-between">
          <div
            v-if="quiz"
            v-text="quiz.title"
          />
          <div v-text="counter.string" />
        </v-col>
      </v-row>
    </v-container>
    <v-progress-linear
      :value="counter.value"
      class="mt-5 progress-bar"
      height="14"
      color="#ffc107"
    />
    <v-container
      fluid
      class="question-box-parent"
    >
      <v-row>
        <v-col class="d-flex justify-center">
          <div class="question-box">
            <div class="arrow-box prev">
              <v-btn
                height="100"
                width="50"
                color="#ffe082"
                elevation="0"
                :disabled="$route.params.questNumber.toString() === '1'"
                @click="goToPrevQuestion('onlineQuiz.mbtiBartle')"
              >
                <i class="fi-br-angle-right" />
              </v-btn>
            </div>
            <!--            <div-->
            <!--              v-if="$route.params.questNumber === '90' && isCurrentQuestionAnswered"-->
            <!--              class="finished"-->
            <!--            />-->
            <div class="question">
              <p class="question-number">
                سوال
                {{ $route.params.questNumber }}
              </p>
              <!-- eslint-disable -->
              <p
                class="statement"
                v-html="currentQuestion.statement"
              />
              <!-- eslint-enable -->
              <div
                class="choices"
                :class="{
                  agree: stringMeanThumbUpOrDown(currentQuestion.choices.list[0].title) === 'ThumbUp',
                  disagree: stringMeanThumbUpOrDown(currentQuestion.choices.list[0].title) === 'ThumbDown'
                }"
              >
                <div
                  v-for="(choice, index) in currentQuestion.choices.list"
                  :key="index+choiceKey"
                  class="choice"
                  :class="{
                    agree: stringMeanThumbUpOrDown(choice.title) === 'ThumbUp',
                    disagree: stringMeanThumbUpOrDown(choice.title) === 'ThumbDown',
                    active: choice.active
                  }"
                >
                  <div
                    v-if="stringMeanThumbUpOrDown(choice.title) === 'ThumbUp' || stringMeanThumbUpOrDown(choice.title) === 'ThumbDown'"
                    class="choice-circle"
                    @click="choiceClick(choice.id)"
                  >
                    <div class="choice-inner-circle">
                      <i
                        v-if="stringMeanThumbUpOrDown(choice.title) === 'ThumbUp'"
                        class="fi-rr-thumbs-up"
                      />
                      <i
                        v-else
                        class="fi-rr-thumbs-down"
                      />
                    </div>
                  </div>
                  <!-- eslint-disable -->
                  <p
                    v-if="stringMeanThumbUpOrDown(choice.title) === 'ThumbUp' || stringMeanThumbUpOrDown(choice.title) === 'ThumbDown'"
                    v-html="choice.title"
                  />
                  <!-- eslint-enable -->
                  <div
                    v-else
                    class="choice-rect"
                    @click="choiceClick(choice.id)"
                  >
                    <!-- eslint-disable -->
                    <div
                      class="choice-inner-rect"
                      v-html="choice.title"
                    />
                    <!-- eslint-enable -->
                  </div>
                </div>
                <v-overlay :value="loading">
                  <v-progress-circular
                    :size="50"
                    color="amber"
                    indeterminate
                  />
                </v-overlay>
              </div>
            </div>
            <div class="next arrow-box">
              <v-btn
                height="100"
                width="50"
                color="#ffe082"
                elevation="0"
                :disabled="!isCurrentQuestionAnswered || getQuestionNumberFromId(currentQuestion.id) === getCurrentExamQuestionsInArray().length"
                @click="goToNextQuestion('onlineQuiz.mbtiBartle')"
              >
                <i class="fi-br-angle-left" />
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog
      v-model="tryAgainDialog"
      persistent
      max-width="290"
    >
      <v-card>
        <v-card-title class="text-h5">
          توجه!
        </v-card-title>
        <v-card-text>مشکلی در ایجاد کارنامه رخ داده است. لطفا مجددا تلاش کنید.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="green darken-1"
            text
            @click="sendAnswersAndFinishExam"
          >
            تلاش مجدد
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import {mixinDrawer} from "@/mixin/Mixins";
import {mixinQuiz, mixinUserActionOnQuestion} from '@/mixin/Mixins'
import mbtiData from '@/assets/js/MBTI_Bartle_Data'

import Assistant from "@/plugins/assistant";


export default {
  name: "MBTIBartle",
  mixins: [mixinDrawer, mixinQuiz, mixinUserActionOnQuestion],
  data() {
    return {
      loading: false,
      choiceKey: Date.now(),
      tryAgainDialog: false,
      // should be commented later ToDo
      // currentQuestion: new Question({
      //   id: 1,
      //   statement: '<p>«از دیروز بیاموز، برای امروز زندگی کن، به فردا امیدوار باش. مسئله مهم این است که دست از سؤال پرسیدن بر ندارید»</p>',
      //   choices: [
      //     // {
      //     //   id: 1,
      //     //   active: true,
      //     //   title: 'موافقم',
      //     //   value: 'I',
      //     // },
      //     // {
      //     //   id: 2,
      //     //   title: 'مخالفم',
      //     //   value: 'E'
      //     // }
      //     {
      //       id: 1,
      //       title: 'موافقم',
      //       value: 'I',
      //     },
      //     {
      //       id: 2,
      //       title: 'مخالفم',
      //       value: 'E'
      //     }
      //   ]
      // }),
      finished: false
    }
  },
  computed: {
    counter() {
      return {
        string: this.$route.params.questNumber + '/' + 90,
        value: (this.$route.params.questNumber - 1) / 90 * 100
      }
    },
    isCurrentQuestionAnswered() {
      let isAnswered = false
      this.currentQuestion.choices.list.forEach(choice => {
        if (choice.active) {
          isAnswered = true
        }
      })
      return isAnswered
    }
  },
  created() {
    this.drawer = false
    this.appBar = false
    this.$store.commit('AppLayout/updateAppBarAndDrawer', false)
  },
  mounted() {
    let that = this
    this.startExam(that.$route.params.quizId, 'onlineQuiz.mbtiBartle')
        .then(() => {
          that.$store.commit('AppLayout/updateOverlay', {show: false, loading: false, text: ''})
          const unansweredQuestion = that.getUnansweredQuestionBehind()
          if (unansweredQuestion) {
            that.changeQuestion(unansweredQuestion.id, 'onlineQuiz.mbtiBartle')
          } else {
            const isFinished = that.isFinished()
            if (isFinished) {
              that.sendAnswersAndFinishExam()
            }
          }
        })
        .catch((error) => {
          Assistant.reportErrors(error)
          that.$notify({
            group: 'notifs',
            title: 'توجه!',
            text: 'مشکلی در دریافت اطلاعات آزمون رخ داده است. لطفا دوباره امتحان کنید.',
            type: 'error'
          })
          that.$router.push({name: 'user.exam.list'})
        })
  },
  methods: {
    stringMeanThumbUpOrDown(string) {
      if (string === null || (this.currentQuestion.sub_category && this.currentQuestion.sub_category.title !== 'MBTI')) {
        return false
      }

      if (string.includes("موافقم")) {
        return 'ThumbUp'
      } else if (string.includes("مخالفم")) {
        return 'ThumbDown'
      }
    },
    isFinished () {
      let that = this
      const countOfQuestions = Object.keys(this.currentExamQuestions).length
      if (
          this.userQuizListData &&
          this.userQuizListData[this.quiz.id]
      ) {
        let answeredQuestionsCount = 0
        const tstArr = []
        const checkedQuestionIds = Object.keys(this.userQuizListData[this.quiz.id])
        checkedQuestionIds.forEach( item => {
          if (
              that.userQuizListData &&
              that.userQuizListData[that.quiz.id] &&
              that.userQuizListData[that.quiz.id][item] &&
              that.userQuizListData[that.quiz.id][item].answered_choice_id &&
              that.userQuizListData[that.quiz.id][item].answered_choice_id.toString()
          ) {
            answeredQuestionsCount++
          } else {
            tstArr.push(that.userQuizListData[that.quiz.id][item])
          }
        })

        return (answeredQuestionsCount === countOfQuestions)
      } else {
        return false
      }
    },
    isLastQuestion () {
      const countOfQuestions = Object.keys(this.currentExamQuestions).length
      return countOfQuestions.toString() === this.$route.params.questNumber.toString()
    },
    getUnansweredQuestionBehind () {
      if (
          this.userQuizListData &&
          this.userQuizListData[this.quiz.id]
      ) {
        let that = this
        const currentExamQuestionIndexes = this.getCurrentExamQuestionIndexes()
        const currentExamQuestions = this.currentExamQuestions
        const currentQuestionNumber = this.$route.params.questNumber
        let unansweredQuestion = null
        const tstArr = []
        Object.keys(currentExamQuestionIndexes).forEach( questIndex => {
          const questNumber = parseInt(questIndex) + 1
          if (parseInt(currentQuestionNumber) >= parseInt(questNumber)) {
            const questionId = currentExamQuestionIndexes[questIndex]
            if (
                !that.userQuizListData ||
                !that.userQuizListData[that.quiz.id] ||
                !that.userQuizListData[that.quiz.id][questionId] ||
                !that.userQuizListData[that.quiz.id][questionId].answered_choice_id ||
                !that.userQuizListData[that.quiz.id][questionId].answered_choice_id.toString() ||
                typeof that.userQuizListData[that.quiz.id][questionId].answered_choice_id === 'undefined' ||
                that.userQuizListData[that.quiz.id][questionId].answered_choice_id === null
            ) {
              unansweredQuestion = currentExamQuestions[questionId]
            } else {
              tstArr.push(that.userQuizListData[that.quiz.id][questionId])
            }
          }
        })

        return unansweredQuestion
      } else {
        return null
      }
    },
    setCurrentQuestionChoice (choice_id, active) {
      let that = this
      if (typeof active === 'undefined') {
        active = true
      }
      this.currentQuestion.choices.list.forEach((item, index) => {
        if (choice_id !== null && choice_id.toString() === that.currentQuestion.choices.list[index].id.toString()) {
          Vue.set(that.currentQuestion.choices.list[index], 'active', active)
          that.choiceKey = Date.now()
        } else {
          Vue.set(that.currentQuestion.choices.list[index], 'active', false)
          that.choiceKey = Date.now()
        }
      })
    },
    choiceClick(id) {
      this.loading = true
      let that = this
      const isLastQuestion = this.isLastQuestion()
      this.answerClicked({choiceId: id, questionId: this.currentQuestion.id}, true,(response) => {
        const targetQuestion = response.data.data.find(item => (
            this.currentQuestion.id !== null &&
            item.question_id !== null &&
            item.question_id.toString() === this.currentQuestion.id.toString())
        )
        if (
            targetQuestion &&
            targetQuestion.choice_id &&
            targetQuestion.choice_id.toString()
        ) {
          if (!isLastQuestion) {
            that.setCurrentQuestionChoice (targetQuestion.choice_id, true)
            setTimeout( () => {
              that.goToNextQuestion('onlineQuiz.mbtiBartle')
            },500)
          } else {
            that.setCurrentQuestionChoice (targetQuestion.choice_id, true)
            setTimeout( () => {
              that.startExam(that.$route.params.quizId, 'onlineQuiz.mbtiBartle')
                  .then(() => {
                    that.$store.commit('AppLayout/updateOverlay', {show: false, loading: false, text: ''})
                    const unansweredQuestion = that.getUnansweredQuestionBehind()
                    if (unansweredQuestion) {
                      that.changeQuestion(unansweredQuestion.id, 'onlineQuiz.mbtiBartle')
                    } else {
                      const isFinished = that.isFinished()
                      if (isFinished) {
                        that.sendAnswersAndFinishExam()
                      }
                    }
                  })
            },500)
          }
        } else {
          that.setCurrentQuestionChoice (null, false)
          that.loading = false
        }
      })
    },
    sendAnswersAndFinishExam() {
      let that = this
      this.sendUserQuestionsDataToServerAndFinishExam(this.quiz.id, this.quiz.user_exam_id)
        .then( () => {
          that.$notify({
            group: 'notifs',
            text: 'اطلاعات آزمون شما ثبت شد.',
            type: 'success'
          })
          that.$store.commit('clearExamData', that.quiz.id)
          that.tryAgainDialog = false
          that.$router.push({name: 'mbtiBartle.result', params: {exam_id: this.quiz.id.toString(), user_exam_id: this.quiz.user_exam_id.toString()}})
        })
        .catch( () => {
          that.$notify({
            group: 'notifs',
            title: 'توجه!',
            text: 'مشکلی در ثبت اطلاعات آزمون شما رخ داده است.',
            type: 'error',
            duration: 6000,
          })
          that.tryAgainDialog = true
        })
    },
    getMbtiBg(type) {
      return mbtiData.mbtiType[type].backgroundColor
    },
    getMbtiDetailsFromAnswers(answer) {
      let details = []
      for (let i = 0; i < 4; i++) {
        let title = mbtiData.mbtiGroups[i].title
        let text = mbtiData.mbtiGroups[i].text
        let values = []
        values.push({
          title: answer[Object.keys(answer)[0]][mbtiData.mbtiGroups[i].value[0]].label,
          percent: answer[Object.keys(answer)[0]][mbtiData.mbtiGroups[i].value[0]].ratio,
          label: mbtiData.mbtiKeys[2 * i].value,
        })
        values.push({
          title: answer[Object.keys(answer)[0]][mbtiData.mbtiGroups[i].value[1]].label,
          percent: answer[Object.keys(answer)[0]][mbtiData.mbtiGroups[i].value[1]].ratio,
          label: mbtiData.mbtiKeys[2 * i + 1].value,
        })
        details.push({
          title,
          text,
          values
        })
      }
      return details
    },
    getMbtiTypeFromAnswers(answer) {
      let type = ''
      if (answer[Object.keys(answer)[0]][mbtiData.mbtiKeys[0].text.ratio] > 50) {
        type += mbtiData.mbtiKeys[0].value
      } else {
        type += mbtiData.mbtiKeys[1].value
      }

      if (answer[Object.keys(answer)[0]][mbtiData.mbtiKeys[2].text.ratio] > 50) {
        type += mbtiData.mbtiKeys[2].value
      } else {
        type += mbtiData.mbtiKeys[3].value
      }

      if (answer[Object.keys(answer)[0]][mbtiData.mbtiKeys[4].text.ratio] > 50) {
        type += mbtiData.mbtiKeys[4].value
      } else {
        type += mbtiData.mbtiKeys[5].value
      }

      if (answer[Object.keys(answer)[0]][mbtiData.mbtiKeys[6].text.ratio] > 50) {
        type += mbtiData.mbtiKeys[6].value
      } else {
        type += mbtiData.mbtiKeys[7].value
      }

      return type
    },
    calculateExam() {
      let questions = [{}]
      let answer = {}
      questions.forEach(question => { // set the sub categories in the answer obj
        if (!answer[question.sub_category.id]) {
          answer[question.sub_category.id] = {}
        }

        question.choices.list.forEach(choice => { // set the values in the answer obj
          if (!answer[question.sub_category.id][choice.answer]) {
            answer[question.sub_category.id][choice.answer] = {
              repeat: 0,
              possible: 0,
              ratio: 0
            }
          }
        })
      })

      questions.forEach(question => {
        question.choices.list.forEach(choice => {
          answer[question.sub_category.id][choice.answer].possible++
          if (choice.active) {
            answer[question.sub_category.id][choice.answer].repeat++
          }
        })
      })

      Object.keys(answer).forEach((subCategory) => {
        Object.keys(answer[subCategory]).forEach((value) => {
          answer[subCategory][value].ratio = Math.round(answer[subCategory][value].repeat / answer[subCategory][value].possible * 100)
        })
      })

      return answer
    }
  }
}
</script>

<style scoped lang="scss">

.participate-mbti-bartle {
  background: #fff;
  height: 100vh;

  .header-container {
    padding: 0 calc(((100vw - 1264px) / 6) + 30px);
    font-size: 18px;
    font-weight: 500;

    @media only screen and (max-width: 1264px) {
      padding: 0 40px;
    }
    @media only screen and (max-width: 767px) {
      font-size: 16px;
      padding: 0 30px;
    }
    @media only screen and (max-width: 575px) {
      padding: 0 20px;
    }
  }

  .question-box-parent {
    background: #ffe082;
    height: calc(100% - 140px);

    .question-box {
      margin-top: 54px;
      width: 1000px;
      height: 500px;
      background: #fff;
      border-radius: 50px;
      padding: 20px;
      box-shadow: 0 5px 10px 0 rgba(255, 193, 7, 0.2);
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      @media only screen and (max-width: 1800px) {
        height: 440px;
      }

      @media only screen and (max-width: 1336px) {
        height: 420px;
      }

      @media only screen and (max-width: 1200px) {
        height: 360px;
        width: 860px;
      }

      @media only screen and (max-width: 989px) {
        width: 500px;
        height: 640px;
      }

      @media only screen and (max-width: 767px) {
        width: 400px;
        height: 640px;
        border-radius: 30px;
      }

      @media only screen and (max-width: 575px) {
        width: calc(100% - 50px);
        height: 400px;
        padding: 8px;
        margin-top: 26px;
      }

      .arrow-box {
        display: flex;
        flex-direction: column;
        justify-content: center;

        button {
          @media only screen and (max-width: 989px) {
            position: absolute;
            background-color: #fff !important;
            opacity: 1;
            width: 60px !important;
          }

          @media only screen and (max-width: 767px) {
            width: 40px !important;
          }

          @media only screen and (max-width: 575px) {
            width: 25px !important;
            height: 80px !important;
          }
        }

        i {
          color: #fff;
          font-weight: bold;
          font-size: 24px;
          margin-top: 12px;
          @media only screen and (max-width: 989px) {
            color: #ffc107;
          }
        }

        &.prev {
          button {
            @media only screen and (max-width: 989px) {
              right: 0;
              border-top-right-radius: 0;
              border-bottom-right-radius: 0;
            }
          }

          i {
            margin-left: 6px;
          }
        }

        &.next {
          button {
            @media only screen and (max-width: 989px) {
              left: 0;
              border-top-left-radius: 0;
              border-bottom-left-radius: 0;
            }
          }
        }
      }

      .question {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;

        .question-number {
          font-size: 20px;
          font-weight: bold;

          @media only screen and (max-width: 767px) {
            font-size: 18px;
          }
        }

        .statement {
          font-size: 18px;
          font-weight: 500;
          max-width: 700px;
          text-align: center;

          @media only screen and (max-width: 767px) {
            font-size: 14px;
          }
        }

        .choices {
          display: flex;
          flex-direction: row;
          justify-content: center;

          .choice {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-size: 18px;
            font-weight: 500;

            @media only screen and (max-width: 767px) {
              font-size: 16px;
            }

            .choice-circle {
              margin: 40px 40px 15px;
              width: 130px;
              height: 130px;
              border-radius: 50%;
              display: flex;
              justify-content: center;
              align-items: center;
              cursor: pointer;
              transition: 0.3s ease background-color;

              @media only screen and (max-width: 767px) {
                margin: 40px 20px 15px;
              }

              @media only screen and (max-width: 575px) {
                margin: 20px 15px 10px;
                width: 90px;
                height: 90px;
              }

              .choice-inner-circle {
                width: 100px;
                height: 100px;
                background: #fff;
                border-radius: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: 0.3s ease background-color;

                @media only screen and (max-width: 575px) {
                  width: 70px;
                  height: 70px;
                }

                i {
                  transition: 0.3s ease background-color;
                  font-size: 35px;
                  margin-top: 16px;
                }
              }
            }

            &.disagree {
              color: #f44336;

              .choice-circle {
                background-color: rgba(244, 67, 54, 0.2);

                &:hover {
                  background-color: rgba(244, 67, 54, 0.4);
                }
              }

              &.active {
                .choice-circle {
                  background-color: rgba(244, 67, 54, 0.4);

                  .choice-inner-circle {
                    background-color: #f44336;

                    i {
                      color: #fff;
                    }
                  }
                }
              }
            }

            &.agree {
              color: #4caf50;

              .choice-circle {
                background-color: rgba(76, 175, 80, 0.2);

                &:hover {
                  background-color: rgba(76, 175, 80, 0.4);
                }
              }

              &.active {
                .choice-circle {
                  background-color: rgba(76, 175, 80, 0.4);

                  .choice-inner-circle {
                    background-color: #4caf50;

                    i {
                      color: #fff;
                    }
                  }
                }
              }
            }

            .choice-rect {
              margin: 40px 20px 15px;
              width: 330px;
              height: 130px;
              border-radius: 30px;
              display: flex;
              justify-content: center;
              align-items: center;
              cursor: pointer;
              transition: 0.3s ease background-color;
              background-color: rgba(76, 175, 80, 0.2);
              padding: 5px 15px;
              text-align: center;

              @media only screen and (max-width: 1200px) {
                margin: 40px 10px 15px;
              }

              &:hover {
                background-color: rgba(76, 175, 80, 0.4);
              }

              .choice-inner-rect {
                width: 300px;
                height: 100px;
                border-radius: 20px;
                background-color: #fff;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: 0.3s ease background-color;
              }
            }

            &:not(.disagree):not(.agree).active .choice-rect {

              .choice-inner-rect {
                background-color: rgba(76, 175, 80, 0.4);
              }
            }
          }

          &:not(.disagree):not(.agree) {

            @media only screen and (max-width: 990px) {
              flex-direction: column;
            }

            .choice-rect {
              @media only screen and (max-width: 990px) {
                width: 420px;
                height: 130px;
                margin: 10px 0;
              }

              @media only screen and (max-width: 767px) {
                width: 340px;
                height: 110px;
                border-radius: 20px;
              }

              @media only screen and (max-width: 575px) {
                width: 240px;
                height: 95px;
              }

              .choice-inner-rect {
                @media only screen and (max-width: 990px) {
                  width: 390px;
                  height: 100px;
                }

                @media only screen and (max-width: 767px) {
                  font-size: 14px;
                  width: 310px;
                  height: 80px;
                  border-radius: 15px;
                }

                @media only screen and (max-width: 575px) {
                  width: 220px;
                  height: 75px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>

<style>
.participate-mbti-bartle .progress-bar .v-progress-linear__background {
  background: #e5e5e5 !important;
  right: 0 !important;
}

.participate-mbti-bartle .progress-bar .v-progress-linear__determinate {
  left: 0;
  right: auto;
}

.participate-mbti-bartle .arrow-box .v-btn {
  min-width: 10px;
  border-radius: 10px;
  opacity: 0.7;
}

.participate-mbti-bartle .arrow-box .v-btn .v-icon {
  font-size: 40px;
  color: #fff;
}

html {
  overflow: auto;
}
</style>
