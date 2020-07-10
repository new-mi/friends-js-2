class Cart {
  static url = "./assets/js/products.json";
  static limit = 3600 * 1000; // 1 час

  constructor() {
    this.cart = [];
    this.products = [];
    this.modalElement = null;
    this.modal = document.querySelector("[data-cart-modal]") || null;
    this.modalAddButton =
      document.querySelector("[data-cart-modal-add]") || null;
    this.cartList = document.querySelector("[data-cart]") || null; //список продуктов в корзине
    this.totalElement = document.querySelectorAll("[data-cart-total]") || null; //список продуктов в корзине
    this.countCartElement = document.querySelector("[data-cart-count]") || null; //колличество в корзине

    this._fetchProducts();
  }

  _init = () => {
    // console.log(this);
    // this._renderMainList();
    this._renderItemsCard("data-products-item", this._renderProductCart);
    this._renderDopSlider();
    this._events();

    const storage = JSON.parse(this._getLocalStorage());
    if (storage) this.cart = storage;

    this._renderCount();
    this._renderCart();
    this._renderTotal();
    this._checkBtnSubmit();
  };

  //запрос продукции
  _fetchProducts = () => {
    fetch(Cart.url)
      .then((res) => res.json())
      .then((res) => {
        this.products = res.map((r) => {
          r.ingShow = false;
          r.el = null;
          r.total = r.price;
          r.isDelete = true;
          return r;
        });
        this._init();
      })
      .catch((err) => console.error(err));
  };

  //добавление общих событий
  _events = () => {
    if (this.modalAddButton)
      this.modalAddButton.addEventListener(
        "click",
        this._handlerAddCartFromModal
      );
  };

  //запись в localstorage
  _setLocalStorage = () => {
    localStorage.setItem("cartTimestap", +new Date());
    localStorage.setItem("cart", JSON.stringify(this.cart));
  };

  //получение из localstorage
  _getLocalStorage = () => {
    var cartTimestap = localStorage.getItem("cartTimestap");
    if (+new Date() - cartTimestap > Cart.limit) {
      this._clearLocalStorage();
    }

    return localStorage.getItem("cart");
  };

  //очистка корзины localstorage
  _clearLocalStorage = () => {
    localStorage.removeItem("cart");
  };

  //check btn submit
  _checkBtnSubmit = () => {
    let btns = document.querySelectorAll("button[data-cart-submit]");
    const total = this._getTotal();
    btns.forEach((btn) => {
      if (total < 1000) {
        btn.classList.add("disabled");
      } else {
        btn.classList.remove("disabled");
      }
    });
  };

  //обновление без списка в корзине
  _reRenderWithoutCart = () => {
    this._setLocalStorage();
    this._renderCount();
    this._renderTotal();
    this._checkBtnSubmit();
  };

  //обновление вместе со списком в корзине
  _reRenderWithCart = () => {
    this._setLocalStorage();
    this._renderCount();
    this._renderCart();
    this._renderTotal();
    this._checkBtnSubmit();
  };

  _getTotal = () => {
    const total = this.cart.reduce((acc, item) => {
      return (acc += item.total);
    }, 0);
    return total;
  };

  //просчет и рендер общей суммы товаров
  _renderTotal = () => {
    const total = this._getTotal();
    [].forEach.call(this.totalElement, (el) => {
      el.innerText = `${total} руб`;
    });
  };

  //рендер колличества товара в корзине
  _renderCount = () => {
    if (!this.countCartElement) return;
    const result = this.cart.reduce((acc, item) => {
      return (acc = acc + item.count);
    }, 0);
    this.countCartElement.innerHTML = result;
  };

  // render корзины
  _renderCart = () => {
    if (!this.cartList) return;
    if (!this.cart.length) {
      this.cartList.innerHTML = "Корзина пуста";
      return;
    }
    this.cartList.innerHTML = "";
    this.cart.forEach((item, index) => {
      if (index === 0) {
        item.ingShow = true;
      } else {
        item.ingShow = false;
      }
      this.cartList.append(this._renderCartItem(item));
    });
  };

  //перерендер продукта
  _reRender = (el, product) => {
    const newEl = this._renderCartItem(product);
    el.parentNode.insertBefore(newEl, el);
    el.remove();
    this._reRenderWithoutCart();
  };

  //проверка ингредиентов
  /* 0 - не похожи
     1 - похожи
  */
  _equalIngredients = (ar1, ar2) => {
    let status = 1;
    ar1.forEach((item) => {
      ar2.forEach((item2) => {
        // console.log(item.name, item2.name, item.inProduct, item2.inProduct);
        // console.warn(item.name === item2.name, item.inProduct !== item2.inProduct);

        if (item.name === item2.name && item.inProduct !== item2.inProduct) {
          status = 0;
        }
      });
    });
    return status;
  };
  //проверка по id в корзине
  _equalFromId = (id) => {
    return !!this.cart.filter((item) => item.id === id).length;
  };
  //возвращение элементов из корзины по id
  _returnFromId = (id) => {
    const res = [];
    this.cart.forEach((p, i) => {
      if (p.id === id) res.push({ element: p, index: i });
    });
    return res;
  };

  //проверка в корзине товара
  /*
    0 - нет такого товара в продукции
    1 - нет результата в корзине по id
    2 - результат или пустой массив или массив с элементом и индексом
  */
  _equalInCart = (idOrProduct, callback) => {
    let product =
      typeof idOrProduct === "string"
        ? this.products.find((p) => p.id === idOrProduct)
        : idOrProduct;
    if (!product) return callback(0);

    const cards = this._returnFromId(product.id);
    if (!cards.length) return callback(1);

    let res = [];
    cards.forEach((card) => {
      if (card.element.ingredients) {
        if (
          !!this._equalIngredients(
            card.element.ingredients,
            product.ingredients
          )
        ) {
          res = [card.element, card.index];
        }
      } else {
        res = [card.element, card.index];
      }
    });

    callback(2, res);
  };

  //удаление из корзины
  _remove = (product) => {
    this._equalInCart(product, (status, res) => {
      // console.log(status, res)
      this.cart.splice(res[1], 1);
      product.el.remove();
    });

    this._reRenderWithCart();
  };

  //просчет общей суммы в элементе продукта
  _resultPrice = (product) => {
    let price = product.price * product.count;

    if (product.ingredients) {
      product.ingredients.forEach((ing) => {
        if (ing.inProduct) {
          price = price + product.count * ing.price;
        }
      });
    }

    return price;
  };

  //инициализация слайдера с доп продуктами
  _initDopSlider = () => {
    return new Swiper(".cart__dop-slider.swiper-container", {
      navigation: {
        nextEl: ".cart__dop-navs .stocks-slider__nav_next",
        prevEl: ".cart__dop-navs .stocks-slider__nav_prev",
      },
      slidesPerView: "auto",
      spaceBetween: 12,
      freeMode: true,
    });
  };

  //создание карточки продукта
  _renderProductCart = (id) => {
    const libTypeCard = {
      ellipse: "product-card_ellipse",
      semicircle: "product-card_semicircle",
      empty: "product-card_empty",
      "no-img": "product-card_no-img",
    };
    const product = this.products.find((p) => p.id === id);
    if (!product) return null;

    const card = document.createElement("div");
    card.className = `product-card ${
      product.cartType !== "" ? libTypeCard[product.cartType] : ""
    }`;

    const imgWrap = document.createElement("div");
    imgWrap.classList.add("product-card__img");

    const imgVapor = document.createElement("img");
    imgVapor.classList.add("product-card__vapor");
    imgVapor.src = "./assets/img/vapor.svg";

    const imgProduct = document.createElement("img");
    imgProduct.src = product.img;

    const box = document.createElement("div");
    box.classList.add("product-card__box");

    const title = document.createElement("h4");
    title.classList.add("f_subtitle", "product-card__title");
    title.innerText = product.name;

    const info = document.createElement("div");
    info.classList.add("product-card__info");

    if (product.isNew) {
      const newProduct = document.createElement("span");
      newProduct.classList.add("f_xl", "product-card__new");
      newProduct.innerText = "Новинка";
      info.append(newProduct);
    }

    const price = document.createElement("span");
    price.classList.add("f_xl", "f_mon", "product-card__price");
    price.innerText = `${product.price} руб`;

    const descr = document.createElement("p");
    descr.classList.add("product-card__descr");
    descr.innerText = product.descr;

    const actions = document.createElement("div");
    actions.classList.add("product-card__actions");

    const button = document.createElement("div");
    button.classList.add(
      "button",
      "button_orange",
      "button_small",
      "product-card__button"
    );
    button.type = "button";
    button.dataset.cartProduct = product.id;
    button.innerHTML = `<img class="icon first" src="./assets/img/i-cart-add.svg"> В корзину`;
    button.addEventListener(
      "click",
      this._handlerOpenModal.bind(this, product.id)
    );

    imgWrap.append(imgProduct);
    if (product.cartType === "semicircle") imgWrap.append(imgVapor);

    info.append(price);

    actions.append(button);

    box.append(title);
    box.append(info);
    box.append(descr);
    box.append(actions);

    if (product.img !== false) card.append(imgWrap);
    card.append(box);

    return card;
  };

  //создание карточек в дом
  _renderItemsCard = (dataAttr, fn) => {
    const listElms = document.querySelectorAll("[" + dataAttr + "]");
    if (!listElms) return;
    [...listElms].forEach((item) => {
      const idItem = item.getAttribute(dataAttr);
      const card = fn(idItem);
      if (!card) return;

      item.parentNode.insertBefore(card, item);
      item.remove();
    });
  };

  //создание элемента в корзине
  _renderCartItem = (product) => {
    if (!product) return null;

    product.total = this._resultPrice(product);

    const card = document.createElement("div");
    card.className = "cart-item";

    const thumb = document.createElement("div");
    thumb.className = "cart-item__thumb";

    const imgThumb = document.createElement("img");
    imgThumb.src = product.img;

    const box = document.createElement("div");
    box.className = "cart-item__box";

    const row = document.createElement("div");
    row.className = "cart-item__row";

    const info = document.createElement("div");
    info.className = "cart-item__info";

    const title = document.createElement("p");
    title.className = "f_xl cart-item__title";
    title.innerText = product.name;

    const descr = document.createElement("p");
    descr.className = "f_xs cart-item__descr";
    descr.innerText = product.descr;

    const counter = this._renderCounter(product);

    const price = document.createElement("p");
    price.className = "f_xl f_mon cart-item__price";
    price.innerText = `${product.total} руб`;

    const deleteElement = document.createElement("div");
    deleteElement.className = "icon cart-item__delete";
    deleteElement.tabIndex = 0;
    deleteElement.innerHTML = `
      <svg viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.25 4H14.25V2.125C14.25 1.29766 13.5773 0.625 12.75 0.625H5.25C4.42266 0.625 3.75 1.29766 3.75 2.125V4H0.75C0.335156 4 0 4.33516 0 4.75V5.5C0 5.60313 0.084375 5.6875 0.1875 5.6875H1.60312L2.18203 17.9453C2.21953 18.7445 2.88047 19.375 3.67969 19.375H14.3203C15.1219 19.375 15.7805 18.7469 15.818 17.9453L16.3969 5.6875H17.8125C17.9156 5.6875 18 5.60313 18 5.5V4.75C18 4.33516 17.6648 4 17.25 4ZM12.5625 4H5.4375V2.3125H12.5625V4Z"></path>
      </svg>
    `;
    deleteElement.addEventListener("click", () => {
      this._remove(product);
    });

    const row2 = document.createElement("div");
    row2.className = "cart-item__row";

    if (product.ingredients) {
      const ingredients = this._renderIngredients(product);
      row2.append(ingredients);
    }

    thumb.append(imgThumb);

    info.append(title);
    info.append(descr);

    row.append(info);
    row.append(counter);
    row.append(price);
    if (product.isDelete) row.append(deleteElement);

    box.append(row);
    box.append(row2);

    if (product.img !== false) card.append(thumb);
    card.append(box);

    product.el = card;

    return card;
  };
  //создание элемента ингредиентов
  _renderIngredients = (product) => {
    const wrap = document.createElement("div");
    wrap.className = `f_xs cart-item__ingredients ingredients${
      product.ingShow ? " visible" : ""
    }`;
    wrap.dataset.ingredients;

    const title = document.createElement("div");
    title.className = "ingredients__title";
    title.dataset.ingredientsHead = "";
    title.innerHTML =
      'Изменить ингридиенты <img class="icon" src="./assets/img/i-top.svg">';

    title.addEventListener("click", () => {
      product.ingShow = !product.ingShow;
      this._reRender(product.el, product);
    });

    const box = document.createElement("div");
    box.className = "ingredients__box";
    box.dataset.ingredientsBox = "";

    product.ingredients.forEach((item) => {
      const label = document.createElement("label");
      label.className =
        "ingredients__item" + (item.disabled ? " disabled" : "");

      const input = document.createElement("input");
      if (item.radio) {
        input.type = "checkbox";
        input.name = item.radio;
        input.addEventListener("change", () => {
          product.ingredients.forEach((ing) => {
            if (ing.radio === item.radio && ing !== item) {
              ing.inProduct = false;
            }
            item.inProduct = true;
          });
          this._reRender(product.el, product);
        });
      } else {
        input.type = "checkbox";
        input.addEventListener("change", () => {
          item.inProduct = !item.inProduct;
          this._reRender(product.el, product);
        });
      }
      input.checked = item.inProduct ? true : false;
      input.disabled = item.disabled ? true : false;

      const span = document.createElement("span");

      label.append(input);
      label.append(span);
      label.append(
        `${item.name} ${item.price ? "+" + item.price + " руб" : ""}`
      );

      box.append(label);
    });

    wrap.append(title);
    wrap.append(box);

    return wrap;
  };

  //создание элемента счетчика
  _renderCounter = (product) => {
    const counter = document.createElement("div");
    counter.className = "cart-item__counter counter";

    const counterSpan = document.createElement("span");
    counterSpan.className = "f_xl f_normal f_os counter__number";
    counterSpan.innerText = product.count;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "counter__btn";
    btn.innerText = "−";
    btn.addEventListener("click", () => {
      if (product.count > 1) {
        product.count = product.count - 1;
      } else {
        return;
      }
      this._reRender(product.el, product);
    });

    const btn2 = document.createElement("button");
    btn2.type = "button";
    btn2.className = "counter__btn";
    btn2.innerText = "+";
    btn2.addEventListener("click", () => {
      product.count = product.count + 1;
      this._reRender(product.el, product);
    });

    counter.append(btn);
    counter.append(counterSpan);
    counter.append(btn2);

    return counter;
  };

  //создание карточки в слайдере с доп продукцией
  _rednderDopCard = (id) => {
    const product = this.products.find((p) => p.id === id);
    if (!product) return null;

    const card = document.createElement("div");
    card.className = "cart-item-dop";
    card.addEventListener("click", () => {
      this._handlerOpenModal(product.id);
    });

    const row = document.createElement("div");
    row.className = "cart-item-dop__row";

    const thumb = document.createElement("div");
    thumb.className = "cart-item-dop__thumb";

    const imgThumb = document.createElement("img");
    imgThumb.src = product.img;

    const info = document.createElement("div");
    info.className = "cart-item-dop__info";

    const title = document.createElement("p");
    title.className = "f_sm f_ma f_sbold cart-item-dop__title";
    title.innerText = product.name;

    const price = document.createElement("p");
    price.className = "f_xs f_mom f_sbold cart-item-dop__price";
    price.innerText = `${product.price} руб`;

    const row2 = document.createElement("div");
    row2.className = "cart-item-dop__row";

    const button = document.createElement("button");
    button.className = "button button_card-dop f_xs f_sbold cart-item-dop__btn";
    button.innerHTML = `
      <svg class="icon first" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M14.8905 17.877C14.8261 17.7467 14.7918 17.6037 14.79 17.4585V11.2245C14.79 10.7175 15.219 10.3605 15.672 10.3605H15.7035C16.155 10.3605 16.5945 10.7175 16.5945 11.2245V16.4145H17.9475V13.473H19.887L20.133 8.96397H21.282C21.882 8.96397 22.3695 7.13397 22.3695 7.13397C22.3695 6.57897 21.8835 6.12597 21.282 6.12597H18.39L16.8375 0.670473C16.785 0.558069 16.7104 0.457418 16.6181 0.374558C16.5258 0.291697 16.4177 0.228334 16.3003 0.188271C16.1829 0.148207 16.0587 0.132268 15.935 0.14141C15.8113 0.150553 15.6907 0.184587 15.5805 0.241473L15.4725 0.295473C15.2476 0.414079 15.0772 0.614879 14.9967 0.856033C14.9162 1.09719 14.9319 1.36009 15.0405 1.58997L16.152 6.12447H6.17096L7.32296 1.59597C7.43325 1.36703 7.45098 1.10437 7.37247 0.862677C7.29396 0.620987 7.12525 0.418893 6.90146 0.298473L6.79646 0.244473C6.6867 0.186598 6.56641 0.151425 6.44275 0.141052C6.3191 0.130678 6.19463 0.145317 6.07676 0.184094C5.95888 0.222871 5.85003 0.284993 5.75669 0.366753C5.66335 0.448512 5.58743 0.548236 5.53346 0.659973L3.92396 6.12447H1.08896C0.488965 6.12447 0.00146484 6.57747 0.00146484 7.13247C0.00146484 7.13247 0.487465 8.96247 1.08896 8.96247H2.04296L2.71646 18.978C2.71646 18.978 2.79446 20.9415 5.88596 20.9415H14.892V17.877H14.8905ZM17.9535 7.49997H19.5465V9.09297H17.9535V7.49997ZM4.64096 9.04647H2.86796V7.35897H4.64096V9.04647ZM7.50897 17.613C7.50897 18.138 7.13246 18.5625 6.67046 18.5625H6.63596C6.16946 18.5625 5.79447 18.138 5.79447 17.613V11.1195C5.79447 10.5945 6.16946 10.1715 6.63596 10.1715H6.67046C7.13246 10.1715 7.50897 10.5945 7.50897 11.1195V17.613ZM12.006 17.3205C12.006 17.8215 11.661 18.228 11.235 18.228H11.2035C10.7775 18.228 10.4325 17.8215 10.4325 17.3205V11.172C10.4325 10.671 10.776 10.266 11.2035 10.266H11.235C11.6595 10.266 12.006 10.6725 12.006 11.172V17.3205Z" fill="white"></path>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M24 18.018H20.988V15.159H19.5825V18.018H16.578V19.359H19.5825V22.407H20.988V19.359H24V18.018Z" fill="white"></path>
      </svg>
      В корзину
    `;

    thumb.append(imgThumb);

    info.append(title);
    info.append(price);

    if (product.img) row.append(thumb);
    row.append(info);

    row2.append(button);

    card.append(row);
    card.append(row2);

    return card;
  };

  //создание слайдера с доп продукцией
  _renderDopSlider = () => {
    this._renderItemsCard("data-products-item-dop", this._rednderDopCard);
    this._initDopSlider();
  };

  //добавленеи в корзину элемента
  _handlerAddToCard = (id) => {
    const product = this.products.find((p) => p.id === id);
    if (!product) return;

    this._equalInCart(id, (status, res) => {
      // console.log(status, res);
      if (status === 1 || (status === 2 && !res.length)) {
        this.cart.push(JSON.parse(JSON.stringify(product)));
      } else if (status === 2 && res.length) {
        res[0].count += 1;
      }
    });
    this._reRenderWithCart();
  };

  //открытие модального окна
  _handlerOpenModal = (id) => {
    const product = this.products.find((p) => p.id === id);
    if (!product || !this.modal) return;
    this.modal.innerHTML = "";
    this.modalElement = JSON.parse(JSON.stringify(product));
    this.modalElement.isDelete = false;
    this.modalElement.ingShow = true;
    const card = this._renderCartItem(this.modalElement, false);
    this.modal.append(card);
    modalBox.openModal("cart-item");
  };

  //добавление из модального окна
  _handlerAddCartFromModal = () => {
    if (!this.modalElement) return;
    this.modalElement.isDelete = true;
    this._equalInCart(this.modalElement, (status, res) => {
      // console.log(status, res);
      if (status === 1 || (status === 2 && !res.length)) {
        const mEl = this.modalElement
        mEl.el = null
        this.cart.push(JSON.parse(JSON.stringify(this.modalElement)));
        modalBox.closeModalAll();
        this._reRenderWithCart();
        this._toastDefault();
      } else if (status === 2 && res.length) {
        res[0].count += this.modalElement.count;
        modalBox.closeModalAll();
        this._reRenderWithCart();
        this._toastDefault();
      } else {
        return;
      }
    });
  };

  //всплывашка добавления товара
  _toastDefault = () => {
    toast.default({
      content:
        '<div class="msg"><img class="icon first" src="./assets/img/i-ok.svg" />Товар добавлен в корзину</div>',
    });
  };

  getTextResultCart = () => {
    if (!this.cart.length) return "Корзина пустая";
    let res = "";
    let total = 0;
    this.cart.forEach((card) => {
      const resItem = this.getTextReasultItem(card);
      res += resItem[0];
      total += resItem[1];
    });
    res += `Общая стоимость: <b>${total} руб</b>`;
    //const el = document.createElement('div')
    //el.innerHTML = res
    //document.body.appendChild(el);
    return res;
  };

  getTextReasultItem = (product) => {
    if (!product) return;
    return [
      `${product.type}: <b>${product.name}</b>${
        product.ingredients
          ? "\n" + this.getTextReasultIngredients(product.ingredients)
          : ""
      }\n<br/>Колличество: <b>${product.count}</b><br/>Стоимость: <b>${
        product.total
      } руб</b><br/><br/>`,
      product.total,
    ];
  };

  getTextReasultIngredients = (ingredients) => {
    if (!ingredients) return;
    const minus = [], plus = [];
    let minusEl = '', plusEl = '';

    ingredients.forEach(item => {
      if (!item.inProduct && item.default) {
        minus.push(item.name)
      }
      if (item.inProduct && !item.default) {
        plus.push(item.name)
      }
    })
    if (minus.length > 0) {
      minusEl = minus
        .reduce((acc, item, i) => {
          return acc += ` <b>${item}</b>,`;
        }, "<br/>Убраны:")
        .slice(0, -1);
    }
    if (plus.length > 0) {
      plusEl = plus
        .reduce((acc, item, i) => {
          return acc += ` <b>${item}</b>,`;
        }, "<br/>Добавлены:")
        .slice(0, -1);
    }

    return  minusEl + plusEl
  };

  _clearCart = () => {
    this.cart = [];
    this._reRenderWithCart();
  };
}

const cart = new Cart();
