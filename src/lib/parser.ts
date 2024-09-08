import { AbstractNode, Asciidoctor, Block, Document, Extensions, Section, type ProcessorOptions } from 'asciidoctor';

export default class Pharos extends Asciidoctor {
  private html?: string | Document;

  /**
   * A map of node IDs to the nodes themselves.
   */
  private nodes: Map<string, AbstractNode> = new Map<string, AbstractNode>();

  /**
   * A map of node IDs to the integer event kind that will be used to represent the node.
   */
  private kinds: Map<string, number> = new Map<string, number>();

  /**
   * A map of index IDs to the IDs of the nodes they reference.
   */
  private indices: Map<string, Set<string>> = new Map<string, Set<string>>();

  constructor() {
    super();
    const pharos = this;

    pharos.Extensions.register(function () {
      const registry = this;
      registry.treeProcessor(function () {
        const dsl = this;
        dsl.process(function (document) {
          const treeProcessor = this;
          pharos.treeProcessor(treeProcessor, document);
        });
      })
    });
  }

  parse(content: string, options?: ProcessorOptions | undefined): void {
    this.html = this.convert(content, options) as string | Document | undefined;
    this.Block
  }

  /**
   * Walks the Asciidoctor Abstract Syntax Tree (AST) and performs the following mappings:
   * - Each node ID is mapped to the node itself.
   * - Each node ID is mapped to an integer event kind that will be used to represent the node.
   * - Each ID of a node containing children is mapped to the set of IDs of its children.
   */
  private treeProcessor(treeProcessor: Extensions.TreeProcessor, document: Document) {
    const id = document.getId();
    this.nodes.set(id, document);
    this.kinds.set(id, 30040);
    this.indices.set(id, new Set<string>());

    /** FIFO queue (uses `Array.push()` and `Array.shift()`). */
    const queue: AbstractNode[] = document.getBlocks();

    while (queue.length > 0) {
      const block = queue.shift();
      if (!block) {
        continue;
      }

      if (block instanceof Section) {
        const children = this.processSection(block);
        queue.push(...children);
      } else {
        this.processBlock(block as Block);
      }
    }
  }

  /**
   * Processes a section of the Asciidoctor AST.
   * @param section The section to process.
   * @returns An array of the section's child nodes.  If there are no child nodes, returns an empty
   * array.
   * @remarks Sections are mapped as kind 30040 indices by default.
   */
  private processSection(section: Section): AbstractNode[] {
    const id = section.getId();

    // Prevent duplicates.
    if (this.nodes.has(id)) {
      return [];
    }

    this.nodes.set(id, section);
    this.kinds.set(id, 30040);  // Sections are indices by default.
    this.indices.set(id, new Set<string>());

    const parentId = section.getParent()?.getId();
    if (!parentId) {
      return [];
    }

    // Add the section to its parent index.
    this.indices.get(parentId)?.add(id);

    // Limit to 5 levels of section depth.
    if (section.getLevel() >= 5) {
      return [];
    }

    return section.getBlocks();
  }

  /**
   * Processes a block of the Asciidoctor AST.
   * @param block The block to process.
   * @remarks Blocks are mapped as kind 30041 zettels by default.
   */
  private processBlock(block: Block): void {
    const id = block.getId();

    // Prevent duplicates.
    if (this.nodes.has(id)) {
      return;
    }

    this.nodes.set(id, block);
    this.kinds.set(id, 30041);  // Blocks are zettels by default.

    const parentId = block.getParent()?.getId();
    if (!parentId) {
      return;
    }

    // Add the block to its parent index.
    this.indices.get(parentId)?.add(id);
  }
}