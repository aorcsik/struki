define([
    'jquery'
], function($) {

    function Localization(locale) {
        this.locale = locale;
    }

    /** Available languages */
    Localization.prototype.languages = [
        {'locale': "en-US", 'name': "English"},
        {'locale': "hu-HU", 'name': "Hungarian"}
    ];

    /** The dictionary */
    Localization.prototype.dictionary = [
        {'en-US': "Language", 'hu-HU': "Nyelv"},
        {'en-US': "English", 'hu-HU': "angol"},
        {'en-US': "Hungarian", 'hu-HU': "magyar"},
        {'en-US': "New", 'hu-HU': "Új"},
        {'en-US': "Settings", 'hu-HU': "Beállítások"},
        {'en-US': "Unsafe running", 'hu-HU': "Védelem nélküli futtatás"},
        {'en-US': "Max iterations", 'hu-HU': "Iterációs lépés korlát"},
        {'en-US': "Step delay", 'hu-HU': "Lépés időköz"},
        {'en-US': "Close", 'hu-HU': "Bezár"},
        {'en-US': "Cancel", 'hu-HU': "Mégse"},
        {'en-US': "Save", 'hu-HU': "Mentés"},
        {'en-US': "Load", 'hu-HU': "Betöltés"},
        {'en-US': "Load document", 'hu-HU': "Documentum betöltése"},
        {'en-US': "Examples", 'hu-HU': "Példák"},
        {'en-US': "Export", 'hu-HU': "Exportálás"},
        {'en-US': "Help", 'hu-HU': "Súgó"},
        {'en-US': "Run", 'hu-HU': "Futtatás"},
        {'en-US': "Pause", 'hu-HU': "Szünet"},
        {'en-US': "Step back", 'hu-HU': "Léptetés vissza"},
        {'en-US': "Step forward", 'hu-HU': "Léptetés előre"},
        {'en-US': "Reset", 'hu-HU': "Alaphelyzet"},
        {'en-US': "Output", 'hu-HU': "Kimenet"},
        {'en-US': "Load or create a new document", 'hu-HU': "Tölts be vagy hozz létre egy új dokumentumot"},
        {'en-US': "Properties", 'hu-HU': "Tulajdonságok"},
        {'en-US': "name", 'hu-HU': "név"},
        {'en-US': "Parameters", 'hu-HU': "Paraméterek"},
        {'en-US': "Local variables", 'hu-HU': "Lokális változók"},
        {'en-US': "condition", 'hu-HU': "feltétel"},
        {'en-US': "type", 'hu-HU': "típus"},
        {'en-US': "test after", 'hu-HU': "hátul tesztelő"},
        {'en-US': "test before", 'hu-HU': "elöl tesztelő"},
        {'en-US': "range", 'hu-HU': "intervallum bejárás"},
        {'en-US': "code", 'hu-HU': "kód"},
        {'en-US': "Structogram", 'hu-HU': "Struktogram"},
        {'en-US': "Command", 'hu-HU': "Parancs"},
        {'en-US': "Loop", 'hu-HU': "Ciklus"},
        {'en-US': "Conditional", 'hu-HU': "Elágazás"},
        {'en-US': "Branch", 'hu-HU': "Ág"},

        {'en-US': "Are you sure, you want to delete this loop?", 'hu-HU': "Biztos, hogy törölni akarod ezt a ciklust?"},
        {'en-US': "Are you sure, you want to delete this branch?", 'hu-HU': "Biztos, hogy törölni akarod ezt az ágat?"},
        {'en-US': "Are you sure, you want to delete this branch and the conditional?", 'hu-HU': "Biztos törölni akarod ezt az ágat és az elágazást?"},
        {'en-US': "Are you sure, you want to delete this command?", 'hu-HU': "Biztos, hogy törölni akarod ezt a parancsot?"},
        {'en-US': "Are you sure, you want to delete this struktogram?", 'hu-HU': "Biztos, hogy törölni akarod ezt a struktogramot?"},
        {'en-US': "Are you sure, you want to close this document?", 'hu-HU': "Biztos, hogy be akarod zárni ezt a dokumentumot?"},

        {'en-US': "Invalid struktogram name!", 'hu-HU': "Szabálytalan struktogram név!"},
        {'en-US': "Invalid variable name!", 'hu-HU': "Szabálytalan változó név!"},

        {'en-US': "Application loaded", 'hu-HU': "Az alkalmazás betöltése kész"},
        {'en-US': "Application settings were saved", 'hu-HU': "Az alkalmazás beállítások mentése kész"},
        {'en-US': "Application settings were restored", 'hu-HU': "Az alkalmazás beállításai visszatöltése kész"},
        {'en-US': "Document <%= name %> autosave was removed", 'hu-HU': "A <%= name %> dokumentum automatikus mentésének tölrése kész"},
        {'en-US': "Document <%= name %> was autosaved", 'hu-HU': "A <%= name %> dokumentum automatikus mentése kész"},
        {'en-US': "Document <%= name %> autosave was loaded", 'hu-HU': "A <%= name %> dokumentum automatikus mentésének betöltése kész"},
        {'en-US': "Application settings save is not possible (<%= error %>)", 'hu-HU': "Az alkalmazás beállításainak mentése nem lehetséges (<%= error %>)"},
        {'en-US': "Application settings restore failed (<%= error %>)", 'hu-HU': "Az alkalmazás beállításainak betöltése nem sikerült (<%= error %>)"},
        {'en-US': "Document autosave is not possible (<%= error %>)", 'hu-HU': "A dokumentum automatikus mentésének betöltése nem sikerült (<%= error %>)"},
        {'en-US': "Document autosave load failed (<%= error %>)", 'hu-HU': "A dokumentum automatikus mentése mentése nem lehetséges (<%= error %>)"},

    ];

    /** Returns the localoized version of a string, if it is defined. */
    Localization.prototype.gettext = function(phrase, text_only, locale) {
        locale = locale || this.locale;
        var phrase_id = -1, localized_phrase = phrase;
        if (this.dictionary[phrase] && this.dictionary[phrase][locale]) {
            localized_phrase = this.dictionary[phrase][locale];
            phrase_id = phrase;
        } else {
            for (var i = 0; i < this.dictionary.length; i++) {
                if (this.dictionary[i]['en-US'] == phrase && this.dictionary[i][locale]) {
                    localized_phrase = this.dictionary[i][locale];
                    phrase_id = i;
                    break;
                }
            }
        }

        if (localized_phrase == phrase && locale !== 'en-US') {
           console.info("Untranslated [" + locale + "] phrase: \"" + phrase + "\"");
        }

        if (text_only) return localized_phrase;
        else return "<span class='__localization' data-phrase='" + phrase_id + "'>" + localized_phrase + "</span>";
    };

    /** Sets the localaization */
    Localization.prototype.setLocale = function (locale) {
        var self = this;
        this.locale = locale;
        $(".__localization").each(function() {
            var phrase_id = $(this).data("phrase"),
                phrase = phrase_id > -1 ? phrase_id : $(this).text();
            $(this).replaceWith($(self.gettext(phrase)));
        });
    };

    return new Localization("en-US");
});
