const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const ExtensionUtils = imports.misc.extensionUtils;
const Convenience = Me.imports.convenience;

var regions;
var cities;
var schools;

var regionbox;
var citiesbox;
var schoolbox;
var classIDInput;

var schema;

function init() {
    global.log("Shell-Schema settings init");

    regions = JSON.parse(String(GLib.file_get_contents(Me.path + '/schools-new.json')[1]));
    schema = Convenience.getSettings();
}

function region_changed() {
    cities = regions[regionbox.get_active()]["cities"];

    citiesbox.remove_all();
    schoolbox.remove_all();

    for (var i = 0; i < cities.length; i++) {
        citiesbox.append_text(cities[i]["city_name"]);
    }
}

function cities_changed() {
    schools = cities[citiesbox.get_active()]["schools"];

    schoolbox.remove_all();

    for (var i = 0; i < schools.length; i++) {
        schoolbox.append_text(schools[i]["name"])
    }
}

function school_changed() {
    let activeRegion = regionbox.get_active();
    let activeCity = citiesbox.get_active();
    let activeItem = schoolbox.get_active();

    let schoolID = schools[activeItem]["id"];

    schema.set_string("schoolid", schoolID);
    schema.set_string("schoolindex", activeRegion, activeCity, activeItem);
}

function class_changed() {
    schema.set_string("classid", classIDInput.get_text());
}

function buildPrefsWidget() {

    let buildable = new Gtk.Builder();
    buildable.add_objects_from_file(Me.dir.get_path() + '/settings.ui', ['prefs_widget']);

    let rootbox = buildable.get_object('prefs_widget');

    //Initialize boxes
    regionbox = buildable.get_object('region-list');
    citiesbox = buildable.get_object('city-list');
    schoolbox = buildable.get_object('school-list');

    for (var i = 0; i < regions.length; i++) {
        regionbox.append_text(regions[i]["region_name"])
    }

    let current_school_index = schema.get_string("schoolindex").split(",");

    if (current_school_index) {
        regionbox.set_active(current_school_index[0]);
        citiesbox.set_active(current_school_index[1]);
        schoolbox.set_active(current_school_index[2]);
    }

    regionbox.connect("changed", Lang.bind(this, this.region_changed));
    citiesbox.connect("changed", Lang.bind(this, this.cities_changed));
    schoolbox.connect("changed", Lang.bind(this, this.school_changed));

    //ClassID
    classIDInput = buildable.get_object("class-entry");
    classIDInput.connect("activate", Lang.bind(this, this.class_changed));
    classIDInput.set_text(schema.get_string("classid"));

    return rootbox;
}
