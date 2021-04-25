"use strict";

class Result {
    constructor() {
        this.success = false;
        this.errorMessage = "";
    }
}

(function () {
    let e = {};
    e.Result = Result;
    
    module.exports = e;
})();