
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
        image.set_data(
                      pixbuf.get_pixels(),
                      pixbuf.get_has_alpha() ? Cogl.PixelFormat.RGBA_8888 : Cogl.PixelFormat.RGB_888,
                      480,
                      600,
                      pixbuf.get_rowstride()
                      );

        image_item.actor.add_actor(image_actor)
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
