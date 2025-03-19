function fetchLanguages(onSuccess) {
  return new Promise((resolve, reject) => {
    jQuery.ajax({
      url: ajaxurl,
      type: "POST",
      data: {
        action: "get_languages",
      },
      success: function (response) {
        resolve(response);
      },
    });
  });
}

function collectTranslatableStrings() {
  const translatableElements = Array.from(
    document.querySelectorAll("translate-press")
  ).map((el) => ({
    text: el.innerText,
    id: el.dataset["trpTranslateId"],
  }));

  return translatableElements;
}

function mapLanguageCode(languageCode) {
  const languageMap = {
    fr_FR: "fra_Latn", // French (France)
    fr_CA: "fra_Latn", // French (Canada)
    en_US: "eng_Latn", // English (US)
    es_ES: "spa_Latn", // Spanish (Spain)
    de_DE: "deu_Latn", // German (Germany)
    it_IT: "ita_Latn", // Italian (Italy)
    pt_PT: "por_Latn", // Portuguese (Portugal)
    zh_CN: "zho_Hans", // Chinese (Simplified)
    zh_TW: "zho_Hant", // Chinese (Traditional)
    ar_SA: "arb_Arab", // Arabic (Saudi Arabia)
    ru_RU: "rus_Cyrl", // Russian (Russia)
    ja_JP: "jpn_Jpan", // Japanese (Japan)
    ko_KR: "kor_Hang", // Korean (South Korea)
    hi_IN: "hin_Deva", // Hindi (India)
    bn_IN: "ben_Beng", // Bengali (India)
    ta_IN: "tam_Taml", // Tamil (India)
    ml_IN: "mal_Mlym", // Malayalam (India)
    gu_IN: "guj_Gujr", // Gujarati (India)
    pa_IN: "pan_Guru", // Punjabi (India)
    te_IN: "tel_Telu", // Telugu (India)
    mr_IN: "mar_Deva", // Marathi (India)
    kn_IN: "kan_Knda", // Kannada (India)
    as_IN: "asm_Beng", // Assamese (India)
    ne_NP: "nep_Deva", // Nepali (Nepal)
    sv_SE: "swe_Latn", // Swedish (Sweden)
    no_NO: "nob_Latn", // Norwegian (Norway)
    da_DK: "dan_Latn", // Danish (Denmark)
    fi_FI: "fin_Latn", // Finnish (Finland)
    nl_NL: "nld_Latn", // Dutch (Netherlands)
    pl_PL: "pol_Latn", // Polish (Poland)
    cs_CZ: "ces_Latn", // Czech (Czech Republic)
    hu_HU: "hun_Latn", // Hungarian (Hungary)
    ro_RO: "ron_Latn", // Romanian (Romania)
    sr_RS: "srp_Cyrl", // Serbian (Serbia)
    bg_BG: "bul_Cyrl", // Bulgarian (Bulgaria)
    uk_UA: "ukr_Cyrl", // Ukrainian (Ukraine)
    sk_SK: "slk_Latn", // Slovak (Slovakia)
    hr_HR: "hrv_Latn", // Croatian (Croatia)
    sl_SI: "slv_Latn", // Slovenian (Slovenia)
    el_GR: "ell_Grek", // Greek (Greece)
    tr_TR: "tur_Latn", // Turkish (Turkey)
    ar_EG: "arz_Arab", // Egyptian Arabic (Egypt)
    ar_MA: "ary_Arab", // Moroccan Arabic (Morocco)
    ar_IQ: "ars_Arab", // Najdi Arabic (Iraq)
    ar_LY: "aeb_Arab", // Tunisian Arabic (Libya)
    en_EN: "eng_Latn",
  };

  return languageMap[languageCode] || "Unknown Language Code";
}

const translatableStrings = collectTranslatableStrings();
const worker = new Worker("wp-content/plugins/trp-autotranslate/js/worker.js", {
  type: "module",
});

worker.addEventListener("message", (e) => {
  console.log(e.data);
});

worker.postMessage({
  text: "hello sir",
  src_lang: mapLanguageCode("en_US"),
  tgt_lang: mapLanguageCode("fr_FR"),
});
