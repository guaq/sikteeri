// Simplistic entity framework
function Entity () {
    this.isEntity = true;

    this.init = function (obj) {
	for (var attr in obj) {
	    this[attr] = obj[attr];
	}
    }
}
// End!

function Contact (attrs) {
    this.init(attrs);
}
Contact.prototype = new Entity();

function Membership (attrs) {
    this.init(attrs);

    var contact_attrs = ['person', 'organization', 'billing_contact', 'tech_contact', 'organization'];
    for (var i in contact_attrs) {
	var attr = contact_attrs[i];

	if (this.hasOwnProperty(attr) && this[attr] !== null) {
	    this[attr] = new Contact(this[attr]);
	}
    }
}
Membership.prototype = new Entity();


var rightTriangle = "▶";
var downTriangle = "▼";

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
    }

    var translated = gettext(translationHelper[key]);
    if (translated === undefined) {
    	translated = key;
    }

    var e = $("<tr>");
    e.append($("<td>").append(translated));
    e.append($("<td>").append(value));
    return e;
}

function renderObject (obj) {
    var elems = [];
    for (var key in obj) {
	var value = obj[key];

	if (!obj.hasOwnProperty(key) || value === null) {
	    continue;
	}

	if (value.isEntity) {
	    elems.push(renderKeyValuePairRow(key, renderObject(value)));
	} else {
	    elems.push(renderKeyValuePairRow(key, value));
	}
    }

    var e = $("<table>");
    for (var i in elems) {
	e.append(elems[i]);
    }

    return e;
}


function makeExpandButton (parent) {
    var e = $("<div>");
    e.text(rightTriangle);
    e.css("display", "inline")
    e.css("cursor", "pointer");
    e.click(function () {
	e.text(downTriangle);
	memberDetails(parent.attr("id"),
		      function (details) {
			  details = new Membership(details);
			  var detailsElement = renderObject(details);
			  parent.append(detailsElement);

			  var a = $("<input type=submit>");
			  a.click(function () {
			      addToCart('preapprove', details.person.id,
					function (data) {
					    console.log(details);
					    
					    getCartContents('preapprove',
							    function (data) {
								console.log(data);
							    });
					})
			  });
			  parent.append(a);

			  e.off('click');
			  e.click(function () {
			      e.text(rightTriangle);
			      detailsElement.remove();
			      e.remove();
			      a.remove();

			      enhanceMemberItem(parent);
			  });
		      });
    });

    return e;
}

function enhanceMemberItem (htmlElement) {
    htmlElement.append(makeExpandButton(htmlElement));
}
