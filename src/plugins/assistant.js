import { Notify } from 'quasar'

const Assistant = (function () {
  function getId (id) {
    if (typeof id === 'undefined' || id === null || id === '') {
      return false
    } else {
      return id.toString()
    }
  }

  function handleAxiosError (error) {
    let messages = []
    if (error === "can't get exam file") {
      toastMessages(['مشکلی در دریافت اطلاعات آزمون رخ داده است. لطفا مجدد تلاش کنید.'])
      return
    }
    if (error === 'exam file url is not set') {
      toastMessages(['فایل آزمون ساخته نشده است.'])
      return
    }
    if (!error || !error.response) {
      return
    }
    const statusCode = parseInt(error.response.status)
    if (statusCode >= 500 && statusCode <= 599) {
      messages.push('مشکلی رخ داده است. مجدد تلاش کنید.')
    } else if (statusCode === 404) {
      messages.push('موردی یافت نشد.')
    } else if (statusCode === 401) {
      messages.push('ابتدا وارد سامانه شوید.')
    } else if (error.response.data.errors) {
      for (const [key, value] of Object.entries(error.response.data.errors)) {
        messages.push(value)
        console.log(`${key}: ${value}`)
      }
    } else if (error.response.data.error && !AjaxResponseMessages.isCustomMessage(error.response.data.error.code)) {
      messages.push(error.response.data.error.message)
    } else if (error.response.data.error && AjaxResponseMessages.isCustomMessage(error.response.data.error.code)) {
      messages.push(AjaxResponseMessages.getMessage(error.response.data.error.code))
    } else if (error.response.data) {
      for (const [key, value] of Object.entries(error.response.data)) {
        if (typeof value === 'string') {
          messages.push(value)
        } else {
          messages = messages.concat(getMessagesFromArrayWithRecursion(value))
        }
        console.log(`${key}: ${value}`)
      }
    }

    toastMessages(messages)
  }

  function toastMessages (messages) {
    messages.forEach((item) => {
      Notify.create({
        group: false,
        color: 'negative',
        message: item,
        icon: 'report_problem'
      })
    })
  }

  function getMessagesFromArrayWithRecursion (array) {
    // let messages = []
    // array.forEach(item => {
    //     if (typeof item === 'string') {
    //         messages.push(item)
    //     } else {
    //         messages = messages.concat(getMessagesFromArrayWithRecursion(item))
    //     }
    // })
    // return messages
    return array.flat(Math.min())
  }

  function reportErrors (error) {
    const location = error.location,
      message = error.message,
      data = error.data
    // console.group();
    console.groupCollapsed()
    // console.table(data);
    // console.count();

    // console.group();
    // console.time();
    // ...
    // console.timeEnd();
    // console.groupEnd();

    if (location) {
      console.error('locationCode', location)
    }
    if (message) {
      console.error('message', message)
    }
    if (data) {
      console.error('data', data)
    }

    console.trace()
    console.groupEnd()
  }

  return {
    getId,
    reportErrors,
    handleAxiosError
  }
}())

const AjaxResponseMessages = (function () {
  const messageMap = {
    0: 'مشکلی پیش آمده است. مجدد تلاش کنید.',
    400: 'ابتدا وارد سامانه شوید.',
    1: 'پیش از این در این آزمون ثبت نام انجام شده است.',
    2: 'زمان آزمون فرا نرسیده است',
    3: 'ثبت نام در این آزمون انجام نشده است.',
    4: 'دانش آموز برای این آزمون ثبت نام نکرده است.',
    5: 'نتیجه آزمونی برای این آزمون وجود ندارد.',
    6: 'پاسخنامه داوطلب پیش از این ارسال شده است.',
    7: 'زمان پاسخگویی قبل از شروع آزمون است.',
    8: 'آزمون متعلق به کاربر نیست.',
    14: 'آزمون بسته شده است.'
  }

  function isCustomMessage (statusCode) {
    return !!(messageMap[statusCode.toString()])
  }

  function getMessage (statusCode) {
    return messageMap[statusCode]
  }

  return {
    isCustomMessage,
    getMessage
  }
}())

export default Assistant
