import {
  pipeline,
  env,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers";

class Pipeline {
  static instance;

  static async getInstance(pgCallback = null) {
    if (this.instance == undefined) {
      this.instance = await pipeline(
        "translation",
        "Xenova/nllb-200-distilled-600M",
        {
          progress_callback: (progress) => {
            if (pgCallback) pgCallback(progress);
          },
        }
      );

      return this.instance;
    }

    return this.instance;
  }
}

const trpAllBtn = document.createElement("button");
trpAllBtn.innerText = "Translate All";
trpAllBtn.classList = "translate-all-btn";

const trpAllModel = document.querySelector(".translate-all-dialog");

trpAllBtn.addEventListener("click", function () {
  trpAllModel.showModal();
  const strings = collectTranslatableStrings();

  console.log(strings);

  const trpAllTable = `
    <table>
        <thead>
            <tr>
              <th>ID</th>
              <th>Original string</th>
              <th>Translatable text</th>
            </tr>
        </thead>
        <tbody>
            ${strings.map(
              ({ id, text }) => `
              <tr>
                <td>${id}</td>
                <td>${text}</td>
              </tr>
            `
            )}
        </tbody>
    </table>
  `;

  trpAllModel.innerHTML = trpAllTable;

  console.log(trpAllTable);
});

parent.document
  .getElementById("trp-upsell-section-container")
  .insertAdjacentElement("afterbegin", trpAllBtn);
document
  .querySelector(".translate-all-dialog__close")
  .addEventListener("click", function () {
    trpAllModel.close();
  });

function collectTranslatableStrings() {
  const translatableElements = Array.from(
    document.querySelectorAll("translate-press")
  ).map((el) => ({
    text: el.innerText,
    id: el.dataset["trpTranslateId"],
  }));

  console.log(translatableElements);

  return translatableElements;
}
