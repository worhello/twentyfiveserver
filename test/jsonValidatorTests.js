"use strict";

let jsonValidator = require('../helpers/jsonValidator');
let result = require('../helpers/result');

let assert = require('assert');

describe('JsonValidator buildValidatorWithString tests', function() {
    it('malformed json string', function() {
        var res = new result.Result();
        jsonValidator.buildValidatorWithString("object name", "{ \"foo\":", ["foo"], res);
        assert.strictEqual(res.success, false);
        assert.strictEqual(res.errorMessage, "malformed Json object");
    });

    it('valid json string', function() {
        var res = new result.Result();
        jsonValidator.buildValidatorWithString("object name", "{ \"foo\": \"bar\" }", ["foo"], res);
        assert.strictEqual(res.success, true);
        assert.strictEqual(res.errorMessage, "");
    });
});

describe("JsonValidator tests", function() {
    let objectName = "object";
    let validFields = [ "foo", "abc" ];
    it('missing fields in json', function() {
        var res = new result.Result();
        let validator = jsonValidator.buildValidatorWithJson(objectName, {
            "foo": "bar"
        }, validFields);
        validator.validate(res);
        assert.strictEqual(res.success, false);
        assert.strictEqual(res.errorMessage, "missing required fields \"abc\", from object object");
    });

    it('too many fields in json', function() {
        var res = new result.Result();
        let validator = jsonValidator.buildValidatorWithJson(objectName, {
            "foo": "bar",
            "abc": "def",
            "xyz": "abc"
        }, validFields);
        validator.validate(res);
        assert.strictEqual(res.success, false);
        assert.strictEqual(res.errorMessage, "extra invalid fields \"xyz\", present in object object");
    });

    it('missing and too many fields in json', function() {
        var res = new result.Result();
        let validator = jsonValidator.buildValidatorWithJson(objectName, {
            "foo": "bar",
            "def": "def",
            "xyz": "def"
        }, validFields);
        validator.validate(res);
        assert.strictEqual(res.success, false);
        assert.strictEqual(res.errorMessage, "extra invalid fields \"def\", \"xyz\", present in object object");
    });

    it('correct fields in json', function() {
        var res = new result.Result();
        let validator = jsonValidator.buildValidatorWithJson(objectName, {
            "foo": "bar",
            "abc": "def"
        }, validFields);
        validator.validate(res);
        assert.strictEqual(res.success, true);
        assert.strictEqual(res.errorMessage, "");
    });
});