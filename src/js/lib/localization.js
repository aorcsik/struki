define([
    'jquery'
], function($) {

    function Localization(locale) {
        this.locale = locale;
    }

    Localization.prototype.languages = [
        {'locale': "en-US", 'name': "English"},
        {'locale': "hu-HU", 'name': "Hungarian"}
    ];
    Localization.prototype.dictionary = {
        "Language": {'hu-HU': "Nyelv"},
        "English": {'hu-HU': "angol"},
        "Hungarian": {'hu-HU': "magyar"},
        "New": {'hu-HU': "Új"},
        "Settings": {'hu-HU': "Beállítások"},
        "Unsafe running": {'hu-HU': "Védelem nélküli futtatás"},
        "Max iterations": {'hu-HU': "Iterációs lépés korlát"},
        "Step delay": {'hu-HU': "Lépés időköz"},
        "Close": {'hu-HU': "Bezár"},
        "Cancel": {'hu-HU': "Mégse"},
        "Save": {'hu-HU': "Mentés"},
        "Load": {'hu-HU': "Betöltés"},
        "Export": {'hu-HU': "Exportálás"},
        "Help": {'hu-HU': "Súgó"},
        "Run": {'hu-HU': "Futtatás"},
        "Pause": {'hu-HU': "Szünet"},
        "Step back": {'hu-HU': "Léptetés vissza"},
        "Step forward": {'hu-HU': "Léptetés előre"},
        "Reset": {'hu-HU': "Alaphelyzet"},
        "Output": {'hu-HU': "Kimenet"},
        "Load or create a new document": {'hu-HU': "Tölts be vagy hozz létre egy új dokumentumot"},
        "Properties": {'hu-HU': "Tulajdonságok"},
        "name": {'hu-HU': "név"},
        "Parameters": {'hu-HU': "Paraméterek"},
        "Local variables": {'hu-HU': "Lokális változók"},
        "condition": {'hu-HU': "feltétel"},
        "type": {'hu-HU': "típus"},
        "test after": {'hu-HU': "hátul tesztelő"},
        "test before": {'hu-HU': "elöl tesztelő"},
        "range": {'hu-HU': "intervallum bejárás"},
        "code": {'hu-HU': "kód"},
        "Structogram": {'hu-HU': "Struktogram"},
        "Command": {'hu-HU': "Parancs"},
        "Loop": {'hu-HU': "Ciklus"},
        "Conditional": {'hu-HU': "Elágazás"},
        "Branch": {'hu-HU': "Ág"},
    };

    Localization.prototype.gettext = function(phrase, text_only, locale) {
        locale = locale || this.locale;
        localized_phrase = phrase;
        if (this.dictionary[phrase] && this.dictionary[phrase][locale]) {
            localized_phrase = this.dictionary[phrase][locale];
        } else if (locale !== "en-US") {
            console.info("Untranslated [" + locale + "] phrase: \"" + phrase + "\"");
        }
        if (text_only) return localized_phrase;
        else return "<span class='__localization' data-phrase='" + phrase+ "'>" + localized_phrase + "</span>";
    };

    Localization.prototype.setLocale = function (locale) {
        var self = this;
        this.locale = locale;
        $(".__localization").each(function() {
            $(this).replaceWith($(self.gettext($(this).data("phrase"))));
        });
    };

    return new Localization("en-US");
});
