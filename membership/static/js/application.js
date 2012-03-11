/**
 * A caching availability checker for alias availability
 */
var aliasAvailability = {};
function aliasAvailable (alias, callbackFunction) {
    if (aliasAvailability[alias] === undefined) {
	$.ajax("../../api/available/aliases/" + alias + "/", {
	    statusCode: {
		200: function() {
		    aliasAvailability[alias] = true;
		    callbackFunction(true);
		},
		404: function() {
		    aliasAvailability[alias] = false;
		    callbackFunction(false);
		},
		503: function() {
		    callbackFunction(undefined);
		}
	    }
	});
    }
    else {
	callbackFunction(aliasAvailability[alias]);
    }
}

/**
 * A caching validity checker for aliases.
 */
var aliasValidity = {};
function aliasValid (alias, callbackFunction) {
    if (aliasValidity[alias] === undefined) {
	$.ajax("../../api/valid/aliases/" + alias + "/", {
	    statusCode: {
		200: function() {
		    aliasValidity[alias] = true;
		    callbackFunction(true);
		},
		404: function() {
		    aliasValidity[alias] = false;
		    callbackFunction(false);
		},
		503: function() {
		    callbackFunction(undefined);
		}
	    }
	});
    }
    else {
	callbackFunction(aliasValidity[alias]);
    }
}

/**
 * A caching AJAX helper for fetching member details.
 */
var memberDetailStore = {};
function memberDetails (id, callbackFunction) {
    if (memberDetailStore[id] === undefined) {
	jQuery.get("../../api/memberships/" + id + "/",
		   function (data) {
		       memberDetailStore[id] = data;
		       callbackFunction(data);
		   });
    }
    else {
	callbackFunction(memberDetailStore[id]);
    }
}

function addToCart (cartName, id, successCallback) {
    jQuery.post("../../api/carts/" + cartName + "/",
		{"id": id}, successCallback);
}

function getCartContents (cartName, successCallback) {
    jQuery.get("../../api/carts/" + cartName + "/",
	       successCallback);
}



function cleanAccents (s) {
    var r=s.toLowerCase();
    r = r.replace(new RegExp("\\s", 'g'),"");
    r = r.replace(new RegExp("[àáâãäå]", 'g'),"a");
    r = r.replace(new RegExp("æ", 'g'),"ae");
    r = r.replace(new RegExp("ç", 'g'),"c");
    r = r.replace(new RegExp("[èéêë]", 'g'),"e");
    r = r.replace(new RegExp("[ìíîï]", 'g'),"i");
    r = r.replace(new RegExp("ñ", 'g'),"n");
    r = r.replace(new RegExp("[òóôõö]", 'g'),"o");
    r = r.replace(new RegExp("œ", 'g'),"oe");
    r = r.replace(new RegExp("[ùúûü]", 'g'),"u");
    r = r.replace(new RegExp("[ýÿ]", 'g'),"y");
    r = r.replace(new RegExp("\\W", 'g'),"");
    return r;
};

function generateEmailForwards (firstName, givenNames, lastName) {
    var permutations = [];

    var firstName = cleanAccents(firstName);
    var givenNames = givenNames.split(" ");

    if (firstName == "" || lastName == "") {
        return permutations;
    }

    for (var i=0; i<givenNames.length; i++) {
	givenNames[i] = cleanAccents(givenNames[i]);
    }
    var lastName = cleanAccents(lastName);

    permutations.push(firstName + "." + lastName);
    permutations.push(lastName + "." + firstName);

    var nonFirstNames = [];
    var initials = [];
    $.each(givenNames, function (idx, val) {
	if (val !== undefined && val != firstName) {
	    nonFirstNames.push(val);
	    initials.push(val[0]);
	}
    });

    if (initials.length > 0) {
	permutations.push(firstName + "." + initials[0] + "." + lastName);
	permutations.push(initials[0] + "." + firstName + "." + lastName);
    }
    return permutations;
}

