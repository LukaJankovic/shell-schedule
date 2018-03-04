
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

const URL = "http://www.novasoftware.se/ImgGen/schedulegenerator.aspx?format=png&schoolid=89920/sv-se&type=1&id={02388C5C-4692-42AF-9CED-E93ED98A5D3B}&period=&week=9&mode=0&printer=0&colors=32&head=0&clock=0&foot=0&day=0&width=480&height=600&maxwidth=1235&maxheight=1208";

const ScheduleIndicator = new Lang.Class({
    Name: "ScheduleIndicator",
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "ScheduleIndicator");

        let gicon = Gio.icon_new_for_string(Me.path + "/icons/clock.svg");

        this.icon = new St.Icon({ gicon: gicon, style_class: 'system-status-icon' });
        this.actor.add_child(this.icon);

        let image_item = new PopupMenu.PopupBaseMenuItem({can_focus: false, reactive: false});
        this.menu.addMenuItem(image_item);

        let image = new Clutter.Image();
        let pixbuf = GdkPixbuf.Pixbuf.new_from_file("/home/luka/Pictures/schedulegenerator.png");

        let image_actor = new Clutter.Actor({height: 600, width: 480});
        image_actor.set_content(image);
        /*image.set_data(
                      pixbuf.get_pixels(),
                      pixbuf.get_has_alpha() ? Cogl.PixelFormat.RGBA_8888 : Cogl.PixelFormat.RGB_888,
                      480,
                      600,
                      pixbuf.get_rowstride()
                      );

        image_item.actor.add_actor(image_actor);*/

        let session = new Soup.SessionAsync();
        Soup.Session.prototype.add_feature.call(session, new Soup.ProxyResolverDefault());

        let request = Soup.Message.new_from_uri('GET', new Soup.URI("http://i.imgur.com/LaqDoW7.png"));
        session.queue_message(request, ((session, message) => {
          global.log("testnigga");
/*
            let file = Gio.File.new_for_path('imgur.png')
            let outstream = file.replace(null, false, Gio.FileCreateFlags.NONE,null)
            outstream.write_bytes(
              message.response_body.flatten().get_as_bytes(),null)
*/
            //let res = Gio.Resource.new_from_data(message.response_body.flatten().get_as_bytes());

            //log('[EXTENSION_LOG]', dl_pixbuf);

          let dl_pixbuf = GdkPixbuf.Pixbuf.new_from_inline(message.response_body.flatten().get_as_bytes(), true);

          global.log("donenigga");

            image_item.actor.add_actor(image_actor);
        }));
    },
})

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
