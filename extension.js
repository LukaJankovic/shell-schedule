
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const GdkPixbuf = imports.gi.GdkPixbuf;
const Clutter = imports.gi.Clutter;
const Cogl = imports.gi.Cogl;
const Soup = imports.gi.Soup;

function getWeekNumber() {
    var d = new Date();
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    return weekNo;
}

const ScheduleIndicator = new Lang.Class({
    Name: "ScheduleIndicator",
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "ScheduleIndicator");

        let gicon = Gio.icon_new_for_string(Me.path + "/icons/clock.svg");

        this.icon = new St.Icon({ gicon: gicon, style_class: 'system-status-icon' });
        this.actor.add_child(this.icon);

        //this._loadschedule();
    },

    //Overwriting
    _onEvent: function(actor, event) {

        if ((event.type() == Clutter.EventType.TOUCH_BEGIN ||
             event.type() == Clutter.EventType.BUTTON_PRESS) &&
             !this.menu.isOpen) {

            this._loadschedule();
        }

        return(this.parent(actor, event));
    },

    _loadschedule: function() {

        if (!this.image_item) {
            this.image_item = new PopupMenu.PopupBaseMenuItem({can_focus: false, reactive: false});
            this.menu.addMenuItem(this.image_item);
        }

        if (!this.image) {
            this.image = new Clutter.Image();
        }

        if (!this.image_actor) {
            this.image_actor = new Clutter.Actor({height: 600, width: 480});
            this.image_item.actor.add_actor(this.image_actor);
        }

        //Delete old schedule file
        try {
            let f = Gio.File.new_for_path(Me.path + '/schedule.png');
            f.delete(Gio.Cancellable.new());
        } catch(e) {
            global.log("no schedule file to delete");
        }

        let session = new Soup.SessionAsync();
        Soup.Session.prototype.add_feature.call(session, new Soup.ProxyResolverDefault());

        const URL = "http://www.novasoftware.se/ImgGen/schedulegenerator.aspx?format=png&schoolid=89920/sv-se&id=na15c&period=&week="+getWeekNumber()+"&colors=32&day=0&width=480&height=600";

        let request = Soup.Message.new_from_uri('GET', new Soup.URI(URL));
        session.queue_message(request, ((session, message) => {

            global.log(message.status_code);

            if (message.status_code == 200) {
                let file = Gio.File.new_for_path(Me.path + '/schedule.png');
                let outstream = file.replace(null, false, Gio.FileCreateFlags.NONE,null);
                outstream.write_bytes(message.response_body.flatten().get_as_bytes(),null);

                let pixbuf = GdkPixbuf.Pixbuf.new_from_file(Me.path + '/schedule.png');

                this.image.set_data(
                        pixbuf.get_pixels(),
                        pixbuf.get_has_alpha() ? Cogl.PixelFormat.RGBA_8888 : Cogl.PixelFormat.RGB_888,
                        480,
                        600,
                        pixbuf.get_rowstride()
                        );

                this.image_actor.set_content(this.image);
            }
        }));
    }
});

let schedule_indicator;

function init() {
    schedule_indicator = new ScheduleIndicator();
}

function enable() {
    Main.panel.addToStatusArea("ScheduleIndicator", schedule_indicator);
}

function disable() {
    schedule_indicator.stop();
    schedule_indicator.destroy();
}
