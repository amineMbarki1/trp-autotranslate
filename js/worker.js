import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers";

class Pipeline {
  static instance = null;
  static async getInstance(pgCallback = null) {
    if (this.instance === null) {
      this.instance = await pipeline(
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
  // The worker will only start processing when the message is posted
  let translator = await Pipeline.getInstance((x) => {
    // Send progress updates back to the main thread
    self.postMessage(x);
  });

  try {
    // Perform the translation when the message is received
    let output = await translator(event.data.text, {
      tgt_lang: event.data.tgt_lang,
      src_lang: event.data.src_lang,
    });

    // Send the completed translation back to the main thread
    self.postMessage({
      status: "complete",
      output: output,
    });
  } catch (error) {
    // Handle errors if something goes wrong
    self.postMessage({
      status: "error",
      error: error.message,
    });
  }
};
