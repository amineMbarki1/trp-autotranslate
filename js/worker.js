import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers";

class Pipeline {
  static instance = null;
  static async getInstance(pgCallback = null) {
    if (this.instance === null) {
      this.instance = pipeline(
        "translation",
        "Xenova/nllb-200-distilled-600M",
        {
          progress_callback: (progress) => {
            if (pgCallback) pgCallback(progress);
          },
        }
      );
    }

    return this.instance;
  }
}

onmessage = async function (event) {
  let translator = await Pipeline.getInstance((x) => {
    // Send progress updates back to the main thread
    self.postMessage(x);
  });

  try {
    // Perform the translation when the message is received
    self.postMessage({
      status: "update",
      id: event.data.id,
    });

    const sentences = event.data.text.match(/[^.!?]+[.!?]+/g) || [
      event.data.text,
    ];

    const translations = await Promise.all(
      sentences.map((sentence) =>
        translator(sentence, {
          tgt_lang: event.data.tgt_lang,
          src_lang: event.data.src_lang,
        })
      )
    );

    const output = translations.map((t) => t[0].translation_text).join(" ");

    // Send the completed translation back to the main thread
    self.postMessage({
      status: "complete",
      output: output,
      id: event.data.id,
    });
  } catch (error) {
    // Handle errors if something goes wrong
    self.postMessage({
      status: "error",
      error: error.message,
    });
  }
};
