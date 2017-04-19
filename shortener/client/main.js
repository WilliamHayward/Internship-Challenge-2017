urlList = new Mongo.Collection('urls');

if (Meteor.userId) {
    Meteor.subscribe('userData');
}
Template.urlShorten.events({
    'submit form': function() {
        event.preventDefault(); // Stop page from refreshing
        Meteor.call('shortenURL', event.target.url.value, function(err, shortened) {
            Session.set("urlOutput", shortened);
            document.getElementById("txtOutput").style.display = "unset";
            document.getElementById("txtCopied").style.display = "none";
        });
    },
    'click #txtOutput': function() {
        document.getElementById("txtOutput").select();
        var copied = document.execCommand('copy');
        if (copied) {
            document.getElementById("txtCopied").style.display = "unset";
        }
    }
});

Template.urlShorten.helpers({
    urlOutput: function() {
        var shortened = Session.get('urlOutput');
        if (shortened == undefined) {
            return "";
        }
        var domain = document.domain;
        if (domain == "localhost") {
            domain += ":3000";
        }
        return domain + "/" + shortened;
    }
});

Template.pastURLS.helpers({
    'userURL': function() {
        return urlList.find();
    },
    'domain': function() {
        var domain = document.domain;
        if (domain == "localhost") {
            domain += ":3000";
        }
        return domain + "/";
    }
});

FlowRouter.route('/', {
    action() {
        document.body.style.display = "unset"; // Only show if not redirecting
    }
});

FlowRouter.route('/:_shortened', {
    action() {
        var shortened = FlowRouter.getParam("_shortened");
        Meteor.call("getURL", shortened, function(err, url) {
            if (!url.includes("//")) { // If no protocol defined
                url = "http://" + url;
            }
            window.location.href = url;
        })
    }
})