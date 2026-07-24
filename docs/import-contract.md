# Text import contract

Imported `.txt` files are decoded by the browser's `File.text()` API and copied into the same source textarea used for pasted content. No separate importer or normalization path exists; both routes call the same parser and generator.
