class ModalBox {
  constructor(btnsTrigger) {
    this.opts = {
      classActive: 'show',
      extraClassHide: 'hide',
      timeoutClose: 200,
      widthScrollbar: 0
    }
    this.btns = document.querySelectorAll(btnsTrigger)
    this.modals = document.querySelectorAll('[data-modal]')
    this.btnsClose = document.querySelectorAll('[data-modal-close]')
    this.lastElementBeforeModal = null

    this.init()
  }

  init = () => {
    // console.log(this);
    this.events()
    this.opts.widthScrollbar = this.widthScrollbar();
  }

  events = () => {
    [].forEach.call(this.btns, btn => {
      btn.addEventListener('click', (e) => this.openModal(btn.dataset.modalTarget, e))
    });

    [].forEach.call(this.btnsClose, btn => {
      btn.addEventListener('click', (e) => this.closeModal(btn.closest('[data-modal]'), e))
    });

    [].forEach.call(this.modals, modal => {
      modal.addEventListener('click', (e) => this.backDrop(modal, e))
    })
    document.addEventListener('keydown', this.handlerKeyDownModal)
  }

  openModal = (modalTarget, event) => {
    const modal = document.querySelector(`[data-modal='${modalTarget}']`);
    if (!modal) return;
    this.lastElementBeforeModal =  document.activeElement;
    modal.classList.add(this.opts.classActive)
    modal.setAttribute('tabindex', 0);
    modal.focus();
    document.body.style.overflow = "hidden";
    document.body.style.marginRight = `${this.opts.widthScrollbar}px`;
  }

  closeModal = (modal, event) => {
    modal.classList.add(this.opts.extraClassHide);
    this.lastElementBeforeModal.focus();
    setTimeout(() => {
      modal.classList.remove(this.opts.classActive, this.opts.extraClassHide)
      document.body.style.overflow = "initial";
      document.body.style.marginRight = "0";
      modal.removeAttribute('tabindex');
    }, this.opts.timeoutClose)
  }

  closeModalAll = () => {
    [].forEach.call(this.modals, modal => {
      this.closeModal(modal)
    })
  }

  backDrop = (modal, event) => {
    if (event.target === event.currentTarget) {
      this.closeModal(modal)
    }
  }

  handlerKeyDownModal = (event) => {
    if (event.keyCode === 27) {
        this.closeModalAll()
    }
  }

  widthScrollbar = () => {
    let div = document.createElement('div');

    div.style.overflowY = 'scroll';
    div.style.width = '50px';
    div.style.height = '50px';

    // мы должны вставить элемент в документ, иначе размеры будут равны 0
    document.body.append(div);
    let scrollWidth = div.offsetWidth - div.clientWidth;

    div.remove();

    return scrollWidth;
  }
}

const modalBox = new ModalBox('[data-modal-target]')


const modalImg = document.querySelector('[data-src-modal]');

[].forEach.call(document.querySelectorAll('[data-src-img]'), img => {
  img.addEventListener('click', e => {
    const imgDom = modalImg.querySelector('img');
    imgDom.setAttribute('src', e.target.dataset.srcImg)
    imgDom.setAttribute('alt', e.target.alt)
    modalBox.openModal('image');
  })
})
