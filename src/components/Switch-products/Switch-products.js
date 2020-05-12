class Switcher {
  constructor(domSwitcher) {
    this.opts = {
      classNav: 'active',
      classContent: 'visible'
    }
    this.el = domSwitcher
    this.nav = this.el.querySelector('[data-switcher-nav]')
    this.navChildren = this.nav.children
    this.content = this.el.querySelector('[data-switcher-content]')
    this.contentChildren = this.content.children
    this.tabIndex = 0

    this.init()
  }

  init = () => {
    [].forEach.call(this.navChildren, (child, index) => {
      child.setAttribute('data-switcher-id', index)
      child.addEventListener('click', this.handlerClickNav)
    })
    this.changeNav()
    this.changeContent()
  }

  //Изменение ссылк в навигации
  changeNav = () => {
    [].forEach.call(this.navChildren, child => child.classList.remove(this.opts.classNav))
    this.navChildren[this.tabIndex].classList.add(this.opts.classNav)
  }
  //Изменение блока контента
  changeContent = () => {
    [].forEach.call(this.contentChildren, child => child.classList.remove(this.opts.classContent))
    this.contentChildren[this.tabIndex].classList.add(this.opts.classContent)
  }

  handlerClickNav = (e) => {
    e.preventDefault();
    if (e.target && e.target.getAttribute('data-switcher-id')) {
      this.tabIndex = e.target.getAttribute('data-switcher-id')
    } else {
      this.tabIndex = e.target.closest('[data-switcher-id]')
    }

    this.changeNav()
    this.changeContent()
  }
}

const switchProducts = document.querySelectorAll('[data-switcher]')

if (switchProducts.length > 0) {
  switchProducts.forEach(product => {
    new Switcher(product)
  })
}
