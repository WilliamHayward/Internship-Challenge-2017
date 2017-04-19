urlList = new Mongo.Collection('urls');

Meteor.publish('userData', function(){
    var user = this.userId;
    return urlList.find({user: {$ne: null, $eq: user}});
});

Meteor.methods({
    'shortenURL': function(url) {
        var user = Meteor.userId();
        console.log(Meteor.userId());
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
            user: user
        });
        return shortened;
    },
    'getURL': function(shortened) {
        var url = urlList.findOne({
            _id: shortened
        }).longURL;
        return url;
    },
    'getUserURLs': function() {
        var user = Meteor.userId();
        console.log("User:" + user);
        return urlList.find({user: user});
    }
});
