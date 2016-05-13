'use strict';

angular.module('diff-tool', [])
  .directive('diffToot', function () {
    return {
      restrict: 'E',
      scope:    {},
      replace:  true,
      template: '<div><div class="main flex-item flex-container flex-row">' +
                '<div class="input flex-item flex-container flex-column">' +
                '<label for="left" class="flex-item label">First file</label>' +
                '<div class="data-wrapper flex-item flex-container">' +
                '<input-field strings="fields.left" id="left" class="data-container flex-item"></input-field>' +
                '</div></div>' +
                '<div class="output flex-item flex-container flex-column">' +
                '<label for="right" class="flex-item label">Difference</label>' +
                '<div class="data-wrapper flex-item flex-container">' +
                '<div class="data-container flex-item">' +
                '<p class="string" ng-repeat="item in fields.diff track by $index" ng-class="item.state" ng-bind="item.text"></p>' +
                '</div></div></div>' +
                '<div class="input flex-item flex-container flex-column">' +
                '<label for="right" class="flex-item label">Second file</label>' +
                '<div class="data-wrapper flex-item flex-container">' +
                '<input-field strings="fields.right" id="right" class="data-container flex-item"></input-field>' +
                '</div></div></div></div>',
      link:     function (scope, elem, attrs) {
        var isEmpty = function (val) {
              return val == undefined || val.length === 0;
            },
            compare = function (arr1, arr2) {
              var result  = [],
                  max     = arr1.length > arr2.length ? arr1.length : arr2.length,
                  aligned = align(arr1, arr2);

              for (var i = 0; i <= max; i++) {
                var val1    = aligned[0][i],
                    val2    = aligned[1][i],
                    isEqual = val1 === val2,
                    empty1  = isEmpty(val1),
                    isDiff  = !empty1 && !isEmpty(val2) && val1 !== val2;

                result.push({
                  text:  isEqual ? val1 : (isDiff ? val1 + ' | ' + val2 : (empty1 ? val2 : val1)),
                  state: isEqual ? 'equal' : (isDiff ? 'diff' : (empty1 ? 'added' : 'deleted'))
                });
              }

              return result;
            },
            align   = function (arr1, arr2) {
              var result   = [arr1.slice(), arr2.slice()],
                  insert   = function (arr, pos, qty) {
                    for (var i = 0; i < qty; i++) {
                      arr.splice(pos, 0, '');
                    }
                  },
                  addLines = function (a, b) {
                    if (a < b)
                      insert(result[0], a, b - a);

                    if (a > b)
                      insert(result[1], b, a - b);
                  };

              if (!isEmpty(arr1) && !isEmpty(arr2))
                while (result[0].length !== result[1].length) {
                  var stop = false;

                  for (var i = 0, li = result[0].length; i < li; i++) {
                    for (var j = 0, lj = result[1].length; j < lj; j++) {
                      if (result[0][i] === result[1][j]) {
                        addLines(i, j);
                        stop = i !== j;

                        if (stop) break;
                      }
                      if (stop) break;
                    }
                  }

                  if (!stop)
                    addLines(result[0].length, result[1].length);
                }

              return result;
            };

        scope.fields = {left: [], right: [], diff: []};

        scope.$watchGroup(['fields.left', 'fields.right'], function (data) {
          if (angular.isUndefined(data)) return;

          scope.fields.diff = compare(data[0], data[1]);
        });
      }
    }
  })

  .directive('inputField', function () {
    return {
      restrict: 'E',
      scope:    {
        strings: '=',
        debug:   '@'
      },
      replace:  true,
      template: '<textarea ng-model="text"></textarea>',
      link:     function (scope, elem, attrs) {
        scope.text = scope.debug;

        scope.$watch('text', function (data) {
          if (angular.isUndefined(data) || data === '') return;
          scope.strings = (function (text) {
            return text.split('\n');
          })(data);
        })
      }
    }
  });


