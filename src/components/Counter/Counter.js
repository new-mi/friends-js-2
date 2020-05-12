class Counter {
  constructor(domElement) {
    this.el = domElement
    this.btnDescr = this.el.querySelector('[data-counter-descr]')
    this.btnIncr = this.el.querySelector('[data-counter-incr]')
    this.numberTitle = this.el.querySelector('[data-counter-number]')
    this.number = +this.el.getAttribute('data-number') || 0

    this.init()
  }

  init = () => {
    this.renderNumber();
    this.events();
  }

  events = () => {
    this.btnDescr.addEventListener('click', this.handlerBtn.bind(this, 'descr'))
    this.btnIncr.addEventListener('click', this.handlerBtn.bind(this, 'incr'))
  }

  renderNumber = () => {
    this.numberTitle.innerHTML = this.number;
  }

  handlerBtn = (type) => {
    if (type === 'descr') {
      if (this.number < 1) this.number = 0
      else this.number = this.number - 1
    }
    if (type === 'incr') {this.number = this.number + 1}
    this.renderNumber();
  }

}
