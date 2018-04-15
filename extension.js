
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const GdkPixbuf = imports.gi.GdkPixbuf;
const Gdk = imports.gi.Gdk;
const Clutter = imports.gi.Clutter;
const Cogl = imports.gi.Cogl;
const Soup = imports.gi.Soup;
const ExtensionUtils = imports.misc.extensionUtils;
const Convenience = Me.imports.convenience;

let schedule_indicator;
let parent_container;
let image_container;
let current_hidpi;

function getWeekNumber() {
    var d = new Date();
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    return weekNo;
}

function updateHiDPiIfNeeded() {
	if (current_hidpi != St.ThemeContext.get_for_stage(global.stage).scale_factor) {
		current_hidpi = St.ThemeContext.get_for_stage(global.stage).scale_factor;

		var dateMenu = Main.panel.statusArea.dateMenu;
		parent_container = dateMenu.menu.box.get_children()[0].get_children()[0];

		if (image_container != null) {
			image_container.destroy();
		}

		image_container = new Clutter.Actor({height: 600 * current_hidpi, width: 480 * current_hidpi});

		parent_container.insert_child_at_index(image_container, 2);
	}
}

function loadSchedule() {
    var _schema = Convenience.getSettings();

    updateHiDPiIfNeeded();

    let session = new Soup.SessionAsync();
    Soup.Session.prototype.add_feature.call(session, new Soup.ProxyResolverDefault());

    let classID = _schema.get_string("classid");
    let schoolID = _schema.get_string("schoolid");

    var image = new Clutter.Image();

    const URL = "http://www.novasoftware.se/ImgGen/schedulegenerator.aspx?format=png&schoolid="+schoolID+"/sv-se&id="+classID+"&period=&week="+getWeekNumber()+"&colors=32&day=0&width=480&height=600";

    let request = Soup.Message.new_from_uri('GET', new Soup.URI(URL));
    session.queue_message(request, ((session, message) => {
	
        if (message.status_code == 200) {

	    	let inputStream = Gio.MemoryInputStream.new_from_bytes(message.response_body_data)
	    	let pixbuf = GdkPixbuf.Pixbuf.new_from_stream(inputStream, null);

            image.set_data(
                pixbuf.get_pixels(),
                pixbuf.get_has_alpha() ? Cogl.PixelFormat.RGBA_8888 : Cogl.PixelFormat.RGB_888,
                480,
                600,
                pixbuf.get_rowstride()
            );

            image_container.set_content(image);
        }
    }));
}

function init() {}

function enable() {

	current_hidpi = 0;
    updateHiDPiIfNeeded();

	var dateMenu = Main.panel.statusArea.dateMenu;
    dateMenu.menu.connect('open-state-changed', (menu, isOpen) => {
		loadSchedule();
    });
}

function disable() {
    image_container.destroy();
}
