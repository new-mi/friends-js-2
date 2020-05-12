class SHBlock {
  constructor(domElement) {
    this.opts = {
      classActive: "visible"
    }
    this.el = domElement;
    this.container = domElement.querySelector('[data-sh-container]')
    this.button = domElement.querySelector('[data-sh-button]')
    this.buttonSpan = this.button.querySelector('span')
    this.isOpen =  this.button.getAttribute('data-sh-button') === 'true' ? true : false
    this.textHide = this.button.getAttribute('data-sh-hide')
    this.textOpen = this.button.getAttribute('data-sh-show')

    this.init()
  }

  init = () => {
    this.setButtonText();
    this.setBlockClass();
    this.button.addEventListener('click', this.changeState)
  }

  //Изменение текста в кнопке
  setButtonText = () => {
    if (this.isOpen) {
      this.buttonSpan.innerHTML = this.textHide
    } else {
      this.buttonSpan.innerHTML = this.textOpen
    }
  }

  //Изменение класса блока
  setBlockClass = () => {
    if (this.isOpen) {
      this.el.classList.add(this.opts.classActive)
    } else {
      this.el.classList.remove(this.opts.classActive)
    }
  }

  //Изменение состояния блока
  changeState = () => {
    this.isOpen = !this.isOpen;
    this.setButtonText();
    this.setBlockClass();
  }
}

const SHBlocks = document.querySelectorAll('[data-sh-block]');

if (SHBlocks.length > 0) {
  SHBlocks.forEach(block => {
    new SHBlock(block)
  })
}
