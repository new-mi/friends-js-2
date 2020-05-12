function goBack() {
  window.history.back();
}

[].forEach.call(document.querySelectorAll('[data-back]'), item => {
  item.addEventListener('click', goBack)
})

const formSuccess = document.querySelector('[data-form-success]');
const form = document.querySelector('[data-form]');
