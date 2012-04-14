// Simplistic entity framework
function Entity () {
    this.isEntity = true;

    this.init = function (obj) {
	for (var attr in obj) {
	    this[attr] = obj[attr];
	}

	if (this.hasOwnProperty("afterInit")) {
	    this.afterInit(obj);
	}
    }

    this.bannedKeys = {"bannedKeys": true, "isEntity": true, "init": true};
}
// End!

// "Models"
function Contact (attrs) {
    this.init(attrs);
}
Contact.prototype = new Entity();

function Membership (attrs) {
    this.init(attrs);

    this.afterInit = function (attrs) {
	var contact_attrs = ['person', 'organization', 'billing_contact', 'tech_contact', 'organization'];
	for (var i in contact_attrs) {
	    var attr = contact_attrs[i];

	    if (this.hasOwnProperty(attr) && this[attr] !== null) {
		this[attr] = new Contact(this[attr]);
	    }
	}
    };

    this.isOpen = false;

    this.open = function () {
	this.isOpen = true;
	if (this.hasOwnProperty("onOpened")) this.onOpened();
    };

    this.close = function () {
	this.isOpen = false;
	if (this.hasOwnProperty("onClosed")) this.onClosed();
    };

    this.bannedKeys = {"isOpen": true, "afterInit": true, "open": true, "close": true,
		       "onOpened": true, "onClosed": true, "bannedKeys": true,
		       "isEntity": true, "init": true};
}
Membership.prototype = new Entity();
// End

// This is for Django so that it'd pick up all strings
function neededTranslations () {
    gettext("Member id");
    gettext("Type");
    gettext("Status");
    gettext("Created");
    gettext("Last changed");
    gettext("Home municipality");
    gettext("Nationality");
    gettext("Visible in the public memberlist");
    gettext("Aliases");
    gettext("Services");
    gettext("Additional information");

    gettext('New');
    gettext('Pre-approved');
    gettext('Approved');
    gettext('Deleted');

    gettext('Person');
    gettext('Supporting');
    gettext('Organization');
    gettext('Honorary');

    gettext("Person contact");
    gettext("Billing contact");
    gettext("Technical contact");
    gettext("Organization");

    gettext("First name");
    gettext("Given names");
    gettext("Last name");
    gettext("Organization name");
    gettext("Street address");
    gettext("Postal code");
    gettext("Post office");
    gettext("Country");
    gettext("Phone number");
    gettext("SMS number");
    gettext("E-mail");
    gettext("Homepage");
}

function renderKeyValuePairRow (key, value) {
    var translationHelper = {
	"id": "Member id",
    	"type": "Type",
    	"status": "Status",
    	"created": "Created",
    	"last_changed": "Last changed",
    	"municipality": "Home municipality",
    	"nationality": "Nationality",
    	"public_memberlist": "Visible in the public memberlist",
    	"aliases": "Aliases",
    	"services": "Services",
    	"extra_info": "Additional information",

	"person": "Person contact",
	"billing_contact": "Billing contact",
	"tech_contact": "Technical contact",
	"organization": "Organization",

	"first_name": "First name",
	"given_names": "Given names",
	"last_name": "Last name",
	"organization_name": "Organization name",
	"street_address": "Street address",
	"postal_code": "Postal code",
	"post_office": "Post office",
	"country": "Country",
	"phone": "Phone number",
	"sms": "SMS number",
	"email": "E-mail",
	"homepage": "Homepage",
    };

    if (value === false) {
	value = gettext("no");
    } else if (value === true) {
	value = gettext("yes");
    } else if (value === undefined) {
	value = "";
    }

    var translated = gettext(translationHelper[key]);
    if (translated === undefined) {
    	translated = key;
    }

    // Translate membership status; this is a special case and the constants
    // shouldn't be, but in some Django-generated place.
    if (key === "status") {
	var value_translation_key = undefined
	if (value === 'N') {
	    value_translation_key = 'New';
	} else if (value === 'P') {
	    value_translation_key = 'Pre-approved';
	} else if (value === 'A') {
	    value_translation_key = 'Approved';
	} else if (value === 'D') {
	    value_translation_key = 'Deleted';
	}
	value = gettext(value_translation_key);
    }

    // Translate membership type; this is another special case and the constants
    // shouldn't be, but in some Django-generated place.
    if (key === "type") {
	var value_translation_key = undefined
	if (value === 'P') {
	    value_translation_key = 'Person';
	} else if (value === 'S') {
	    value_translation_key = 'Supporting';
	} else if (value === 'O') {
	    value_translation_key = 'Organization';
	} else if (value === 'H') {
	    value_translation_key = 'Honorary';
	}
	value = gettext(value_translation_key);
    }

    var e = $("<tr>").addClass("table_row");
    e.append($("<td>").append(translated).addClass("key_column"));
    e.append($("<td>").append(value).addClass("value_column"));
    return e;
}

function renderObject (obj) {
    var elems = [];
    for (var key in obj) {
	var value = obj[key];

	if (!obj.hasOwnProperty(key) || value == null || key in obj.bannedKeys) {
	    continue;
	}

	if (value.isEntity) {
	    elems.push(renderKeyValuePairRow(key, renderObject(value)));
	} else {
	    elems.push(renderKeyValuePairRow(key, value));
	}
    }

    var e = $("<table>").addClass("infobox");
    for (var i in elems) {
	e.append(elems[i]);
    }

    return e;
}


function makeExpandButton (membership, onClickCallback) {
    // var rightTriangle = "▶";
    // var downTriangle = "▼";
    var showDetailsText = gettext("show details");
    var hideDetailsText = gettext("hide details");

    var e = $('<input type="submit">');
    e.addClass('memberlist_action_button');
    e.addClass('cart_function');
    e.attr('value', showDetailsText);
    // e.css("cursor", "pointer");

    e.click(function () {
    	onClickCallback();

    	if (membership.isOpen) {
    	    e.attr('value', hideDetailsText);
    	} else {
    	    e.attr('value', showDetailsText);
    	}
    });

    return e;
}


function makeMembershipInfobox (htmlElement) {
    var initialObject = {
	"id": htmlElement.attr("id")
    };
    
    var m = new Membership(initialObject);

    var e = $("<div>");
    e.css("display", "inline");
    e.css("clear", "none");
    var t, a;

    var button = makeExpandButton(m, function () {
	if (m.isOpen) m.close();
	else m.open();
    });

    m.onClosed = function () {
	if (t) t.remove();
	if (a) a.remove();
    };

    m.onOpened = function () {
	memberDetails(m.id,
		      function (obj) {
			  m.init(obj);
			  m.afterInit(obj);
			  t = renderObject(m);
			  e.append(t);
		      });
    };

    e.append(button);

    return e;
}

var toastTimeout;
function toast(text) {
    clearTimeout(toastTimeout);
    document.getElementById("toast").innerHTML = text;
    document.getElementById("toast").style.opacity = 1;
    toastTimeout = setTimeout(function () {
	document.getElementById("toast").style.opacity=0;
    }, 1500);
}

function makeMembershipPreapproveButton(htmlElement) {
    var e = $('<input type="submit">');
    e.addClass('memberlist_action_button');
    e.addClass('cart_function');
    e.attr('value', gettext("add to pre-approve cart"));

    var id = htmlElement[0].id;

    $(e).click(function () {
	var success = function () {
	    toast(gettext("Added to preapprove cart."));
	}

    	var r = jQuery.post("../../api/carts/preapprove/",
			    {"id": id},
			    success);
	r.error(function(param) {
	    toast(gettext("Error occured (") + param + gettext("), not added to cart."));
	});
    });

    return e;
}

function makeMembershipApproveButton(htmlElement) {
    var e = $('<input type="submit">');
    e.addClass('memberlist_action_button');
    e.addClass('cart_function');
    e.attr('value', gettext("add to approve cart"));

    var id = htmlElement[0].id;

    $(e).click(function () {
	var success = function () {
	    toast(gettext("Added to approve cart."));
	}

    	var r = jQuery.post("../../api/carts/approve/",
			    {"id": id},
			    success);
	r.error(function(param) {
	    toast(gettext("Error occured (") + param + gettext("), not added to cart."));
	});
    });

    return e;
}

function enhanceMemberItem (htmlElement) {
    if (htmlElement.hasClass("preapprovable")) {
        htmlElement.append(makeMembershipPreapproveButton(htmlElement));
    } else if (htmlElement.hasClass("approvable")) {
        htmlElement.append(makeMembershipApproveButton(htmlElement));
    }
    htmlElement.append(makeMembershipInfobox(htmlElement));
}
