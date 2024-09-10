import NDK, { NDKEvent } from '@nostr-dev-kit/ndk';
import {
  AbstractBlock,
  AbstractNode,
  Asciidoctor,
  Block,
  Document,
  Extensions,
  Section,
  type ProcessorOptions
} from 'asciidoctor';

export default class Pharos extends Asciidoctor {
  private ndk: NDK;

  /**
   * The HTML content of the converted document.
   */
  private html?: string | Document;

  /**
   * The ID of the root node in the document.
   */
  private rootId?: string;

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

  /**
   * A map of node IDs to the Nostr event IDs of the events they generate.
   */
  private eventIds: Map<string, string> = new Map<string, string>();

  constructor(ndk: NDK) {
    super();

    this.ndk = ndk;

    const pharos = this;
    this.Extensions.register(function () {
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
  }

  getEvents(pubkey: string): NDKEvent[] {
    const stack = this.stackEventNodes(this.rootId!);
    return this.generateEvents(stack, pubkey);
  }

  getHtml(): string {
    return this.html?.toString() || '';
  }

  // #region Tree Processor Extensions

  /**
   * Walks the Asciidoctor Abstract Syntax Tree (AST) and performs the following mappings:
   * - Each node ID is mapped to the node itself.
   * - Each node ID is mapped to an integer event kind that will be used to represent the node.
   * - Each ID of a node containing children is mapped to the set of IDs of its children.
   */
  private treeProcessor(treeProcessor: Extensions.TreeProcessor, document: Document) {
    this.rootId = document.getId();
    this.nodes.set(this.rootId, document);
    this.kinds.set(this.rootId, 30040);
    this.indices.set(this.rootId, new Set<string>());

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

  //#endregion

  // #region NDKEvent Generation

  /**
   * Generates a stack of node IDs such that processing them in LIFO order will generate any events
   * used by an index before generating that index itself.
   * @param rootNodeId The ID of the node from which to start processing.
   * @returns An array of node IDs in the order they should be processed to generate events.
   */
  private stackEventNodes(rootNodeId: string): string[] {
    const traversalStack: string[] = [this.rootId!];
    const eventStack: string[] = [];

    while (traversalStack.length > 0) {
      const parentId = traversalStack.pop()!;
      eventStack.push(parentId);

      if (!this.indices.has(parentId)) {
        continue;
      }

      const childIds = Array.from(this.indices.get(parentId)!);
      traversalStack.push(...childIds);
    }

    return eventStack;
  }

  /**
   * Generates Nostr events for each node in the given stack.
   * @param nodeIdStack An array of node IDs ordered such that processing them in LIFO order will
   * produce any child event before it is required by a parent index event.
   * @param pubkey The public key (not encoded in npub form) of the user generating the events.
   * @returns An array of Nostr events.
   */
  private generateEvents(nodeIdStack: string[], pubkey: string): NDKEvent[] {
    const events: NDKEvent[] = [];

    while (nodeIdStack.length > 0) {
      const nodeId = nodeIdStack.pop();
      let event: NDKEvent;
      
      switch (this.kinds.get(nodeId!)) {
      case 30040:
        events.push(this.generateIndexEvent(nodeId!, pubkey));
        break;

      case 30041:
      default:
        // Kind 30041 is currently the default contentful kind.
        events.push(this.generateZettelEvent(nodeId!, pubkey));
        break;
      }
    }

    return events;
  }

  /**
   * Generates a kind 30040 index event for the node with the given ID.
   * @param nodeId The ID of the AsciiDoc document node from which to generate an index event.  The
   * node ID will be used as the event's unique d tag identifier.
   * @param pubkey The public key (not encoded in npub form) of the user generating the events.
   * @returns An unsigned NDKEvent with the requisite tags, including e tags pointing to each of its
   * children, and dated to the present moment.
   */
  private generateIndexEvent(nodeId: string, pubkey: string): NDKEvent {
    const title = (this.nodes.get(nodeId)! as AbstractBlock).getTitle();
    const childTags = Array.from(this.indices.get(nodeId)!)
      .map(id => ['#e', this.eventIds.get(id)!]);

    const event = new NDKEvent(this.ndk);
    event.kind = 30040;
    event.content = '';
    event.tags = [
      ['title', title!],
      ['#d', nodeId],
      ...childTags
    ];
    event.created_at = Date.now();
    event.pubkey = pubkey;

    // Event ID generation must be the last step.
    const eventId = event.getEventHash();  
    this.eventIds.set(nodeId, eventId);
    event.id = eventId;

    return event;
  }

  /**
   * Generates a kind 30041 zettel event for the node with the given ID.
   * @param nodeId The ID of the AsciiDoc document node from which to generate an index event.  The
   * node ID will be used as the event's unique d tag identifier.
   * @param pubkey The public key (not encoded in npub form) of the user generating the events.
   * @returns An unsigned NDKEvent containing the content of the zettel, the requisite tags, and
   * dated to the present moment.
   */
  private generateZettelEvent(nodeId: string, pubkey: string): NDKEvent {
    const title = (this.nodes.get(nodeId)! as Block).getTitle();
    const content = (this.nodes.get(nodeId)! as Block).getSource();  // AsciiDoc source content.

    const event = new NDKEvent(this.ndk);
    event.kind = 30041;
    event.content = content!;
    event.tags = [
      ['title', title!],
      ['#d', nodeId]
    ];
    event.created_at = Date.now();
    event.pubkey = pubkey;

    // Event ID generation must be the last step.
    const eventId = event.getEventHash();  
    this.eventIds.set(nodeId, eventId);
    event.id = eventId;

    return event;
  }

  // #endregion
}