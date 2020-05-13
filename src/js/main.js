function goBack() {
  window.history.back();
}

[].forEach.call(document.querySelectorAll("[data-back]"), (item) => {
  item.addEventListener("click", goBack);
});

const formSuccess = document.querySelector("[data-form-success]");
const form = document.querySelector("[data-form]");

// === SEND MAIL

/*WSTD AJAX*/
// prettier-ignore
!function(t){"use strict";function a(){this._url=void 0,this._params=void 0,this._handler=void 0}a.prototype.send=function(){if(this._checkResending(this._params)){var t=this;$.ajax({type:"POST",contentType:false,processData:false,url:this._url,data:this._params}).done(function(a){t._handler(a)}).fail(function(t,a,i){alert(a+": "+t.status+" ("+t.statusText+")")})}},a.prototype.setData=function(t,a,i){this._url=this._validateURL(i),this._params=this._validateParams(t),this._handler=this._validateHandler(a)},a.prototype._defaultHandler=function(t){console.log(t)},a.prototype._validateURL=function(a){return(void 0==a||""==a)&&(a=t.location.href),a},a.prototype._validateParams=function(t){return"object"!=typeof t&&"string"!=typeof t&&(t={}),t},a.prototype._validateHandler=function(t){return"function"!=typeof t&&(t=this._defaultHandler),t},a.prototype._checkResending=function(t){return this._lastData!=t?(this._lastData=t,!0):!1},a.prototype._lastData=void 0,t.GessAjax=a}(window);

window.wstd_ga = new GessAjax();

const formCart = document.forms["form-cart"];
if (formCart) {
  formCart.addEventListener("submit", onSubmitCartHandler);
}

function onSubmitCartHandler(e) {
  e.preventDefault();
  console.log("submit");
  sendMailCart(formCart);
}

function sendMailCart(el) {
  var data = new FormData(el),
    url = "/mail_send.php";

  data.append("Корзина", cart.getTextResultCart());

  window.wstd_ga.setData(data, handlerSendForm, url);
  window.wstd_ga.send();

  return false;
}

function handlerSendForm(d) {
  try {
    const o = JSON.parse(d);
    console.log(o);

    if (o.status === "success") {
    } else {
      //error
      console.log(d);
    }
  } catch (e) {
    throw Error(e);
  }
}
// SEND MAIL ===
