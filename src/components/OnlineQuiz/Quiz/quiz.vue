<template>
  <div>
    <v-container
      v-resize="updateWindowSize"
      class="konkoor-view"
      :fluid="true"
      :style="{ height: '100%', background: 'rgb(244, 244, 244)' }"
    >
      <v-row :style="{ 'min-height': '100%' }">
        <div v-if="type === 'konkoorView'">
          <v-col
            id="questions"
            :md="5"
            class="questions"
            :style="{ height: windowSize.y }"
          >
            <DynamicScroller
              ref="scroller"
              :items="questions"
              :min-item-size="70"
              class="scroller questionss"
              :emit-update="true"
              @update="onScroll"
            >
              <template v-slot="{ item, index, active }">
                <DynamicScrollerItem
                  :item="item"
                  :active="active"
                  :data-index="index"
                >
                  <Item
                    :source="item"
                    @inView="test"
                  />
                </DynamicScrollerItem>
              </template>
            </DynamicScroller>
          </v-col>
        </div>
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
                <v-menu
                  bottom
                  :offset-y="true"
                  class="rounded-b-xl rounded-r-xl"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      large
                      tile
                      v-bind="attrs"
                      elevation="0"
                      class="pl-3"
                      v-on="on"
                    >
                      <v-icon
                        class="mr-2"
                        :size="30"
                        color="#666"
                      >
                        mdi-account-circle
                      </v-icon>
                      <span v-if="user.last_name">
                        {{ user.last_name }}
                      </span>
                      <span v-if="user.first_name">
                        {{ user.first_name }}
                      </span>
                    </v-btn>
                  </template>
                  <v-card
                    max-width="375"
                    class="mx-auto"
                    rounded="b-xl r-xl"
                  >
                    <TopMenu_OnlineQuiz />
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
                :info="{ type: 'pasokh-barg' }"
                :delay-time="0"
                @clickChoice="choiceClicked"
                @scrollTo="scrollTo"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <div v-if="type === 'konkoorView'">
        <v-row class="timer-row">
          <v-col>
            <Timer
              :daftarche="'عمومی'"
              :quiz-started-at="1607963897"
              :daftarche-end-time="1607999897"
              :height="100"
            />
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script>
    import $ from 'jquery'
    import '@/assets/scss/markdownKatex.scss'
    import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
    import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
    import Item from '@/components/OnlineQuiz/Quiz/ViewTypes/components/question'
    import { mixinAuth, mixinQuiz, mixinUserActionOnQuestion, mixinWindowSize } from '@/mixin/Mixins'
    import Timer from '@/components/OnlineQuiz/Quiz/Timer/Timer'
    import BubbleSheet from "@/components/OnlineQuiz/Quiz/BubbleSheet/BubbleSheet";
    import { TopMenu_OnlineQuiz } from '@/components/Menu/Menus'
    export default {
        name: "Quiz",
        components: {
            Timer,
            TopMenu_OnlineQuiz,
            // 'virtual-list': VirtualList,
            BubbleSheet,
            DynamicScroller,
            DynamicScrollerItem,
            Item
        },
        mixins: [mixinAuth, mixinQuiz, mixinUserActionOnQuestion, mixinWindowSize],
        props: {
            type: {
                default: 'konkoorView'
            },
            questions: {
                default: []
            }
        },
        data () {
            return {
                item: Item,
                lastTimeScrollRange: { start: 0, end: 29 },
                scrollState: 'not scrolling',
                timePassedSinceLastScroll: 0,
                setIntervalCallback: null,
                renderedQuestions: { startIndex: 0, endIndex: 0 },
                inView: []
            }
        },
        watch: {
            'windowSize.y': function () {
                $('.questions').height(this.windowSize.y)
                $('.questionss').height(this.windowSize.y)
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
            $('.questionss').height(this.windowSize.y)
            $('.left-side-list').height(this.windowSize.y - 24)
            if (this.currentQuestion.id === null) {
                this.loadFirstQuestion()
            }
            this.scrollTo(this.currentQuestion.id)
            this.changeAppBarAndDrawer(false)
            // setInterval(() => {
            //     console.clear()
            //     console.Log(this.inView)
            // }, 5000)
        },
        created () {
            if (this.windowSize.x > 959) {
                this.changeAppBarAndDrawer(false)
            } else {
                this.$router.push({ name: 'onlineQuiz.alaaView', params: { quizId: this.$route.params.quizId, questNumber: 1 } })
            }
            this.questions = this.getCurrentExamQuestionsInArray()
        },
        destroyed() {
            this.changeAppBarAndDrawer(true)
        },
        methods: {
            test (payload) {
                console.log(payload.number)
                if (payload.isInView) {
                    for (let i = 0; i < this.inView.length; i++) {
                        if (this.inView[i] === payload.number) {
                            return
                        }
                    }
                    this.inView.push(payload.number)
                }
                else {
                    for (let i = 0; i < this.inView.length; i++) {
                        if (this.inView[i] === payload.number) {
                            this.inView.splice(i, 1)
                        }
                    }
                }
            },
            changeAppBarAndDrawer (state) {
                this.$store.commit('AppLayout/updateAppBarAndDrawer', state)
            },
            changeCurrentQuestionIfScrollingIsDone () {
                // console.Log('time since last: ', this.timePassedSinceLastScroll)
                // if (startIndex !== this.lastTimeScrollRange.start || endIndex !== this.lastTimeScrollRange.end) {
                //     this.lastTimeScrollRange.start = startIndex
                //     this.lastTimeScrollRange.end = endIndex
                // }
                if (this.timePassedSinceLastScroll >= 1000) {
                    this.changeCurrentQuestionToFirstQuestionInView()
                    this.timePassedSinceLastScroll = 0
                    this.scrollState = 'not scrolling'
                    clearInterval(this.setIntervalCallback)
                    this.setIntervalCallback = null
                }
                this.timePassedSinceLastScroll += 250
            },
            updateLtr() {
              setTimeout(() => {
                document.querySelectorAll('.katex:not([dir="ltr"])').forEach(item => {
                  item.setAttribute('dir', 'ltr')
                })
              }, 1000)
            },
            onScroll (startIndex, endIndex) {
                this.updateLtr()
                this.renderedQuestions = { startIndex, endIndex }
                if (this.scrollState === 'not scrolling') {
                    this.setIntervalCallback = setInterval(() => {
                        this.changeCurrentQuestionIfScrollingIsDone()
                    }, 250)
                    this.scrollState = 'scrolling'
                }
                this.timePassedSinceLastScroll = 0
            },
            changeCurrentQuestionToFirstQuestionInView () {
                const firstInViewQuestion = this.getFirstInViewQuestionNumber()
                if (firstInViewQuestion.id === this.currentQuestion.id) {
                    return
                }
                this.changeQuestion(firstInViewQuestion.id, 'onlineQuiz.konkoorView')
            },
            // scrollTo (questionId) {
            //     if (this.quiz.questions.getQuestionById(questionId).isInView === false) {
            //         const questionIndex = this.quiz.questions.getQuestionIndexById(questionId)
            //         this.$refs.scroller.scrollToIndex(questionIndex)
            //         for (let i = 1; i < 4; i++) {
            //             setTimeout(() => {
            //                 this.$refs.scroller.scrollToIndex(questionIndex)
            //             },
            //             500 / Math.ceil(this.quiz.questions.list.length / 100) * i)
            //         }
            //     }
            // },
            scrollTo (questionId) {
                const questionIndex = this.getQuestionIndexById(questionId)
                console.log(questionIndex)
                this.$refs.scroller.scrollToItem(questionIndex)
                for (let i = 1; i < 4; i++) {
                    setTimeout(() => {
                            this.$refs.scroller.scrollToItem(questionIndex)
                        },
                        333 * i)
                }
            },
            // onIntersect (entries) {
            //     this.quiz.questions.getQuestionById(entries[0].target.id).isInView = (entries[0].intersectionRatio >= 0.5)
            // },
            // ToDo: check for removal
            getFirstInViewQuestionNumber () {
                let firstQuestionInView
                for (let i = this.renderedQuestions.startIndex; i <= this.renderedQuestions.endIndex; i++) {
                    // console.Log(i, ': ', this.questions[i].isInView)
                    if (this.questions[i].isInView === true) {
                        firstQuestionInView = this.questions[i]
                        break
                    }
                }
                if (firstQuestionInView && firstQuestionInView.id !== null) {
                    return firstQuestionInView
                } else {
                    return false
                }
            },
            choiceClicked (questionId) {
                this.scrollTo(questionId)
                this.changeQuestion(questionId)
            }
        }
    }
</script>

<style scoped>

</style>
