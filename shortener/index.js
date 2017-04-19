urlList = new Mongo.Collection('urls');

if (Meteor.isClient) {
    Template.urlShorten.events({
        'submit form': function() {
            event.preventDefault(); // Stop page from refreshing
            Meteor.call('shortenURL', event.target.url.value, function(err, shortened) {
                Session.set("urlOutput", shortened);
            });
        }
    });

    Template.urlShorten.helpers({
        urlOutput: function() {
            var shortened = Session.get('urlOutput');
            if (shortened == undefined) {
                return "";
            }
            return document.domain + "/" + shortened;
        }
    });
}

Meteor.methods({
    'shortenURL': function(url) {
        if (Meteor.isServer) {
            var alphabet = "abcdefghijxlmnopqrstuvwxyz";
            var shortened = "";
            do {
                for (var i = 0; i < 6; i++) {
                    var position = Math.random() * alphabet.length;
                    position = Math.floor(position);
                    shortened += alphabet[position];
                }
            } while (urlList.find({_id: shortened}).fetch().length != 0);
            urlList.insert({
                _id: shortened,
                longURL: url,
            });
            return shortened;
        }
        /*if (Meteor.isClient) {
            Session.set('urlOutput', shortened);
        }*/
    },
    'getURL': function(shortened) {
        if (Meteor.isServer) {
            var url = urlList.find({
                _id: shortened
            }).fetch()[0].longURL;
            return url;
        }
    }
});
FlowRouter.route('/', {
    action() {
        //Default
    }
});

FlowRouter.route('/:_shortened', {
    action() {
        var shortened = FlowRouter.getParam("_shortened");
        Meteor.call("getURL", shortened, function(err, url) {
            window.location = url;
        })
    }
})