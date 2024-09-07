import { Asciidoctor, Document, Extensions, type ProcessorOptions } from 'asciidoctor';

class Pharos extends Asciidoctor {
  private html?: string | Document;

  constructor() {
    super();
    const pharos = this;

    this.Extensions.register(function () {
      const registry = this;
      registry.treeProcessor(function () {
        const dsl = this;
        dsl.process(function (document) {
          const treeProcessor = this;
          pharos.pharosTreeProcessor(treeProcessor, document);
        });
      })
    });
  }

  parse(content: string, options?: ProcessorOptions | undefined): void {
    this.html = this.convert(content, options) as string | Document | undefined;
    this.Block
  }

  private pharosTreeProcessor(treeProcessor: Extensions.TreeProcessor, document: Document) {
    // Recursively map sections to their note kinds down to five levels of depth.
    document.getSections();
  }
}