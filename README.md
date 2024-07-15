![Roman scrolls](https://i.nostr.build/M5qXa.jpg) 

# Alexandria

Alexandria is a Nostr Knowledge Base (NKB) and a reader for long-form articles. 
 
## Features 
 
### Elegant Design 
 
As Alexandria is targeted toward those who are trying to focus on longer, more-complex content, the design has been stripped down of any distracting elements or unnecessary details, so that the user can concentrate on the valuable information stored in the documents that they are viewing. Both light-mode and dark-mode are available. 
 
![Menu](https://i.nostr.build/4oAlm.png) 
 
![event display](https://i.nostr.build/KG2D2.png) 
 
![cards](https://i.nostr.build/Vwkl0.png) 
 
### Modular articles 
 
The specialty of this client is the ability to display long-form articles, particularly of the modular variety: event kinds [30040 and 30041](https://next.nostrudel.ninja/#/wiki/topic/nkbip-01). It will eventually also able to display wiki pages (event kind [30818](https://next.nostrudel.ninja/#/wiki/topic/nip-54)) and normal long-form articles (event kind [30023](https://next.nostrudel.ninja/#/wiki/topic/nip-23)). 
 
Modular articles are often referred to as the *Nostr eBook format*, with 30040 events containing the metadata and the ordered list of the 30041 notes, which contain the markdown-formatted content. 
 
### Write articles 
 
Alexandria features a markdown-upload facility, for you to transform your well-formatted text to Nostr events and publish them to your preferred relays. The GitCitadel relay is set as the default, to ensure that you have at least one relay that is sure to work. 
 
Simply make sure to structure the article content like so: 
 
``` 
# title (mind the space) 
 
## topic1 
 
text that you want displayed as content 
 
## topic2 
 
more text 
 
``` 

## Developing

Make sure that you have [Node.js](https://nodejs.org/en/download/package-manager) installed.

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
