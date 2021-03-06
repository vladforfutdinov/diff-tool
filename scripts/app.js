'use strict';

angular.module('diff-tool', [])
  .directive('diffTool', function () {
    return {
      restrict: 'E',
      scope:    {
        sections: '@'
      },
      replace:  true,
      template: '<div class="flex-container flex-column"><div class="main flex-item flex-container flex-row">' +
                '<div class="fieldset flex-item flex-container flex-row" ng-repeat="field in fields track by $index">' +
                '<div class="input flex-item flex-container flex-column">' +
                '<label ng-attr-for="field + {{$index}}" class="flex-item flex-container flex-row label">' +
                '<span class="flex-item title"><span ng-bind="field[0] || \'Section \' + ($index + 1)"></span></span>' +
                '<span class="flex-item control">' +
                '<button tabindex="-1" class="btn btn-add btn-add_before" type="button" ng-click="addField($index, -1)"><span>+</span></button>' +
                '<button tabindex="-1" class="btn" type="button" ng-click="removeField($index)"><span>&ndash;</span></button>' +
                '<button tabindex="-1" class="btn btn-add btn-add_after" type="button" ng-click="addField($index, +1)"><span>+</span></button>' +
                '</span></label>' +
                '<div class="data-wrapper flex-item flex-container">' +
                '<input-field strings="fields[$index]" ng-attr-id="field + {{$index}}" class="input-container flex-item"></input-field>' +
                '</div></div>' +
                '<div class="output flex-item flex-container flex-column" ng-if="diffs[$index]">' +
                '<label class="flex-item label">Difference</label>' +
                '<div class="data-wrapper flex-item flex-container">' +
                '<div class="data-container flex-item">' +
                '<p class="string" ng-repeat="item in diffs[$index] track by $index" ng-class="item.state"><span ng-bind="item.text"></span></p>' +
                '</div></div></div>' +
                '</div></div></div>',
      link:     function (scope) {
        var isEmpty    = function (val) {return val == undefined || val.length === 0;},
            getTrimmed = function (val) {return (val || '').trim();},
            compare    = function (arr1, arr2) {
              var result  = [],
                  aligned = align(arr1, arr2),
                  max     = aligned[0].length > aligned[1].length ? aligned[0].length : aligned[1].length;

              for (var i = 0; i < max; i++) {
                var val1    = aligned[0][i],
                    val2    = aligned[1][i],
                    trim1   = getTrimmed(val1),
                    trim2   = getTrimmed(val2),
                    isEqual = trim1 === trim2,
                    empty1  = isEmpty(trim1),
                    isDiff  = !empty1 && !isEmpty(trim2) && trim1 !== trim2;

                result.push({
                  text:  isEqual ? val1 : (isDiff ? val1 + ' | ' + trim2 : (empty1 ? val2 : val1)),
                  state: isEqual ? 'equal' : (isDiff ? 'diff' : (empty1 ? 'added' : 'deleted'))
                });
              }

              return result;
            },
            align      = function (arr1, arr2) {
              var startPos = 0,
                  result   = [arr1.slice(), arr2.slice()],
                  insert   = function (arr, pos, qty) {
                    for (var i = 0; i < qty; i++) {
                      arr.splice(pos, 0, '');
                    }
                  },
                  addLines = function (arr1Pos, arr2Pos) {
                    if (arr1Pos < arr2Pos)
                      insert(result[0], arr1Pos, arr2Pos - arr1Pos);

                    if (arr1Pos > arr2Pos)
                      insert(result[1], arr2Pos, arr1Pos - arr2Pos);
                  };

              if (!isEmpty(arr1) && !isEmpty(arr2))
                while (result[0].length !== result[1].length) {
                  var stop = false;

                  for (var j = startPos, lj = result[1].length; j < lj; j++) {
                    for (var i = startPos, li = result[0].length; i < li; i++) {
                      if (getTrimmed(result[0][i]) === getTrimmed(result[1][j])) {
                        addLines(i, j);
                        startPos = Math.abs(i - j) + 1;
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
            },

            init       = function (sections) {
              for (var i = 0; i < sections; i++) {
                scope.fields.push([]);

                if (i < sections - 1)
                  scope.diffs.push([]);
              }
            };

        scope.fields = [];
        scope.diffs = [];

        init(scope.sections);

        scope.$watchCollection('fields', function (data) {
          if (angular.isUndefined(data)) return;

          for (var i = 0; i < scope.diffs.length; i++) {
            if (scope.fields[i] != '' && scope.fields[i + 1] != '')
              scope.diffs[i] = compare(scope.fields[i], scope.fields[i + 1]);
          }
        });

        scope.addField = function (index, step) {
          step = step < 1 ? 0 : step;

          scope.diffs.splice(index + step, 0, []);
          scope.fields.splice(index + step, 0, []);
        };

        scope.removeField = function (index) {
          console.log(index, scope.fields);

          scope.diffs.splice(index, 1);
          scope.fields.splice(index, 1);

          console.log(index, scope.fields);
        }
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
        if (angular.isDefined(attrs.debug))
          scope.text = scope.debug;

        scope.$watch('text', function (data) {
          if (angular.isUndefined(data)) return;

          scope.strings = data.split('\n');
        });

        scope.$watch('strings', function (data) {
          if (angular.isUndefined(data)) return;

          scope.text = data.join('\n');
        });
      }
    }
  });

