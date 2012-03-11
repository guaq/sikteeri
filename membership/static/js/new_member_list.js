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
    var rightTriangle = "▶";
    var downTriangle = "▼";

    var e = $("<div>");
    e.text(rightTriangle);
    e.css("display", "inline");
    e.css("cursor", "pointer");

    e.click(function () {
	console.log("onClick!");
    	onClickCallback();

    	if (membership.isOpen) {
    	    e.text(downTriangle);
    	} else {
    	    e.text(rightTriangle);
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

function enhanceMemberItem (htmlElement) {
    htmlElement.append(makeMembershipInfobox(htmlElement));
}
