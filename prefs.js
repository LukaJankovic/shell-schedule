const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const ExtensionUtils = imports.misc.extensionUtils;
const Convenience = Me.imports.convenience;

var schools;
var schoolbox;
var classIDInput;

var schema;

function init() {
    global.log("Shell-Schema settings init");

    schools = JSON.parse(String(GLib.file_get_contents(Me.path + '/schools.json')[1]));
    schema = Convenience.getSettings();
}

function school_changed() {
    let activeItem = schoolbox.get_active();

    let schoolID = schools[activeItem]["id"];

    schema.set_string("schoolid", schoolID);
}

function class_changed() {
    schema.set_string("classid", classIDInput.get_text());
}

function buildPrefsWidget() {

    let buildable = new Gtk.Builder();
    buildable.add_objects_from_file(Me.dir.get_path() + '/settings.ui', ['prefs_widget']);

    let rootbox = buildable.get_object('prefs_widget');

    //School list
    schoolbox = buildable.get_object('school-list');

    var currIndex = 0;
    for (var i = 0; i < schools.length; i++) {
        schoolbox.append_text(schools[i]["namn"]+" ("+schools[i]["stad"]+")");

        if (schema.get_string("schoolid") == schools[i]["id"])
            currIndex = i;
    }

    schoolbox.set_active(currIndex);

    schoolbox.connect("changed", Lang.bind(this, this.school_changed));

    //ClassID
    classIDInput = buildable.get_object("class-entry");
    classIDInput.connect("activate", Lang.bind(this, this.class_changed));
    classIDInput.set_text(schema.get_string("classid"));

    return rootbox;
}
