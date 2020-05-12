const map = document.querySelector('#map');
const coordsMap = [55.996116, 37.211498]
// Функция ymaps.ready() будет вызвана, когда
// загрузятся все компоненты API, а также когда будет готово DOM-дерево.
map && ymaps.ready(initMap);

function initMap(){
  // Создание карты.
  var myMap = new ymaps.Map("map", {
    // Координаты центра карты.
    // Порядок по умолчанию: «широта, долгота».
    // Чтобы не определять координаты центра карты вручную,
    // воспользуйтесь инструментом Определение координат.
    center: coordsMap,
    // Уровень масштабирования. Допустимые значения:
    // от 0 (весь мир) до 19.
    zoom: 15,
    controls: []
    });

    var myPlacemark = new ymaps.GeoObject({
      geometry: {
      type: "Point",
      coordinates: coordsMap
    }
    });
    // Размещение геообъекта на карте.
    myMap.geoObjects.add(myPlacemark);
}
