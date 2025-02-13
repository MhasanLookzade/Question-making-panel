import {Question} from "@/models/Question";

const mixinUserActionOnQuestion = {
    methods: {
        userActionOnQuestion(questionId, actionType, data, socket, sendData, callback) {
            let examId = this.quiz.id
            let exam_user_id = this.quiz.user_exam_id
            this.beforeUserActionOnQuestion(examId, questionId)
            let userExamData = this.userQuizListData[examId]
            if (!userExamData) {
                return
            }
            let userQuestionData = userExamData[questionId]
            if (!userQuestionData) {
                return
            }
            if (actionType === 'answer') {
                this.userActionOnQuestion_answer(data, examId, questionId, userQuestionData)
            } else if (actionType === 'bookmark') {
                this.userActionOnQuestion_bookmark(examId, questionId, userQuestionData)
            } else if (actionType === 'status') {
                this.userActionOnQuestion_status(data, examId, questionId, userQuestionData)
            }
            this.afterUserActionOnQuestion()
            if (typeof sendData === 'undefined' || sendData === true) {
                return this.sendUserQuestionsDataToServer(exam_user_id, userExamData, questionId, actionType, socket, callback)
            }
            return false
        },
        beforeUserActionOnQuestion(examId, questionId) {
            this.$store.commit('updateCurrentQuestion', {
                newQuestionId: questionId,
                currentExamQuestions: this.getCurrentExamQuestions()
            })
            this.$store.commit('changeQuestion_RefreshQuestionObject', {
                exam_id: examId,
                question_id: questionId
            })
        },
        afterUserActionOnQuestion() {
            this.$store.commit('updateUserQuizListDataExam', this.userQuizListData)
        },
        getUserQuestionDataFromLocalstorage(userExamData, questionId) {
            // find question
            let userQuestionData = userExamData[questionId]
            let dataToSendFailedAnswers = this.$store.state.failedListAnswerData
            let dataToSendFailedStatus = this.$store.state.failedListStatusData
            let dataToSendFailedBookmark = this.$store.state.failedListBookmarkData

            // set data from localstorage of user
            let dataToSendAnswer = [{
                question_id: questionId,
                choice_id: userQuestionData.answered_choice_id,
                selected_at: userQuestionData.answered_at
            }]

            let dataToSendStatus = {question_id: questionId, status: userQuestionData.status, selected_at: userQuestionData.change_status_at}
            let dataToSendBookmark = {
                questionId,
                selected_at: userQuestionData.change_bookmarked_at
            }

            return {
                userQuestionData,
                dataToSendAnswer,
                dataToSendFailedAnswers,
                dataToSendFailedStatus,
                dataToSendFailedBookmark,
                dataToSendStatus,
                dataToSendBookmark
            }
        },
        sendUserQuestionsDataToServer(examUserId, userExamData, questionId, actionType, socket, callback) {

            let userQuestionDataFromLocalstorage = this.getUserQuestionDataFromLocalstorage(userExamData, questionId)
            let online = navigator.onLine
            // send data
            let question = new Question()
            if (!online){
                return false
            }

            if (actionType === 'answer') {
                return question.sendUserActionToServer('answer' ,examUserId, {answerArray: userQuestionDataFromLocalstorage.dataToSendAnswer , failedAnswersArray: userQuestionDataFromLocalstorage.dataToSendFailedAnswers}, socket, callback)
            }
            if (actionType === 'bookmark') {
                if (userQuestionDataFromLocalstorage.userQuestionData.bookmarked) {
                    return question.sendUserActionToServer('bookmark' ,examUserId, {bookmark: userQuestionDataFromLocalstorage.dataToSendBookmark , failedBookmarksArray: userQuestionDataFromLocalstorage.dataToSendFailedBookmark}, socket, callback)
                } else {
                    return question.sendUserActionToServer('unBookmark' ,examUserId, {bookmark: userQuestionDataFromLocalstorage.dataToSendBookmark , failedBookmarksArray: userQuestionDataFromLocalstorage.dataToSendFailedBookmark}, socket, callback)
                }
            }
            if (actionType === 'status') {
                return question.sendUserActionToServer('status' ,examUserId, {status: userQuestionDataFromLocalstorage.dataToSendStatus , failedStatusArray: userQuestionDataFromLocalstorage.dataToSendFailedStatus}, socket, callback)
            }
        },
        userActionOnQuestion_answer(data, examId, questionId, userQuestionData) {
            let oldStatus = userQuestionData.status
            let oldAnswered_choice_id = userQuestionData.answered_choice_id
            let newAnswered_choice_id = data.choiceId
            if (oldAnswered_choice_id === newAnswered_choice_id) {
                newAnswered_choice_id = null
            } else if (oldStatus === 'x') {
                let newState = ''
                data.newStatus = newState
                const newuserQuestionData = JSON.parse(JSON.stringify(userQuestionData))
                newuserQuestionData.status = oldStatus
                this.userActionOnQuestion_status(data, examId, questionId, newuserQuestionData)
            }
            this.$store.commit('changeQuestion_SelectChoice', {
                exam_id: examId,
                question_id: questionId,
                answered_choice_id: newAnswered_choice_id
            })
        },
        userActionOnQuestion_bookmark(examId, questionId, userQuestionData) {
            this.$store.commit('changeQuestion_RefreshQuestionObject', {
                exam_id: examId,
                question_id: questionId
            })
            let oldBookmarked = userQuestionData.bookmarked
            let newBookmark = !(oldBookmarked)
            this.$store.commit('changeQuestion_Bookmark', {
                exam_id: examId,
                question_id: questionId,
                bookmarked: newBookmark
            })
        },
        userActionOnQuestion_status(data, examId, questionId, userQuestionData) {
            let newStatus = data.newStatus
            let oldQuestion = userQuestionData
            let oldStatus = (!oldQuestion) ? false : oldQuestion.status
            if (oldQuestion && newStatus === oldStatus) {
                newStatus = ''
            } else if (newStatus === 'x') {
                const newuserQuestionData = JSON.parse(JSON.stringify(userQuestionData))
                newuserQuestionData.status = newStatus
                data.choiceId = null
                this.userActionOnQuestion_answer(data, examId, questionId, newuserQuestionData)
            }
            this.$store.commit('changeQuestion_Status', {
                exam_id: examId,
                question_id: questionId,
                status: newStatus
            })
        },
        sendAnswersAndFinishExam() {

        }
    }
}

export default mixinUserActionOnQuestion
