<template>
  <v-container
    v-resize="updateWindowSize"
    class="konkoor-view"
    :fluid="true"
    :style="{ height: '100%', background: 'rgb(244, 244, 244)' }"
  >
    <v-row :style="{ 'min-height': '100%' }">
      <v-col
        v-if="!isMobile"
        :md="5"
        class="questions"
        :style="{ height: windowSize.y }"
      >
        <div class="lesson">
          {{ currentLesson.title }}
        </div>
        <virtual-list
          ref="scroller"
          style="overflow-y: auto;"
          :data-key="'id'"
          :data-sources="quiz.questions.list"
          :data-component="item"
          class="questionss"
          @scroll="onScroll"
        />
      </v-col>
      <v-col
        :md="7"
        class="left-side-list"
      >
        <v-row>
          <v-col
            class="px-10 py-0 d-flex justify-space-between"
            dir="ltr"
          >
            <div class="rounded-b-xl rounded-r-xl">
              <v-menu bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    large
                    tile
                    v-bind="attrs"
                    elevation="0"
                    v-on="on"
                  >
                    <v-icon
                      class="mr-2"
                      :size="30"
                      color="#666"
                    >
                      mdi-account-circle
                    </v-icon>
                    <span v-if="user.first_name || user.last_name">
                      {{ user.first_name + ' ' + user.last_name }}
                    </span>
                  </v-btn>
                </template>
                <v-card
                  max-width="375"
                  class="mx-auto"
                  rounded="b-xl r-xl"
                >
                  <v-img
                    style="background-color: #e8e8e8;"
                    src="/img/account-circle.svg"
                    width="300px"
                    height="300px"
                    dark
                  >
                    <v-row class="fill-height">
                      <v-card-title v-if="false">
                        <v-btn
                          dark
                          icon
                          :to="{ name: 'dashboard'}"
                        >
                          <v-icon>mdi-chevron-left</v-icon>
                        </v-btn>

                        <v-spacer />

                        <v-btn
                          dark
                          icon
                          class="mr-4"
                        >
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>

                        <v-btn
                          dark
                          icon
                        >
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </v-card-title>
                      <v-spacer />
                    </v-row>
                  </v-img>
                  <v-btn
                    style="width: 100%;background: #5cbf60;color: white;letter-spacing: inherit;"
                    large
                    tile
                    elevation="0"
                  >
                    ارسال پاسخنامه
                  </v-btn>
                </v-card>
              </v-menu>
            </div>
            <v-btn
              icon
              @click="changeView('alaa')"
            >
              <v-icon>mdi-table-split-cell</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <BubbleSheet
              :info="{ type: 'pasokh-nameh' }"
              @scrollTo="scrollTo"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
    import $ from 'jquery'
    import Vue from 'vue'
    import VirtualList from 'vue-virtual-scroll-list'
    import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
    import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
    import Item from './question'
    import { mixinAuth, mixinQuiz, mixinWindowSize } from '@/mixin/Mixins'
    import BubbleSheet from "@/components/OnlineQuiz/Quiz/BubbleSheet/BubbleSheet";
    Vue.component('DynamicScroller', DynamicScroller)
    Vue.component('DynamicScrollerItem', DynamicScrollerItem)

    export default {
        name: 'PasokhbargUser',
        components: {
            'virtual-list': VirtualList,
            BubbleSheet
        },
        mixins: [mixinAuth, mixinQuiz, mixinWindowSize],
        data () {
            return {
                quizData: null,
                item: Item,
                lastTimeScrollRange: { start: 0, end: 29 },
                isMobile: false
            }
        },
        watch: {
            'windowSize.y': function () {
                $('.questions').height(this.windowSize.y)
                $('.questionss').height(this.windowSize.y - 50)
                $('.left-side-list').height(this.windowSize.y - 24)
            },
            'windowSize.x': function () {
                // const padding = this.questionListPadding()
                // $('.questions-list').css({ 'padding-right': padding })
                // $('.questions-list').css({ 'padding-left': padding })
                $('.questions-list').height(this.questionListHeight())
                this.$store.commit('AppLayout/updateDrawer', false)
            }
        },
        mounted () {
            $('.questions').height(this.windowSize.y)
            $('.questionss').height(this.windowSize.y - 50)
            $('.left-side-list').height(this.windowSize.y - 24)
            if (this.currentQuestion.id === null) {
                this.loadFirstQuestion()
            }
        },
        created () {
            if (this.windowSize.x > 959) {
                this.changeAppBarAndDrawer(false)
                if (!this.quiz.id) {
                    this.loadQuiz()
                } else {
                    this.loadUserQuizDataFromStorage()
                }
            } else {
                this.isMobile = true
            }
        },
        destroyed() {
            this.changeAppBarAndDrawer(true)
        },
        methods: {
            changeAppBarAndDrawer (state) {
                this.$store.commit('AppLayout/updateAppBarAndDrawer', state)
            },
            onScroll (event, range) {
                if (range.start !== this.lastTimeScrollRange.start || range.end !== this.lastTimeScrollRange.end) {
                    this.quiz.questions.turnIsInViewToFalse(range.start, range.end)
                }
            },
            addIsInViewBoolean () {
                for (let i = 0; i < this.quiz.questions.list.length; i++) {
                    this.quiz.questions.list[i].isInView = false
                }
            },
            scrollTo (questionId) {
                const questionIndex = this.quiz.questions.getQuestionIndexById(questionId)
                this.$refs.scroller.scrollToIndex(questionIndex)
                for (let i = 1; i < 4; i++) {
                    setTimeout(() => {
                            this.$refs.scroller.scrollToIndex(questionIndex)
                        },
                        500 / Math.ceil(this.quiz.questions.list.length / 100) * i)
                }
            },
            // ToDo: check for removal
            getFirstInViewQuestionNumber () {
                let firstQuestionInView = this.quiz.questions.list.find( (item)=> {
                    return item.isInView === true
                })
                if (firstQuestionInView) {
                    return firstQuestionInView.order + 1
                } else {
                    return false
                }
            },
            getQuestionNumber (question) {
                if (question.isInView === false) {
                    return '.question:nth-child('+(this.quiz.questions.getQuestionIndexById(question.id) + 2)+')'
                }
                return ''
            },
            changeCurrentQuestion (question) {
                if (question.id !== this.currentQuestion.id) {
                    this.currentQuestion = question
                }
            }
        }
    }
</script>

<style scoped>
    .lesson {
        height: 50px;
        border-bottom: 1px solid #ececec;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .questionss {
        overflow: hidden;
    }

    .scroller {
        height: 100%;
    }

    .timer-row {
        width: calc(58% - 150px);
        position: absolute;
        bottom: 12px;
        left: 100px;
    }

    .buttons-group {
        float: left;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }

    .left-side-list {
        overflow-y: auto;
    }

    .question-body {
        margin-bottom: 20px;
        line-height: 40px;
    }

    .questions {
        background: #fff;
        overflow-y: auto;
        overflow-x: hidden;
        position: relative;
        /*padding-right: 25px;*/
        padding: 0;
    }

    .question {
        padding: 10px 30px 10px 10px;
    }

    .choices {
        display: flex;
        flex-direction: row;
    }

    .choice {
        cursor: pointer;
        transition: all ease-in-out 0.3s;
        display: flex;
        align-items: flex-start;
    }

    .choice.active::before {
        content: "\F012C";
        display: inline-block;
        font: normal normal normal 24px/1 "Material Design Icons";
        text-rendering: auto;
        line-height: inherit;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        margin-left: 10px;
        color: #4caf50;
        font-size: 20px;
    }

    .choice:hover {
        background: #e1e1e1;
    }

    .konkoor-view {
        padding: 0;
    }

    .test {
        margin: 20px;
        border-bottom: 1px solid;
    }
</style>

<style>
    .base.textstyle.uncramped {
        display: flex;
        flex-wrap: wrap;
    }

    .konkoor-view strong em strong {
        display: none;
        font-weight: normal;
        font-style: normal;
        text-decoration: none !important;
    }

    .timer-row .col {
        padding: 0;
    }

    .v-application p {
        margin-bottom: 4px;
    }

    html {
        overflow-y: auto;
    }

    .choice p {
        display: inline-block;
        margin-right: 5px;
    }

    .question-body p:first-child {
        display: inline;
    }

    .katex-display {
        margin: 0;
    }
</style>
