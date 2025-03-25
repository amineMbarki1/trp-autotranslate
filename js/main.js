class Observable {
  subscribers = [];
  constructor() {}

  addSubscriber(subscriber) {
    this.subscribers.push(subscriber);
  }

  notify(args) {
    this.subscribers.forEach((subscriber) => subscriber(args));
  }
}

function fetchDefaultLanguage() {
  return new Promise((resolve, reject) => {
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: "get_default_language",
      },
      type: "POST",
      success(response) {
        resolve(response);
      },
    });
  });
}

function fetchLanguages() {
  return new Promise((resolve, reject) => {
    jQuery.ajax({
      url: ajaxurl,
      type: "POST",
      data: {
        action: "get_languages",
      },
      success(response) {
        resolve(response);
      },
    });
  });
}

function updateDictionary(data) {
  return new Promise((resolve, reject) => {
    jQuery.ajax({
      url: ajaxurl,
      type: "POST",
      data: {
        action: "update_dictionary",
        data,
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

  const res = [];

  translatableElements.forEach((el) => {
    if (!res.find(({ id }) => id === el.id)) res.push(el);
  });

  return res;
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

let translatableStrings = collectTranslatableStrings();

const worker = new Worker("wp-content/plugins/trp-autotranslate/js/worker.js", {
  type: "module",
});

let currentIndex = 0;
const res = [];
let srcLanguage;
let targetLanguage;

const translationObserver = new Observable();
translationObserver.addSubscriber(updateModeProgress);
translationObserver.addSubscriber(updateTranslationStrings);

worker.addEventListener("message", async (e) => {
  translationObserver.notify(e.data);

  if (e.data.status === "complete") {
    if (currentIndex === translatableStrings.length - 1) {
      attachMergeTranslationsBtn();
      return;
    }

    currentIndex++;
    worker.postMessage({
      id: translatableStrings[currentIndex].id,
      text: translatableStrings[currentIndex].text,
      src_lang: mapLanguageCode(srcLanguage),
      tgt_lang: mapLanguageCode(targetLanguage),
    });
  }
});

const OPEN_DIALOG_BTN_ID = "open-dialog-id";
const DIALOG_ID = "trp-all-dialog";
const TRANSLATE_ALL_TABLE_ID = "trp-all-table";
const TRP_NEXT_PREVIOUS_ID = "trp-next-previous";
const TRP_ALL_ACTION_WRAPPER_ID = "trp-all-action-wrapper";
const TARGET_LANGUAGE_SELECTOR_ID = "target-language-selector";
const START_TRP_ALL_BTN_ID = "start-trp-all-btn";
const MODEL_PROGRESS_WRAPPER_ID = "model-progress";
const LOADING_TEXT_ID = "loading-model-text";
const MERGE_TRANSLATIONS_BTN_ID = "merge-translations";

function attachMergeTranslationsBtn() {
  if (document.getElementById(MERGE_TRANSLATIONS_BTN_ID)) return;
  const mergeBtn = document.createElement("button");
  mergeBtn.id = MERGE_TRANSLATIONS_BTN_ID;
  mergeBtn.addEventListener("click", handleMergeTranslations);
  mergeBtn.textContent = "Merge translations";
  parent.document
    .getElementById(TRP_ALL_ACTION_WRAPPER_ID)
    .insertAdjacentElement("afterend", mergeBtn);
}

function handleMergeTranslations() {
  const translations = Array.from(
    parent.document.querySelectorAll('[id^="translation"')
  )
    .map((el) => ({
      id: el.id.split("-")[1],
      translation: el.querySelector("textarea")?.value,
    }))
    .filter(({ translation }) => !!translation);

  updateDictionary({
    translations,
    dictionary: { src: srcLanguage, target: targetLanguage },
  }).then((res) => console.log("backend res", res));

  console.log(translations);
}

function attachAutoTranslateDialog() {
  const btn = document.createElement("button");
  btn.id = OPEN_DIALOG_BTN_ID;
  btn.textContent = "Translate all";
  btn.addEventListener("click", handleOpenDialog);
  const dialog = document.createElement("dialog");
  dialog.id = DIALOG_ID;
  const attachAfterEl = parent.document.getElementById(TRP_NEXT_PREVIOUS_ID);
  attachAfterEl.insertAdjacentElement("afterend", btn);
  attachAfterEl.insertAdjacentElement("afterend", dialog);
}

function attachAutoTranslateTable() {
  const template = `
    <table id="${TRANSLATE_ALL_TABLE_ID}">
        <thead>
          <tr>
            <th>ID</th>
            <th>Original string</th>
            <th>Translated string</th>
          </tr>
        </thead>
        <tbody>
           
        </tbody>
    </table>
  `;

  parent.document
    .getElementById(DIALOG_ID)
    .insertAdjacentHTML("afterbegin", template);
}

async function attachTranslateAllAction() {
  try {
    const wrapper = document.createElement("div");
    wrapper.id = TRP_ALL_ACTION_WRAPPER_ID;
    wrapper.innerHTML = "Loading...";
    parent.document
      .getElementById(DIALOG_ID)
      .insertAdjacentElement("afterbegin", wrapper);
    const [languages, defaultLanguage] = await Promise.all([
      fetchLanguages(),
      fetchDefaultLanguage(),
    ]);
    targetLanguage = Object.keys(languages)[0];
    srcLanguage = Object.keys(defaultLanguage)[0];

    wrapper.innerHTML = `
    <label for="${TARGET_LANGUAGE_SELECTOR_ID}">From <strong> ${
      defaultLanguage[srcLanguage]
    } </strong> to: </label>
    <select id="${TARGET_LANGUAGE_SELECTOR_ID}">
      ${Object.entries(languages)
        .map(([key, value]) => `<option value="${key}">${value}</option>`)
        .join("")} 
    </select>
    <button id="${START_TRP_ALL_BTN_ID}">Start translation</button>
    <div id="${MODEL_PROGRESS_WRAPPER_ID}"></div>
    `;
    parent.document
      .getElementById(START_TRP_ALL_BTN_ID)
      .removeEventListener("click", handleStartTranslateAll);

    parent.document
      .getElementById(START_TRP_ALL_BTN_ID)
      .addEventListener("click", handleStartTranslateAll);
  } catch (error) {
    console.error(error);
  }
}

function handleStartTranslateAll() {
  worker.postMessage({
    id: translatableStrings[currentIndex].id,
    text: translatableStrings[currentIndex].text,
    src_lang: mapLanguageCode(srcLanguage),
    tgt_lang: mapLanguageCode(targetLanguage),
  });
}

async function handleOpenDialog() {
  translatableStrings = collectTranslatableStrings();
  console.log(translatableStrings);
  //Insert translatable strings as table rows
  const translatableStringsRow = translatableStrings
    .map(
      ({ id, text }) => `<tr id="translation-${id}">
                                    <td>${id}</td>
                                    <td>
                                    ${text}
                                    <progress></progress>
                                    </td>
                                    <td></td>
                                </tr>`
    )
    .join("");

  parent.document
    .getElementById(TRANSLATE_ALL_TABLE_ID)
    .querySelector("tbody").innerHTML = translatableStringsRow;

  parent.document.getElementById(DIALOG_ID).showModal();
}

let isInitialLoad = true;

parent.document
  .getElementById("trp-preview-iframe")
  .addEventListener("load", () => {
    if (!isInitialLoad) return;
    isInitialLoad = false;
    attachAutoTranslateDialog();
    attachAutoTranslateTable();
    attachTranslateAllAction();
    attachStyles();
  });

function updateModeProgress(progress) {
  if (progress.status === "ready")
    parent.document.getElementById(MODEL_PROGRESS_WRAPPER_ID).innerHTML =
      "Model Ready";

  if (progress.status !== "progress" && progress.status !== "done") return;

  if (!parent.document.getElementById(LOADING_TEXT_ID))
    parent.document
      .getElementById(MODEL_PROGRESS_WRAPPER_ID)
      .insertAdjacentHTML(
        "afterbegin",
        `<p id="${LOADING_TEXT_ID}">Loading AI Model This will take a while but happens only once</p>`
      );

  const element = parent.document.querySelector(
    `[data-file="${progress.file}"]`
  );

  if (element)
    element.innerHTML = `${progress.file}: ${
      progress.status === "progress"
        ? Math.trunc(progress.progress) + "%"
        : progress.status
    }`;
  else
    parent.document
      .getElementById(MODEL_PROGRESS_WRAPPER_ID)
      .insertAdjacentHTML(
        "afterbegin",
        `<div data-file="${progress.file}">${
          progress.status === "progress"
            ? Math.trunc(progress.progress)
            : progress.status
        }</div>`
      );
}

function updateTranslationStrings(data) {
  if (data.status === "update") {
    console.log("Translating sentence id: ", data.id);
    parent.document
      .getElementById(`translation-${data.id}`)
      .querySelector("progress").style.display = "block";
  }
  if (data.status === "complete") {
    console.log(data.output);

    parent.document
      .getElementById(`translation-${data.id}`)
      .querySelector("progress").style.display = "none";

    parent.document.getElementById(
      `translation-${data.id}`
    ).children[2].innerHTML = `<textarea>${data.output}</textarea>`;
  }
}

function attachStyles() {
  const style = document.createElement("style");
  style.textContent = `
    table textarea {
      width: 100%;
      height:70px;
    }
    table progress {
      height: 10px;
      width: 50px;
      display: none;
    }
     table th {
        text-align: left;
     }

     table tr {
      border : 1px solid;}

     table td {
        padding: 10px 0;
        border-bottom: 1px solid rgba(0,0,0,  0.3);
     }
  
    #${DIALOG_ID} {
        width:80vw;
        height: 60vh;
    }
  
  
  `;
  parent.document.querySelector("head").appendChild(style);
}
