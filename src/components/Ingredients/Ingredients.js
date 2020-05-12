class Ingredients {
  constructor(domElement, visible) {
    this.opts = {
      visibleClass: 'visible'
    }
    this.el = domElement
    this.head = this.el.querySelector('[data-ingredients-head')
    this.box = this.el.querySelector('[data-ingredients-box')
    this.vidible = this.el.getAttribute('data-visible') || visible || 'false'

    this.init()
  }

  init = () => {
    this.events();
    this.handlerHead();
    // console.log(this);
  }

  events = () => {
    this.head.addEventListener('click', this.handlerHead)
  }

  handlerHead = () => {
    if (this.vidible === 'true') {
      this.el.classList.add(this.opts.visibleClass)
      this.vidible = 'false';
    } else {
      this.el.classList.remove(this.opts.visibleClass)
      this.vidible = 'true';
    }
  }
}

// const ingredients = document.querySelectorAll('[data-ingredients]');

// [].forEach.call(ingredients, ingredient => {
//   new Ingredients(ingredient)
// })
