urlList = new Mongo.Collection('urls');

if (Meteor.isClient) {
    Meteor.subscribe('userData');

    Template.urlShorten.events({
        'submit form': function() {
            event.preventDefault(); // Stop page from refreshing
            Meteor.call('shortenURL', event.target.url.value, function(err, shortened) {
                Session.set("urlOutput", shortened);
                document.getElementById("txtOutput").style.display = "unset";
            });
        },
        'click #txtOutput': function() {
            document.getElementById("txtOutput").select();
            var copied = document.execCommand('copy');
            if (copied) {
                document.getElementById("txtCopied").innerHTML = "Text copied";
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
        }
    })
}

if (Meteor.isServer) {
    Meteor.publish('userData', function(){
        var user = this.userId;
        return urlList.find({user: user});
    });
}

Meteor.methods({
    'shortenURL': function(url) {
        if (Meteor.isServer) {
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
        }
    },
    'getURL': function(shortened) {
        if (Meteor.isServer) {
            var url = urlList.findOne({
                _id: shortened
            }).longURL;
            return url;
        }
    },
    'getUserURLs': function() {
        if (Meteor.isServer) {
            var user = Meteor.userId();
            console.log("User:" + user);
            return urlList.find({user: user});
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