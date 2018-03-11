const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Me = imports.misc.extensionUtils.getCurrentExtension();

var schools;

function init() {
    global.log("Shell-Schema settings init");

    schools = JSON.parse(String(GLib.file_get_contents(Me.path + '/schools.json')[1]));
}

function buildPrefsWidget() {

    let buildable = new Gtk.Builder();
    buildable.add_objects_from_file(Me.dir.get_path() + '/settings.ui', ['prefs_widget']);

    let rootbox = buildable.get_object('prefs_widget');

    //School list
    let schoolbox = buildable.get_object('school-list');

    for (var i = 0; i < schools.length; i++) {
        schoolbox.append_text(schools[i]["namn"]+" ("+schools[i]["stad"]+")");
    }

    return rootbox;
}
