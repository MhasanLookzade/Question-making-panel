<template>
  <div>
    <v-row justify="space-between">
      <v-col cols="3">
        <span v-if="question.id">
          سوال #
          {{ question.id }}
        </span>
      </v-col>
      <v-col cols="3">
        <p v-if="question.id">
          <span> سازنده سوال :</span> <span> فیلان دبیر</span>
        </p>
      </v-col>
      <v-col
        v-if="question.id === null"
        cols="4"
      >
        <v-row>
          <v-col>
            <v-row
              justify="end"
            >
              <v-col>
                <v-btn
                  depressed
                  rounded
                  color="green"
                  class="ml-2"
                  dark
                  width="100"
                  @click="btn_clicked('create')"
                >
                  <span color="green">
                    ذخیره
                  </span>
                </v-btn>
              </v-col>
              <v-col>
                <v-btn
                  depressed
                  rounded
                  color="white"
                  width="130"
                  @click="btn_clicked('saveDraft')"
                >
                  <v-icon color="#666666">
                    mdi-square-edit-outline
                  </v-icon>
                  پیش نویس
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
      <!--    --------------------------------------------------------------  edit page-->
      <v-col v-if="question.id && editStatus">
        <v-row>
          <v-col
            cols="4"
          >
            <span> وضعیت : </span>
            <v-chip
              color="#44a3ff"
              dark
            >
              {{ question.status.display_title }}
            </v-chip>
          </v-col>
          <v-col>
            <v-row>
              <v-col>
                <v-btn
                  depressed
                  rounded
                  color="green"
                  dark
                  width="100"
                  @click="btn_clicked('save')"
                >
                  <span color="#666666">
                    ذخیره
                  </span>
                </v-btn>
              </v-col>
              <v-col>
                <v-btn
                  depressed
                  rounded
                  color="white"
                  width="100"
                  @click="btn_clicked('cancel')"
                >
                  لغو
                </v-btn>
              </v-col>
              <v-col v-if="!isLogListVisible">
                <v-btn
                  depressed
                  rounded
                  color="#ffc107"
                  dark
                  width="80"
                  @click="btn_clicked('logListOpened')"
                >
                  <span>
                    سابقه
                  </span>
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
      <!--    --------------------------------------------------------------  show page-->

      <v-col
        v-if="!editStatus"
        data-text-align="left"
      >
        <v-row justify="end">
          <v-col cols="3">
            <v-btn
              depressed
              rounded
              color="white"
              class="ml-2"
              width="110"
              @click="btn_clicked('edit')"
            >
              <v-icon color="#666666">
                mdi-square-edit-outline
              </v-icon>
              <span color="#666666">
                ویرایش
              </span>
            </v-btn>
          </v-col>
          <v-col cols="3">
            <v-btn
              depressed
              rounded
              color="white"
              width="100"
              @click="btn_clicked('remove')"
            >
              حذف
            </v-btn>
          </v-col>
          <v-col v-if="!isLogListVisible">
            <v-btn
              depressed
              rounded
              color="#ffc107"
              dark
              width="80"
              @click="btn_clicked('logListOpened')"
            >
              <span>
                سابقه
              </span>
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <!--    --------------------------------------------------------------------;-->
  </div>
</template>


<script>
import {Question} from "@/models/Question";
export default {
  name: "NavBar",
  props: {
    question: {
      type: Question,
      default: new Question()
    },
    editStatus: {
      type: Boolean,
      default: false
    },
    pageName: {
      type: String,
      default: ''
    },
    isLogListVisible : {
      type: Boolean,
      default: true
    }
  },
  data(){
    return {
      saveBtnCols : 4 ,
      cancelBtnCols : 4
    }
  },
  methods: {
    btn_clicked(name) {
      this.$emit(name);
    },
  }
}
</script>
<style scoped>
</style>
