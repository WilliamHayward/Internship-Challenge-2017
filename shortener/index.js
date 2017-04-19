urlList = new Mongo.Collection('urls');

if (Meteor.isClient) {
    Template.urlShorten.events({
        'submit form': function() {
            event.preventDefault(); // Stop page from refreshing
            Meteor.call('shortenURL', event.target.url.value);
        }
    });

    Template.urlShorten.helpers({
        urlOutput: function() {
            return Session.get('urlOutput');
        },
    });
}

Meteor.methods({
    'shortenURL': function(url) {
        var alphabet = "abcdefghijxlmnopqrstuvwxyz";
        var shortened = "";
        while (shortened == "" || urlList.find({_id: shortened}).fetch().length != 0) {
            for (var i = 0; i < 6; i++) {
                var position = Math.random() * alphabet.length;
                position = Math.floor(position);
                shortened += alphabet[position];
            }
        }
        urlList.insert({
            _id: shortened,
            longURL: url
        });
        if (Meteor.isClient) {
            Session.set('urlOutput', shortened);
        }
    }
})