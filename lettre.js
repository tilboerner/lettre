$(document).ready(function() {
    $('#messages-content').html('Hallo');
    getContacts();
    getTags();
    show('contacts');
    
    $('#contacts-button').click(function() {
        show('contacts');
    });

    $('#tags-button').click(function() {
        show('tags');
    });
    
    $('#loginform').find('.submit').click(function() {
        auth.login();
        return false;
    });
    
    $('#logout').click(function() {
        auth.logout();
    });
    
    auth.login();
});

var auth = {
  logged_in: false,
  login : function() {
      $('#screen').hide();
      $('#login').hide();
      this.logged_in = true; 
      return false; 
    },
  logout : function() {
      $('#screen').show();
      $('#login').show();
      this.logged_in = false; 
      return true; 
    },
};

var example = {
  contacts: ['Til', 'Tom', 'Max'],
  tags: ['Kuchen', 'Quarks', 'Erdnussbutter'],
  messages: [        
        {from: 'Til', to: 'you', tags: [], subject: 'abc', text: 'defgh'},
        {from: 'Til', to: 'you', tags: [], subject: 'abc', text: 'defgh'},
        {from: 'you', to: 'Tom', tags: [], subject: 'guglhupf', text: 'fitzbrembel'},
        {from: 'Max', to: 'you', tags: [], subject: 'miau', text: 'miu'},
    ],  
};

var api = {
    contacts: function() {
        var c = '';
        for (var i in example.contacts) {
            c += '<li class="contact">'+example.contacts[i]+'</li>'
        }
        return c;
    },
    tags: function() {
        var c = '';
        for (var i in example.tags) {
            c += '<li class="tag">'+example.tags[i]+'</li>'
        }
        return c;
    },
    messages: function(contacts, tags) {
        var found = example.messages.slice(0);
        if (contacts && contacts.length) {
            console.log(contacts);
            for (var i = 0; i < found.length; i ++) {
                var message = found[i];
                var ok = false;
                for (var j in contacts) {
                    if (contacts[j] == message.from || contacts[j] == message.to) {
                        ok = true;
                    }
                }
                if (!ok) {
                    console.log('bad contact, removing ');
                    console.log(found[i]);
                    found.splice(i, 1);
                    i--;
                }
            }
        }
        if (tags && tags.length) {
            for (var i=0; i < found.length; i++) {
                var message = found[i];
                var ok = false;
                for (var j in tags) {
                    if (message.tags.indexOf(tags[j]) > -1) {
                        ok = true;
                        break;
                    }
                }
                if (!ok) {
                    console.log('bad tag, removing ');
                    console.log(found[i]);
                    found.splice(i,1);
                    i--;
                }
            }
        }
        
        console.log(found);
        r = '';
        for (var i in found) {
            var msg = found[i];
            r +=  '<div class="message"><div class="header"><dl><dt>From</dt><dd>'+msg.from+'</dd><dt>To</dt><dd>'+msg.to+'</dd></dl></div><div class="content"><span class="subject">'+msg.subject+'</span>&nbsp;<span class="body">'+ msg.text +'</span></div></div>';
        }
        return r;
    },
}

var getContacts = function() {
    var contacts = api.contacts();
    $('#contacts').children('.contactlist').append(contacts);
     $('#contacts').children('.contactlist').children('.contact').each(function (index, Element) {
         console.log($(this));
         $(this).click(function(){
             console.log($(this).html());
             messages.setContact($(this).html());
        });
     });
    
}

var getTags = function() {
    $('#tags').children('.taglist').append(api.tags());
    $('#tags').children('.taglist').children('.tag').click(function() {
        //new Tag($(this).html(), $('#messages-header').children('.taglist'), true).add();
        messages.addTag($(this).html(), true);
    });
}

var hideAll = function() {
    $('#contacts').hide();
    $('#contacts-button').removeClass('highlight')
    $('#tags').hide();
    $('#tags-button').removeClass('highlight')
}

var show = function(what) {
    hideAll();
    $('#' + what).show();
    $('#' + what + '-button').addClass('highlight')
}

var Tag = function(name, closable) {
    this.name = name;  
    this.closable = closable;
};

Tag.prototype = {
    render : function() {
        var html = '<li class="tag"><span class="name">' + this.name + '</span>';
        if (this.closable) {
            html += '&nbsp;<a class="button-close">[x]</a>';
        }
        html += '</li>';
        return html;
    },
};

var Messages = function() {
    this.tags = [];
    this.contact;
};

Messages.prototype = {
    $element : function() {
        return $('#messages');
    },
    addTag : function(name, closable) {
        if (!this.hasTag(name)) {
            var tag = new Tag(name, closable);
            this.$element().children('.header').children('.taglist').append(tag.render());
            var self = this;
            if (closable) {
                this.$element().find('.taglist').children('.tag').last().children('.button-close').click(function() {
                    self.removeTag(name);
                });
            }
            this.tags.push(name);
            this.reload();
        }
    },
    hasTag : function(name) {
        return this.tags.indexOf(name) >= 0;
    },
    removeTag : function(name) {
        console.log('removing ' +name);
        var index = this.tags.indexOf(name);
        if (index >= 0) {
            this.tags.splice(index, 1);
        }
        this.$element().children('.header').children('.taglist').children('.tag').each(function(index) {
            console.log($(this).html());
            if (name == $(this).children('.name').html()) {
                $(this).remove();
            }
        });
        this.reload();
    },
    setContact: function(name) {
        this.removeTag(this.contact);
        this.contact=name;
        this.$element().find('.contact').html(name);
        this.reload();
    },
    reload: function() {
        this.$element().find('.content').empty();
        this.$element().find('.content').append(api.messages(this.contact ? [this.contact] : [], this.tags));
    },    
};
var messages = new Messages();
