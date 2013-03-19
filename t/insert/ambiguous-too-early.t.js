#!/usr/bin/env node

require('./proof')(3, function (step, Strata, tmp, deepEqual, serialize, gather, ok) {
  var strata = new Strata(tmp, { leafSize: 3, branchSize: 3 }), fs = require('fs'), ambiguity = [];
  step(function () {
    serialize(__dirname + '/fixtures/ambiguous.before.json', tmp, step());
  }, function () {
    strata.open(step());
  }, function () {
    gather(step, strata);
  }, function (records) {
    deepEqual(records, [ 'a', 'b', 'd', 'f', 'g', 'h', 'i', 'l', 'm', 'n' ], 'records');
  }, function () {
    strata.mutator('a', step());
  }, function (cursor) {
    var page;
    step(page = function () {
      cursor.indexOf('z', step());
    }, function (index) {
      cursor.insert('z', 'z', ~index, step());
    }, function (unambiguous) {
      ambiguity.unshift(unambiguous);
      if (!ambiguity[0]) {
        cursor.next(step(page));
      } else {
        deepEqual(ambiguity, [ true, false, false, false ], 'unambiguous');
        cursor.unlock();
      }
    });
  }, function () {
    gather(step, strata);
  }, function (records) {
    deepEqual(records, [ 'a', 'b', 'd', 'f', 'g', 'h', 'i', 'l', 'm', 'n', 'z' ], 'records after insert');
  }, function() {
    strata.close(step());
  });
});
