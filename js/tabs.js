"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var tabLinks = document.querySelectorAll(".chars-tabs__menu a");
var tabPanels = document.querySelectorAll(".chars__content");
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  var _loop = function _loop() {
    var el = _step.value;
    el.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(".chars-tabs__menu li.active").classList.remove("active");
      document.querySelector(".chars__content.active").classList.remove("active");
      var parentListItem = el.parentElement;
      parentListItem.classList.add("active");

      var index = _toConsumableArray(parentListItem.parentElement.children).indexOf(parentListItem);

      var panel = _toConsumableArray(tabPanels).filter(function (el) {
        return el.getAttribute("data-index") == index;
      });

      panel[0].classList.add("active");
    });
  };

  for (var _iterator = tabLinks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    _loop();
  }
} catch (err) {
  _didIteratorError = true;
  _iteratorError = err;
} finally {
  try {
    if (!_iteratorNormalCompletion && _iterator.return != null) {
      _iterator.return();
    }
  } finally {
    if (_didIteratorError) {
      throw _iteratorError;
    }
  }
}