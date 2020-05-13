class Toast {
  constructor(selectorContainer) {
    this.opts = {
      effectTime: 250,
      time: 5000,
      callback: false,
      type: "",
      autoRemove: true,
      line: false,
      closeBtn: false,
    };
    this.container = document.querySelector(selectorContainer);

    this.init();
  }

  init = () => {
    [].forEach.call(["info", "danger", "warning", "success"], (name) => {
      this[name] = (options) => {
        options = Object.assign({}, { type: name }, options);

        return this.default(options);
      };
    });
    // console.log(this);
  };

  createNode = (name, attr, append, content) => {
    var node = document.createElement(name);
    for (var v in attr) {
      if (attr.hasOwnProperty(v)) node.setAttribute(v, attr[v]);
    }
    if (content) node.insertAdjacentHTML("afterbegin", content);
    if (append) append.appendChild(node);
    return node;
  };

  render = (options = {}) => {
    var toastItem = this.createNode("div", {
      class: "toast__element",
      "data-show": "false",
      role: "alert",
      "data-type": options.hasOwnProperty("type") ? options.type : "",
    });

    if (options.hasOwnProperty("header")) {
      var toastHeader = this.createNode(
        "div",
        {
          class: "toast__header",
        },
        toastItem,
        options.header
      );
    }

    if (options.hasOwnProperty("content")) {
      var toastBody = this.createNode(
        "div",
        {
          class: "toast__body",
        },
        toastItem,
        options.content
      );
    }

    if (options.hasOwnProperty("line") && options.line === true) {
      var toastLine = this.createNode(
        "span",
        {
          class: "toast__line",
          style: `transition-duration: ${options.time}ms`,
        },
        toastItem
      );
    }

    if (options.hasOwnProperty("closeBtn") && options.closeBtn === true) {
      var toastClose = this.createNode(
        "button",
        {
          class: "toast__close",
          type: "button",
          "aria-label": "Скрыть",
        },
        toastItem,
        "&times;"
      );

      toastClose.addEventListener("click", () => {
        this.remove(toastItem, options);
      });
    }

    return toastItem;
  };

  remove = (el, options) => {
    el.setAttribute("data-show", "false");
    setTimeout(() => {
      el.remove();
    }, options.effectTime);

    if (options.callback) callback(); // callback
  };

  autoRemove = (el, options) => {
    setTimeout(() => {
      this.remove(el, options);
    }, options.time);
  };

  isVisible = (el) => {
    var coords = el.getBoundingClientRect();
    return (
      coords.top >= 0 &&
      // && coords.left >= 0
      coords.bottom <= this.container.clientHeight
      // && coords.right <= (window.innerWidth || d.documentElement.clientWidth)
    );
  };

  default = (options) => {
    if (!options.content) return;

    options = Object.assign({}, this.opts, options);
    // console.log(options);

    var el = this.render(options);

    this.container.append(el);

    setTimeout(() => {
      el.setAttribute("data-show", "true");
      if (options.line) {
        el.querySelector(".toast__line").style.width = "100%";
      }
      if (options.autoRemove) {
        this.autoRemove(el, options);
      }
    }, options.effectTime);

    if (!this.isVisible(el)) {
      this.remove(this.container.firstChild, options);
    }

    return [el, options];
  };
}

const toast = new Toast("#toast");
