
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const ScheduleIndicator = new Lang.Class({
    Name: "ScheduleIndicator",
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "ScheduleIndicator");

        let gicon = Gio.icon_new_for_string(Me.path + "/icons/clock.svg");

        this.icon = new St.Icon({ gicon: gicon, style_class: 'system-status-icon' });
        this.actor.add_child(this.icon);
    }
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
