"use strict";

function getMissingFieldsErrorString(superset, subset) {
    let invalidKeys = superset.filter(e => subset.indexOf(e) === -1);
    var msg = "";
    invalidKeys.forEach(function(e) {
        msg += '\"';
        msg += e;
        msg += '\", ';
    });
    return msg;
}

function getErrorMessageForTooManyInputFields(jsonKeys, validFields, objectName) {
    let error = getMissingFieldsErrorString(jsonKeys, validFields);
    if (error != "") {
        return "extra invalid fields " + error + "present in " + objectName + " object";
    }
    return "";
}

function getErrorMessageForMissingInputFields(jsonKeys, validFields, objectName) {
    let error = getMissingFieldsErrorString(validFields, jsonKeys);
    if (error != "") {
        return "missing required fields " + error + "from " + objectName + " object";
    }
    return "";
}

function validateCorrectFieldsInRequestJson(json, validFields, objectName, result) {
    let jsonKeys = Object.keys(json);
    let tooManyInputsErrorMsg = getErrorMessageForTooManyInputFields(jsonKeys, validFields, objectName);
    let missingInputsErrorMsg = getErrorMessageForMissingInputFields(jsonKeys, validFields, objectName);

    if (tooManyInputsErrorMsg != "") {
        result.success = false;
        result.errorMessage = tooManyInputsErrorMsg;
    }
    else if (missingInputsErrorMsg != "") {
        result.success = false;
        result.errorMessage = missingInputsErrorMsg;
    }
    else {
        result.success = true;
    }
}

class JsonValidator {
    constructor(objectName, json, validFields) {
        this.objectName = objectName;
        this.json = json;
        this.validFields = validFields;
    }

    validate(result) {
        validateCorrectFieldsInRequestJson(this.json, this.validFields, this.objectName, result);
    }
}


function buildValidatorWithString(objectName, string, validFields, result) {
    result.success = true;
    try
    {
        let json = JSON.parse(string);
        return buildValidatorWithJson(objectName, json, validFields);
    }
    catch(err) {
        result.success = false;
        result.errorMessage = "malformed Json object";
    }
}

function buildValidatorWithJson(objectName, json, validFields) {
    return new JsonValidator(objectName, json, validFields);
}

(function () {
    let e = {};
    e.JsonValidator = JsonValidator;
    e.buildValidatorWithString = buildValidatorWithString;
    e.buildValidatorWithJson = buildValidatorWithJson;
    
    module.exports = e;
})();