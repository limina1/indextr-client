import NDK, { NDKEvent } from '@nostr-dev-kit/ndk';
import { getNdkInstance } from './ndk';
import asciidoctor, {
  AbstractBlock,
  AbstractNode,
  Asciidoctor,
  Block,
  Document,
  Extensions,
  Section,
  type ProcessorOptions
} from 'asciidoctor';
import he from 'he';
import { writable, type Writable } from 'svelte/store';

interface IndexMetadata {
  authors?: string[];
  version?: string;
  edition?: string;
  isbn?: string;
  publicationDate?: string;
  publisher?: string;
  summary?: string;
  coverImage?: string;
}

/**
 * @classdesc Pharos is an extension of the Asciidoctor class that adds Nostr Knowledge Base (NKB) 
 * features to core Asciidoctor functionality.  Asciidoctor is used to parse an AsciiDoc document
 * into an Abstract Syntax Tree (AST), and Phraos generates NKB events from the nodes in that tree.
 * @class
 * @augments Asciidoctor
 */
export default class Pharos {
  /**
   * Key to terminology used in the class:
   * 
   * Nostr Knowledge Base (NKB) entities:
   * - Zettel: Bite-sized pieces of text contained within kind 30041 events.
   * - Index: A kind 30040 event describing a collection of zettels or other Nostr events.
   * - Event: The generic term for a Nostr event.
   * 
   * Asciidoctor entities:
   * - Document: The entirety of an AsciiDoc document.  The document title is denoted by a level 0
   * header, and the document may contain metadata, such as author and edition, immediately below
   * the title.
   * - Section: A section of an AsciiDoc document demarcated by a header.  A section may contain
   * blocks and/or other sections.
   * - Block: A block of content within an AsciiDoc document.  Blocks are demarcated on either side
   * by newline characters.  Blocks may contain other blocks or inline content.  Blocks may be
   * images, paragraphs, sections, a document, or other types of content.
   * - Node: A unit of the parsed AsciiDoc document.  All blocks are nodes.  Nodes are related
   * hierarchically to form the Abstract Syntax Tree (AST) representation of the document.
   */

  private asciidoctor: Asciidoctor;

  private ndk: NDK;

  private blockCounter: number = 0;

  /**
   * The HTML content of the converted document.
   */
  private html?: string | Document;

  /**
   * The ID of the root node in the document.
   */
  private rootNodeId?: string;

  /**
   * The ID of the root index event generated for the document.
   */
  private rootIndexId?: string;

  /**
   * Metadata to be used to populate the tags on the root index event.
   */
  private rootIndexMetadata: IndexMetadata = {};

  /**
   * A map of node IDs to the nodes themselves.
   */
  private nodes: Map<string, AbstractNode> = new Map<string, AbstractNode>();

  /**
   * A map of node IDs to the integer event kind that will be used to represent the node.
   */
  private eventToKindMap: Map<string, number> = new Map<string, number>();

  /**
   * A map of index IDs to the IDs of the nodes they reference.
   */
  private indexToChildEventsMap: Map<string, Set<string>> = new Map<string, Set<string>>();

  /**
   * A map of node IDs to the Nostr event IDs of the events they generate.
   */
  private eventIds: Map<string, string> = new Map<string, string>();

  // #region Public API

  constructor(ndk: NDK) {
    this.asciidoctor = asciidoctor();

    this.ndk = ndk;

    const pharos = this;
    this.asciidoctor.Extensions.register(function () {
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
    this.html = this.asciidoctor.convert(content, options) as string | Document | undefined;
  }

  getEvents(pubkey: string): NDKEvent[] {
    const stack = this.stackEventNodes();
    return this.generateEvents(stack, pubkey);
  }

  /**
   * Gets the entire HTML content of the AsciiDoc document.
   * @returns The HTML content of the converted document.
   */
  getHtml(): string {
    return this.html?.toString() || '';
  }

  /**
   * @returns The ID of the root index of the converted document.
   * @remarks The root index ID may be used to retrieve metadata or children from the root index.
   */
  getRootIndexId(): string {
    return this.rootNodeId!;
  }

  /**
   * @returns The title, if available, from the metadata of the index with the given ID.
   */
  getIndexTitle(id: string): string | undefined {
    const section = this.nodes.get(id) as Section;
    const title = section.getTitle() ?? '';
    return he.decode(title);
  }

  /**
   * @returns The IDs of any child indices of the index with the given ID.
   */
  getChildIndexIds(id: string): string[] {
    return Array.from(this.indexToChildEventsMap.get(id)!)
      .filter(id => this.eventToKindMap.get(id) === 30040);
  }

  /**
   * @returns The IDs of any child zettels of the index with the given ID.
   */
  getChildZettelIds(id: string): string[] {
    return Array.from(this.indexToChildEventsMap.get(id)!)
      .filter(id => this.eventToKindMap.get(id) !== 30040);
  }

  /**
   * @returns The IDs of any child nodes in the order in which they should be rendered.
   */
  getOrderedChildIds(id: string): string[] {
    return Array.from(this.indexToChildEventsMap.get(id)!);
  }

  /**
   * @returns The content of the node with the given ID.  The presentation of the returned content
   * varies by the node's context.
   * @remarks By default, the content is returned as HTML produced by the
   * Asciidoctor converter.  However, other formats are returned for specific contexts:
   * - Paragraph: The content is returned as a plain string.
   */
  getContent(id: string): string {
    const block = this.nodes.get(id) as AbstractBlock;

    switch (block.getContext()) {
    case 'paragraph':
      return block.getContent() ?? '';
    }

    return block.convert();
  }

  /**
   * Resets the parser to its initial state, removing any parsed data.
   */
  reset(): void {
    this.blockCounter = 0;
    this.html = undefined;
    this.rootNodeId = undefined;
    this.rootIndexId = undefined;
    this.rootIndexMetadata = {};
    this.nodes.clear();
    this.eventToKindMap.clear();
    this.indexToChildEventsMap.clear();
    this.eventIds.clear();
  }

  // #endregion

  // #region Tree Processor Extensions

  /**
   * Walks the Asciidoctor Abstract Syntax Tree (AST) and performs the following mappings:
   * - Each node ID is mapped to the node itself.
   * - Each node ID is mapped to an integer event kind that will be used to represent the node.
   * - Each ID of a node containing children is mapped to the set of IDs of its children.
   */
  private treeProcessor(treeProcessor: Extensions.TreeProcessor, document: Document) {
    this.rootNodeId = document.getId();
    if (!this.rootNodeId) {
      this.rootNodeId = this.normalizeNodeId(document.getTitle() ?? 'root');
      document.setId(this.rootNodeId);
    }

    this.nodes.set(this.rootNodeId, document);
    this.eventToKindMap.set(this.rootNodeId, 30040);
    this.indexToChildEventsMap.set(this.rootNodeId, new Set<string>());

    /** FIFO queue (uses `Array.push()` and `Array.shift()`). */
    const nodeQueue: AbstractNode[] = document.getBlocks();

    while (nodeQueue.length > 0) {
      const block = nodeQueue.shift();
      if (!block) {
        continue;
      }

      if (block.getContext() === 'section') {
        const children = this.processSection(block as Section);
        nodeQueue.push(...children);
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
   * @remarks Sections are mapped as kind 30040 indexToChildEventsMap by default.
   */
  private processSection(section: Section): AbstractNode[] {
    let sectionId = section.getId();
    if (!sectionId) {
      sectionId = this.normalizeNodeId(section.getTitle() ?? `${section.getContext()}_${this.blockCounter++}`);
    }

    // Prevent duplicates.
    if (this.nodes.has(sectionId)) {
      return [];
    }

    this.nodes.set(sectionId, section);
    this.eventToKindMap.set(sectionId, 30040);  // Sections are indexToChildEventsMap by default.
    this.indexToChildEventsMap.set(sectionId, new Set<string>());

    const parentId = section.getParent()?.getId();
    if (!parentId) {
      return [];
    }

    // Add the section to its parent index.
    this.indexToChildEventsMap.get(parentId)?.add(sectionId);

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
    // Obtain or generate a unique ID for the block.
    let blockId = block.getId();
    if (!blockId) {
      blockId = `${this.normalizeNodeId(block.getContext())}_${this.blockCounter++}`;
      block.setId(blockId);
    }

    // Prevent duplicates.
    if (this.nodes.has(blockId)) {
      return;
    }

    this.nodes.set(blockId, block);
    this.eventToKindMap.set(blockId, 30041);  // Blocks are zettels by default.

    const parentId = block.getParent()?.getId();
    if (!parentId) {
      return;
    }

    // Add the block to its parent index.
    this.indexToChildEventsMap.get(parentId)?.add(blockId);
  }

  //#endregion

  // #region NDKEvent Generation

  /**
   * Generates a stack of node IDs such that processing them in LIFO order will generate any events
   * used by an index before generating that index itself.
   * @returns An array of node IDs in the order they should be processed to generate events.
   */
  private stackEventNodes(): string[] {
    const tempNodeIdStack: string[] = [this.rootNodeId!];
    const nodeIdStack: string[] = [];

    while (tempNodeIdStack.length > 0) {
      const parentId = tempNodeIdStack.pop()!;
      nodeIdStack.push(parentId);

      if (!this.indexToChildEventsMap.has(parentId)) {
        continue;
      }

      const childIds = Array.from(this.indexToChildEventsMap.get(parentId)!);
      tempNodeIdStack.push(...childIds);
    }

    return nodeIdStack;
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
      
      switch (this.eventToKindMap.get(nodeId!)) {
      case 30040:
        events.push(this.generateIndexEvent(nodeId!, pubkey));
        break;

      case 30041:
      default:
        // Kind 30041 (zettel) is currently the default kind for contentful events.
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
    const childTags = Array.from(this.indexToChildEventsMap.get(nodeId)!)
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

    // Add optional metadata to the root index event.
    if (nodeId === this.rootNodeId) {
      const document = this.nodes.get(nodeId) as Document;

      // Store the metadata so it is available if we need it later.
      this.rootIndexMetadata = {
        authors: document
          .getAuthors()
          .map(author => author.getName())
          .filter(name => name != null),
        version: document.getRevisionNumber(),
        edition: document.getRevisionRemark(),
        publicationDate: document.getRevisionDate(),
      };

      if (this.rootIndexMetadata.authors) {
        event.tags.push(['author', ...this.rootIndexMetadata.authors!]);
      }

      if (this.rootIndexMetadata.version || this.rootIndexMetadata.edition) {
        event.tags.push(
          [
            'version',
            this.rootIndexMetadata.version!,
            this.rootIndexMetadata.edition!
          ].filter(value => value != null)
        );
      }

      if (this.rootIndexMetadata.publicationDate) {
        event.tags.push(['published_on', this.rootIndexMetadata.publicationDate!]);
      }
    }

    // Event ID generation must be the last step.
    const eventId = event.getEventHash();  
    this.eventIds.set(nodeId, eventId);
    event.id = eventId;

    // Store the root index ID in case we need it later.
    if (nodeId === this.rootNodeId) {
      this.rootIndexId = eventId;
    }

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
      ['#d', nodeId],
      ...this.extractAndNormalizeWikilinks(content!),
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

  // #region Utility Functions

  private normalizeNodeId(input: string): string {
    return input
      .toLowerCase()
      .replace(/\s+/g, '_')  // Replace spaces with underscores.
      .replace(/[^a-z0-9\_]/g, '');  // Remove non-alphanumeric characters except underscores.
  }

  /**
   * Normalizes a string to lower-kebab-case.
   * @param input The string to normalize.
   * @returns The normalized string.
   */
  private normalizeDTag(input: string): string {
    return input
      .toLowerCase()
      .replace(/\s+/g, '-')  // Replace spaces with hyphens.
      .replace(/[^a-z0-9\-]/g, '');  // Remove non-alphanumeric characters except hyphens.
  }

  private extractAndNormalizeWikilinks(content: string): string[][] {
    const wikilinkPattern = /\[\[([^\]]+)\]\]/g;
    const wikilinks: string[][] = [];
    let match: RegExpExecArray | null;

    // TODO: Match custom-named wikilinks as defined in NIP-54.
    while ((match = wikilinkPattern.exec(content)) !== null) {
      const linkName = match[1];
      const normalizedText = this.normalizeDTag(linkName);
      wikilinks.push(['wikilink', normalizedText]);
    }

    return wikilinks;
  }

  // TODO: Add search-based wikilink resolution.

  // #endregion
}

export const parser: Writable<Pharos> = writable(new Pharos(getNdkInstance()));
